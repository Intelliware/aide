const fs = require('fs');
const path = require('path');
const { getWorkspaceRoot } = require('./env-loader');

/**
 * Cache manager for the real workspace cache directory.
 * Reads from the same cache/jira/ and cache/confluence/ directories
 * that are populated by fetch-issue.js and fetch-page.js.
 */
class Cache {
  constructor(options = {}) {
    if (options.cacheDir) {
      this.cacheDir = options.cacheDir;
    } else {
      const workspaceRoot = getWorkspaceRoot();
      const outputDir = process.env.OUTPUT_DIR
        ? (path.isAbsolute(process.env.OUTPUT_DIR)
            ? process.env.OUTPUT_DIR
            : path.join(workspaceRoot, process.env.OUTPUT_DIR))
        : path.join(workspaceRoot, 'cache');
      this.cacheDir = outputDir;
    }
  }

  /**
   * Walk a directory recursively and find all .meta.json files.
   * @returns {Array<{metaPath: string, dir: string}>}
   */
  _findMetaFiles(baseDir) {
    const results = [];
    if (!fs.existsSync(baseDir)) return results;

    const walk = (dir) => {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        if (entry.isDirectory()) {
          walk(path.join(dir, entry.name));
        } else if (entry.name === '.meta.json') {
          results.push({ metaPath: path.join(dir, entry.name), dir });
        }
      }
    };

    walk(baseDir);
    return results;
  }

  /**
   * Calculate total size (bytes) of all files in a directory recursively.
   */
  _dirSize(dir) {
    let total = 0;
    if (!fs.existsSync(dir)) return total;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          total += this._dirSize(fullPath);
        } else {
          try { total += fs.statSync(fullPath).size; } catch {}
        }
      }
    } catch {}
    return total;
  }

  /**
   * List all cached items by reading their .meta.json files.
   * @returns {Promise<Array<{path, title, type, lastFetch, key}>>}
   */
  async list() {
    const metaFiles = this._findMetaFiles(this.cacheDir);
    const items = [];

    for (const { metaPath, dir } of metaFiles) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        const normalizedDir = dir.replace(/\\/g, '/');
        const isConfluence = normalizedDir.includes('/confluence/');
        items.push({
          path: dir,
          title: meta.title || meta.summary || meta.issueKey || meta.pageId || path.basename(dir),
          type: isConfluence ? 'confluence' : 'jira',
          lastFetch: meta.lastFetch || null,
          key: meta.issueKey || meta.pageId || null
        });
      } catch {
        // Unreadable meta — skip
      }
    }

    return items;
  }

  /**
   * Get cache statistics.
   * @returns {Promise<{total, confluence, jira, size, sizeFormatted, location}>}
   */
  async stats() {
    const items = await this.list();
    const totalSize = this._dirSize(this.cacheDir);

    return {
      total: items.length,
      confluence: items.filter(i => i.type === 'confluence').length,
      jira: items.filter(i => i.type === 'jira').length,
      size: totalSize,
      sizeFormatted: formatBytes(totalSize),
      location: this.cacheDir
    };
  }

  /**
   * Clear all cached item directories and search result files.
   * @returns {Promise<number>} Count of removed entries
   */
  async clear() {
    const items = await this.list();
    let count = 0;

    for (const item of items) {
      try {
        fs.rmSync(item.path, { recursive: true, force: true });
        count++;
      } catch {}
    }

    // Also clear search result JSON files
    const searchesDir = path.join(this.cacheDir, 'jira', '_searches');
    if (fs.existsSync(searchesDir)) {
      try {
        const files = fs.readdirSync(searchesDir);
        for (const file of files) {
          if (file.endsWith('.json') || file.endsWith('.md')) {
            fs.unlinkSync(path.join(searchesDir, file));
            count++;
          }
        }
      } catch {}
    }

    return count;
  }
}

/**
 * Format bytes to human readable size
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = Cache;
