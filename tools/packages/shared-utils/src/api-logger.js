const fs = require('fs');
const path = require('path');

/**
 * Shared API Logger for Figma and Atlassian CLIs
 * 
 * Features:
 * - Structured JSON logging for easy parsing
 * - Automatic log rotation by date
 * - Separate logs per service (figma, jira, confluence)
 * - Integration-ready format (export to analytics/monitoring)
 * - Thread-safe append operations
 */

class APILogger {
  constructor(options = {}) {
    // Find workspace root (where .git exists)
    this.workspaceRoot = this._findWorkspaceRoot(options.workspaceRoot);
    this.logDir = path.join(this.workspaceRoot, '_logs_');
    this.enabled = options.enabled !== false && process.env.API_LOGGING !== 'false';
    this.maxLogSizeMB = options.maxLogSizeMB || 50; // Max size per log file (increased for detailed logging)
    this.maxLogDays = options.maxLogDays || 30; // Keep logs for 30 days
    this.logHeaders = options.logHeaders !== false; // Log request/response headers
    this.logPayloads = options.logPayloads !== false; // Log request/response bodies
    
    if (this.enabled) {
      this._ensureLogDir();
      this._scheduleCleanup();
    }
  }

  /**
   * Find workspace root by looking for .git directory
   */
  _findWorkspaceRoot(providedRoot) {
    if (providedRoot && fs.existsSync(providedRoot)) {
      return providedRoot;
    }

    let currentDir = process.cwd();
    const maxDepth = 10; // Prevent infinite loop
    
    for (let i = 0; i < maxDepth; i++) {
      if (fs.existsSync(path.join(currentDir, '.git'))) {
        return currentDir;
      }
      
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        break; // Reached root
      }
      currentDir = parentDir;
    }
    
    // Fallback to cwd
    return process.cwd();
  }

  /**
   * Ensure log directory exists
   */
  _ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.warn(`⚠ Could not create API log directory: ${error.message}`);
      this.enabled = false;
    }
  }

  /**
   * Get log file path for specific service and date
   */
  _getLogFile(service) {
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return path.join(this.logDir, `${service}-${date}.jsonl`);
  }

  /**
   * Check if log file needs rotation (size-based)
   */
  _shouldRotate(filePath) {
    try {
      if (!fs.existsSync(filePath)) return false;
      
      const stats = fs.statSync(filePath);
      const sizeMB = stats.size / (1024 * 1024);
      return sizeMB >= this.maxLogSizeMB;
    } catch (error) {
      return false;
    }
  }

  /**
   * Rotate log file by appending timestamp
   */
  _rotateLog(filePath) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const ext = path.extname(filePath);
      const base = filePath.replace(ext, '');
      const rotatedPath = `${base}-${timestamp}${ext}`;
      
      fs.renameSync(filePath, rotatedPath);
      return rotatedPath;
    } catch (error) {
      console.warn(`⚠ Could not rotate log file: ${error.message}`);
      return null;
    }
  }

  /**
   * Clean up old log files (older than maxLogDays)
   */
  _cleanupOldLogs() {
    if (!this.enabled) return;
    
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = this.maxLogDays * 24 * 60 * 60 * 1000; // Convert days to ms
      
      let deletedCount = 0;
      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;
        
        if (age > maxAge) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} old API log file(s)`);
      }
    } catch (error) {
      console.warn(`⚠ Error during log cleanup: ${error.message}`);
    }
  }

  /**
   * Schedule daily cleanup of old logs
   */
  _scheduleCleanup() {
    // Run cleanup on initialization
    this._cleanupOldLogs();
    
    // Schedule daily cleanup (every 24 hours)
    setInterval(() => {
      this._cleanupOldLogs();
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Sanitize sensitive data from headers and payloads
   */
  _sanitize(obj, isHeaders = false) {
    if (!obj) return null;
    
    const sanitized = JSON.parse(JSON.stringify(obj)); // Deep clone
    const sensitiveKeys = [
      'authorization', 'x-figma-token', 'x-atlassian-token', 
      'cookie', 'set-cookie', 'password', 'token', 'secret',
      'api-key', 'apikey', 'auth'
    ];
    
    const sanitizeValue = (value) => {
      if (typeof value === 'string' && value.length > 10) {
        return `${value.substring(0, 10)}...[REDACTED]`;
      }
      return '[REDACTED]';
    };
    
    const sanitizeObject = (obj) => {
      for (const key in obj) {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          obj[key] = sanitizeValue(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      }
    };
    
    sanitizeObject(sanitized);
    return sanitized;
  }

  /**
   * Truncate large payloads to prevent massive log files
   */
  _truncatePayload(payload, maxLength = 5000) {
    if (!payload) return null;
    
    const jsonStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
    if (jsonStr.length <= maxLength) {
      return payload;
    }
    
    return {
      _truncated: true,
      _originalLength: jsonStr.length,
      _preview: jsonStr.substring(0, maxLength) + '... [TRUNCATED]'
    };
  }

  /**
   * Log an API call
   * 
   * @param {Object} data - API call data
   * @param {string} data.service - Service name (figma, jira, confluence)
   * @param {string} data.method - HTTP method (GET, POST, etc.)
   * @param {string} data.endpoint - API endpoint/URL
   * @param {number} data.statusCode - HTTP status code
   * @param {number} data.responseTime - Response time in ms
   * @param {Object} data.requestHeaders - Request headers (optional)
   * @param {Object} data.responseHeaders - Response headers (optional)
   * @param {Object} data.requestPayload - Request body/payload (optional)
   * @param {Object} data.responsePayload - Response body/data (optional)
   * @param {Object} data.metadata - Additional metadata (optional)
   */
  log(data) {
    if (!this.enabled) return;

    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        service: data.service,
        method: data.method,
        endpoint: data.endpoint,
        statusCode: data.statusCode,
        responseTime: data.responseTime,
        success: data.statusCode >= 200 && data.statusCode < 300,
        error: data.error || null,
        
        // Request details
        request: {
          headers: this.logHeaders ? this._sanitize(data.requestHeaders, true) : null,
          payload: this.logPayloads ? this._truncatePayload(this._sanitize(data.requestPayload)) : null,
          contentType: data.requestHeaders?.['content-type'] || null,
          contentLength: data.requestHeaders?.['content-length'] || null
        },
        
        // Response details
        response: {
          headers: this.logHeaders ? this._sanitize(data.responseHeaders, true) : null,
          payload: this.logPayloads ? this._truncatePayload(this._sanitize(data.responsePayload)) : null,
          contentType: data.responseHeaders?.['content-type'] || null,
          contentLength: data.responseHeaders?.['content-length'] || null
        },
        
        // Additional metadata
        metadata: data.metadata || {},
        
        // Context for analytics
        user: process.env.USER || process.env.USERNAME || 'unknown',
        hostname: require('os').hostname(),
        pid: process.pid
      };

      const logFile = this._getLogFile(data.service);
      
      // Check if rotation needed
      if (this._shouldRotate(logFile)) {
        this._rotateLog(logFile);
      }

      // Append as JSON Lines format (one JSON object per line)
      fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
      
    } catch (error) {
      // Silent fail to avoid breaking CLI operations
      console.warn(`⚠ Failed to log API call: ${error.message}`);
    }
  }

  /**
   * Log a request start (returns a function to log completion)
   * 
   * @param {string} service - Service name
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} metadata - Additional metadata
   * @returns {Function} Completion logger function
   */
  startRequest(service, method, endpoint, metadata = {}) {
    const startTime = Date.now();
    
    return (statusCode, error = null) => {
      const responseTime = Date.now() - startTime;
      this.log({
        service,
        method,
        endpoint,
        statusCode,
        responseTime,
        error: error ? error.message : null,
        metadata
      });
    };
  }

  /**
   * Get statistics for a service (today's logs)
   * 
   * @param {string} service - Service name
   * @returns {Object} Statistics
   */
  getStats(service) {
    try {
      const logFile = this._getLogFile(service);
      if (!fs.existsSync(logFile)) {
        return { totalCalls: 0, successRate: 0, avgResponseTime: 0 };
      }

      const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l.trim());
      const logs = lines.map(line => JSON.parse(line));
      
      const totalCalls = logs.length;
      const successfulCalls = logs.filter(l => l.success).length;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls * 100).toFixed(2) : 0;
      const avgResponseTime = totalCalls > 0 
        ? (logs.reduce((sum, l) => sum + l.responseTime, 0) / totalCalls).toFixed(0)
        : 0;

      return {
        totalCalls,
        successfulCalls,
        failedCalls: totalCalls - successfulCalls,
        successRate: parseFloat(successRate),
        avgResponseTime: parseInt(avgResponseTime)
      };
    } catch (error) {
      console.warn(`⚠ Could not read stats: ${error.message}`);
      return { totalCalls: 0, successRate: 0, avgResponseTime: 0 };
    }
  }

  /**
   * Export logs for external analytics systems
   * 
   * @param {string} service - Service name
   * @param {Date} startDate - Start date (optional)
   * @param {Date} endDate - End date (optional)
   * @returns {Array} Array of log entries
   */
  exportLogs(service, startDate = null, endDate = null) {
    try {
      const files = fs.readdirSync(this.logDir);
      const serviceFiles = files.filter(f => f.startsWith(service + '-'));
      
      const allLogs = [];
      serviceFiles.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const lines = fs.readFileSync(filePath, 'utf8').split('\n').filter(l => l.trim());
        const logs = lines.map(line => JSON.parse(line));
        
        // Filter by date range if provided
        const filtered = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          if (startDate && logDate < startDate) return false;
          if (endDate && logDate > endDate) return false;
          return true;
        });
        
        allLogs.push(...filtered);
      });
      
      return allLogs.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
    } catch (error) {
      console.warn(`⚠ Could not export logs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get log directory path
   */
  getLogDir() {
    return this.logDir;
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

// Singleton instance
let instance = null;

/**
 * Get shared API logger instance
 */
function getAPILogger(options = {}) {
  if (!instance) {
    instance = new APILogger(options);
  }
  return instance;
}

module.exports = {
  APILogger,
  getAPILogger
};
