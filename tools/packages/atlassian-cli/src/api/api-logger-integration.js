/**
 * API Logger Integration for Atlassian CLI
 * 
 * This module wraps axios interceptors to log all Jira and Confluence API calls.
 * 
 * Usage:
 * Add to src/api/jira-client.js and src/api/confluence-client.js constructor:
 * const { setupAPILogging } = require('./api-logger-integration');
 * setupAPILogging(this.client, 'jira'); // or 'confluence'
 */

const { apiLogger } = require('@ea-workspace/shared-utils');
const { getAPILogger } = apiLogger;

/**
 * Setup API logging for axios client
 * 
 * @param {Object} axiosInstance - Axios instance to instrument
 * @param {string} service - Service name ('jira' or 'confluence')
 */
function setupAPILogging(axiosInstance, service) {
  const apiLogger = getAPILogger();
  
  // Map to store request start times
  const requestTimings = new Map();
  
  // Request interceptor - track start time
  axiosInstance.interceptors.request.use(
    (config) => {
      // Generate unique request ID
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      config.metadata = config.metadata || {};
      config.metadata.requestId = requestId;
      config.metadata.startTime = Date.now();
      
      requestTimings.set(requestId, {
        startTime: Date.now(),
        method: config.method.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL
      });
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor - log successful calls
  axiosInstance.interceptors.response.use(
    (response) => {
      const requestId = response.config.metadata?.requestId;
      const timing = requestTimings.get(requestId);
      
      if (timing) {
        const responseTime = Date.now() - timing.startTime;
        const endpoint = timing.baseURL 
          ? timing.url.replace(timing.baseURL, '')
          : timing.url;
        
        apiLogger.log({
          service,
          method: timing.method,
          endpoint: endpoint || timing.url,
          statusCode: response.status,
          responseTime,
          requestHeaders: response.config.headers,
          responseHeaders: response.headers,
          requestPayload: response.config.data,
          responsePayload: response.data,
          metadata: {
            requestId,
            statusText: response.statusText,
            dataSize: JSON.stringify(response.data || {}).length,
            // Atlassian-specific headers
            atlassianRequestId: response.headers['x-arequestid'] || response.headers['x-request-id']
          }
        });
        
        requestTimings.delete(requestId);
      }
      
      return response;
    },
    (error) => {
      // Log failed calls
      const requestId = error.config?.metadata?.requestId;
      const timing = requestTimings.get(requestId);
      
      if (timing) {
        const responseTime = Date.now() - timing.startTime;
        const endpoint = timing.baseURL 
          ? timing.url.replace(timing.baseURL, '')
          : timing.url;
        
        apiLogger.log({
          service,
          method: timing.method,
          endpoint: endpoint || timing.url,
          statusCode: error.response?.status || 0,
          responseTime,
          error: error.message,
          requestHeaders: error.config?.headers,
          responseHeaders: error.response?.headers,
          requestPayload: error.config?.data,
          responsePayload: error.response?.data,
          metadata: {
            requestId,
            errorCode: error.code,
            errorMessages: error.response?.data?.errorMessages,
            errors: error.response?.data?.errors,
            atlassianRequestId: error.response?.headers ? 
              (error.response.headers['x-arequestid'] || error.response.headers['x-request-id']) : 
              null
          }
        });
        
        requestTimings.delete(requestId);
      }
      
      return Promise.reject(error);
    }
  );
  
  // Cleanup old timings periodically (prevent memory leaks)
  setInterval(() => {
    const now = Date.now();
    for (const [requestId, timing] of requestTimings.entries()) {
      if (now - timing.startTime > 300000) { // 5 minutes
        requestTimings.delete(requestId);
      }
    }
  }, 60000); // Run every minute
}

/**
 * Get API stats for the service
 * 
 * @param {string} service - Service name ('jira' or 'confluence')
 * @returns {Object} Statistics
 */
function getAPIStats(service) {
  const apiLogger = getAPILogger();
  return apiLogger.getStats(service);
}

/**
 * Export API logs for analytics
 * 
 * @param {string} service - Service name ('jira' or 'confluence')
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Array} Array of log entries
 */
function exportAPILogs(service, startDate = null, endDate = null) {
  const apiLogger = getAPILogger();
  return apiLogger.exportLogs(service, startDate, endDate);
}

module.exports = {
  setupAPILogging,
  getAPIStats,
  exportAPILogs
};
