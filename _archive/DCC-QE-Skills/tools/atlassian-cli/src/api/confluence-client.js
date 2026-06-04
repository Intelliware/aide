const axios = require('axios');
const https = require('https');
const { loadEnv } = require('../utils/env-loader');
const { setupAPILogging } = require('./api-logger-integration');
const { getConfluenceUrl } = require('../utils/defaults');
loadEnv();


class ConfluenceClient {
  constructor(options = {}) {
    // Load from environment variables ONLY (from workspace root .env)
    this.baseURL = options.baseURL || getConfluenceUrl();
    this.token = options.token || process.env.CONFLUENCE_TOKEN || process.env.ATLASSIAN_TOKEN;

    if (!this.baseURL) {
      throw new Error('No Confluence URL found. Set CONFLUENCE_URL in workspace root .env file.');
    }

    if (!this.token) {
      throw new Error('No authentication token found. Set CONFLUENCE_TOKEN in workspace root .env file.');
    }

    // Use Bearer token authentication (for Confluence Data Center/Server)
    this.client = axios.create({
      baseURL: `${this.baseURL}/rest/api`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    // Setup API logging to file
    setupAPILogging(this.client, 'confluence');
    
    // Rate limit delay (milliseconds between requests)
    this.rateLimitDelay = options.rateLimitDelay || 200;
  }

  /**
   * Sleep to avoid rate limiting
   */
  async sleep(ms = this.rateLimitDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get page by ID
   */
  async getPage(pageId, expand = ['body.storage', 'version', 'space', 'history']) {
    const params = { expand: expand.join(',') };
    const response = await this.client.get(`/content/${pageId}`, { params });
    return response.data;
  }

  /**
   * Get only the version/timestamp for a page (lightweight cache check)
   * Much faster than getPage() - only fetches version metadata
   * Perfect for cache validation before full fetch
   * 
   * @param {string} pageId - Confluence page ID
   * @returns {Promise<{id: string, version: {number: number, when: string}}>}
   */
  async getPageTimestamp(pageId) {
    const params = { expand: 'version' };  // Only fetch version info
    const response = await this.client.get(`/content/${pageId}`, { params });
    return {
      id: response.data.id,
      version: {
        number: response.data.version.number,
        when: response.data.version.when
      }
    };
  }

  /**
   * Get page by space key and title
   */
  async getPageByTitle(spaceKey, title) {
    const params = {
      spaceKey,
      title,
      expand: 'body.storage,version,space,history'
    };
    const response = await this.client.get('/content', { params });
    
    if (response.data.results.length === 0) {
      throw new Error(`Page "${title}" not found in space ${spaceKey}`);
    }
    
    return response.data.results[0];
  }

  /**
   * Get all pages in a space
   */
  async getSpacePages(spaceKey, options = {}) {
    const pages = [];
    let start = 0;
    const limit = options.limit || 25;

    while (true) {
      const params = {
        spaceKey,
        type: 'page',
        expand: 'body.storage,version,space',
        start,
        limit
      };

      const response = await this.client.get('/content', { params });
      pages.push(...response.data.results);

      if (response.data.results.length < limit) {
        break;
      }

      start += limit;

      // Respect rate limits - don't fetch more than specified
      if (options.maxPages && pages.length >= options.maxPages) {
        break;
      }
      
      // Wait before next request to avoid rate limiting
      await this.sleep();
    }

    return pages.slice(0, options.maxPages);
  }

  /**
   * Get page tree (page and all descendants)
   */
  async getPageTree(pageId, options = {}) {
    const rootPage = await this.getPage(pageId);
    const pages = [rootPage];

    if (options.depth === 0) {
      return pages;
    }

    await this.sleep();
    const descendants = await this.getDescendants(pageId, options.depth || Infinity);
    pages.push(...descendants);

    return pages;
  }

  /**
   * Get all descendants of a page
   */
  async getDescendants(pageId, maxDepth = Infinity, currentDepth = 1) {
    if (currentDepth > maxDepth) {
      return [];
    }

    const params = {
      expand: 'body.storage,version,space'
    };

    const response = await this.client.get(`/content/${pageId}/child/page`, { params });
    const children = response.data.results;
    const descendants = [...children];

    for (const child of children) {
      await this.sleep();
      const childDescendants = await this.getDescendants(child.id, maxDepth, currentDepth + 1);
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  /**
   * Get all attachments for a page
   * @param {string} pageId - Page ID
   * @param {Object} options - Options for filtering
   * @param {string} options.filename - Filter by filename (supports wildcards)
   * @param {string} options.mediaType - Filter by media type (e.g., 'image/png')
   * @returns {Promise<Array>} Array of attachment objects
   */
  async getPageAttachments(pageId, options = {}) {
    const params = {
      expand: 'version',
      limit: 100
    };

    if (options.filename) {
      params.filename = options.filename;
    }
    if (options.mediaType) {
      params.mediaType = options.mediaType;
    }

    const response = await this.client.get(`/content/${pageId}/child/attachment`, { params });
    return response.data.results;
  }

  /**
   * Download an attachment
   * @param {string} downloadPathOrId - Download URL path (e.g., /download/attachments/123/file.png) or attachment ID
   * @returns {Promise<Buffer>} Attachment file data as buffer
   */
  async downloadAttachment(downloadPathOrId) {
    // If it starts with /, it's already a path; otherwise, construct path
    let downloadPath = downloadPathOrId.startsWith('/') 
      ? downloadPathOrId 
      : `/download/attachments/${downloadPathOrId}`;
    
    // Remove /rest/api prefix if present (download endpoints are at root level)
    downloadPath = downloadPath.replace(/^\/rest\/api/, '');
    
    // Make request with responseType 'arraybuffer' to get binary data
    // Use baseURL without /rest/api suffix for download
    const response = await this.client.get(downloadPath, {
      baseURL: this.baseURL,  // Use raw base URL without /rest/api
      responseType: 'arraybuffer'
    });
    
    return response.data;
  }

  /**
   * Search pages using CQL (Confluence Query Language)
   */
  async search(cql, options = {}) {
    const params = {
      cql,
      expand: 'body.storage,version,space',
      limit: options.limit || 25,
      start: options.start || 0
    };

    const response = await this.client.get('/content/search', { params });
    return response.data.results;
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await this.client.get('/user/current');
    return response.data;
  }

  /**
   * Parse Confluence URL to extract page ID
   */
  static parseUrl(url) {
    // Match patterns:
    // /pages/123456/Page+Title
    // /pages/viewpage.action?pageId=123456
    // /display/SPACE/Page+Title

    let pageId = null;
    let spaceKey = null;
    let title = null;

    // Extract pageId from URL
    const pageIdMatch = url.match(/pageId=(\d+)/);
    if (pageIdMatch) {
      pageId = pageIdMatch[1];
    }

    // Extract pageId from /pages/ path
    const pagesMatch = url.match(/\/pages\/(\d+)\//);
    if (pagesMatch) {
      pageId = pagesMatch[1];
    }

    // Extract space and title from /display/ path
    const displayMatch = url.match(/\/display\/([A-Z0-9]+)\/([^?#]+)/);
    if (displayMatch) {
      spaceKey = displayMatch[1];
      title = decodeURIComponent(displayMatch[2].replace(/\+/g, ' '));
    }

    return { pageId, spaceKey, title };
  }

  /**
   * Create a new Confluence page
   * @param {Object} pageData - Page data
   * @param {string} pageData.space - Space key
   * @param {string} pageData.title - Page title
   * @param {string} pageData.content - Page content (Confluence storage format or plain text)
   * @param {string} pageData.parentId - Parent page ID (optional)
   * @param {string} pageData.representation - Content representation type (storage, wiki, view)
   * @returns {Promise<Object>} Created page data with id, key, title
   */
  async createPage(pageData) {
    const { space, title, content, parentId, representation = 'storage' } = pageData;

    if (!space || !title || !content) {
      throw new Error('space, title, and content are required to create a page');
    }

    const payload = {
      type: 'page',
      title: title,
      space: {
        key: space
      },
      body: {
        [representation]: {
          value: content,
          representation: representation
        }
      }
    };

    // Add parent if specified
    if (parentId) {
      payload.ancestors = [{ id: parentId }];
    }

    const response = await this.client.post('/content', payload);
    return {
      id: response.data.id,
      key: response.data.key || response.data.id,
      title: response.data.title,
      space: response.data.space.key,
      url: `${this.baseURL}/pages/viewpage.action?pageId=${response.data.id}`
    };
  }

  /**
   * Update an existing Confluence page
   * @param {string} pageId - Page ID to update
   * @param {Object} updateData - Update data
   * @param {string} updateData.title - New page title (optional)
   * @param {string} updateData.content - New page content (optional)
   * @param {string} updateData.representation - Content representation type (storage, wiki, view)
   * @param {number} updateData.version - Version number to update (required, get from getPage)
   * @returns {Promise<Object>} Updated page data
   */
  async updatePage(pageId, updateData) {
    const { title, content, version, representation = 'storage' } = updateData;

    if (!version) {
      // Fetch current version if not provided
      const currentPage = await this.getPage(pageId, ['version']);
      updateData.version = currentPage.version.number + 1;
    }

    // Build update payload
    const payload = {
      version: {
        number: updateData.version
      },
      type: 'page'
    };

    if (title) {
      payload.title = title;
    }

    if (content) {
      payload.body = {
        [representation]: {
          value: content,
          representation: representation
        }
      };
    }

    const response = await this.client.put(`/content/${pageId}`, payload);
    return {
      id: response.data.id,
      title: response.data.title,
      version: response.data.version.number,
      url: `${this.baseURL}/pages/viewpage.action?pageId=${response.data.id}`
    };
  }
}

module.exports = ConfluenceClient;
