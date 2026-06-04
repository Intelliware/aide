const axios = require('axios');
const https = require('https');
const { loadEnv } = require('../utils/env-loader');
const { setupAPILogging } = require('./api-logger-integration');
const { getJiraUrl } = require('../utils/defaults');
loadEnv();

class JiraClient {
  constructor(options = {}) {
    // Load from environment variables ONLY (from workspace root .env)
    this.baseURL = options.baseURL || getJiraUrl();
    this.token = options.token || process.env.JIRA_TOKEN || process.env.ATLASSIAN_TOKEN;

    if (!this.baseURL) {
      throw new Error('No Jira URL found. Set JIRA_URL in workspace root .env file.');
    }

    if (!this.token) {
      throw new Error('No authentication token found. Set JIRA_TOKEN in workspace root .env file.');
    }

    // Use Bearer token authentication (for Jira Data Center/Server)
    this.client = axios.create({
      baseURL: `${this.baseURL}/rest/api/2`,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
    
    // Setup API logging to file
    setupAPILogging(this.client, 'jira');
    
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
   * Get issue by key (e.g., PROJ-123)
   */
  async getIssue(issueKey) {
    const params = {
      expand: 'renderedFields,names,schema,transitions,changelog,operations,editmeta'
    };
    const response = await this.client.get(`/issue/${issueKey}`, { params });
    return response.data;
  }

  /**
   * Get only the updated timestamp for an issue (lightweight cache check)
   * Much faster than getIssue() - only fetches updated field
   * Perfect for cache validation before full fetch
   * 
   * @param {string} issueKey - Issue key (e.g., DIGSTART-4645)
   * @returns {Promise<{key: string, updated: string}>} Issue key and updated timestamp
   */
  async getIssueTimestamp(issueKey) {
    const params = {
      fields: 'updated'  // Only fetch the updated timestamp field
    };
    const response = await this.client.get(`/issue/${issueKey}`, { params });
    return {
      key: response.data.key,
      updated: response.data.fields.updated
    };
  }

  /**
   * Search issues using JQL
   */
  async search(jql, options = {}) {
    const params = {
      jql,
      maxResults: options.maxResults || 50,
      startAt: options.startAt || 0,
      fields: options.fields || ['*all'],
      expand: options.expand || ['renderedFields']
    };

    const response = await this.client.post('/search', params);
    return response.data.issues;
  }

  /**
   * Get all issues for a sprint
   */
  async getSprintIssues(sprintId) {
    const jql = `Sprint = ${sprintId} ORDER BY rank ASC`;
    return await this.search(jql);
  }

  /**
   * Get epic and all child issues
   */
  async getEpicWithStories(epicKey) {
    const epic = await this.getIssue(epicKey);
    await this.sleep();
    const jql = `"Epic Link" = ${epicKey} ORDER BY rank ASC`;
    const stories = await this.search(jql);

    return {
      epic,
      stories
    };
  }

  /**
   * Get issues in a project
   */
  async getProjectIssues(projectKey, options = {}) {
    const jql = `project = ${projectKey} ORDER BY created DESC`;
    return await this.search(jql, options);
  }

  /**
   * Get issues assigned to a user
   */
  async getUserIssues(username, options = {}) {
    const jql = `assignee = "${username}" ORDER BY updated DESC`;
    return await this.search(jql, options);
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    const response = await this.client.get('/myself');
    return response.data;
  }

  /**
   * Get project information
   */
  async getProject(projectKey) {
    const response = await this.client.get(`/project/${projectKey}`);
    return response.data;
  }

  /**
   * Parse Jira URL to extract issue key
   */
  static parseUrl(url) {
    // Match patterns:
    // /browse/PROJ-123
    // /jira/software/projects/PROJ/issues/PROJ-123
    
    const browseMatch = url.match(/\/browse\/([A-Z]+-\d+)/);
    if (browseMatch) {
      return { issueKey: browseMatch[1] };
    }

    const issuesMatch = url.match(/\/issues\/([A-Z]+-\d+)/);
    if (issuesMatch) {
      return { issueKey: issuesMatch[1] };
    }

    // Try to extract from any query parameter
    const paramMatch = url.match(/[?&]selectedIssue=([A-Z]+-\d+)/);
    if (paramMatch) {
      return { issueKey: paramMatch[1] };
    }

    return { issueKey: null };
  }
}

module.exports = JiraClient;
