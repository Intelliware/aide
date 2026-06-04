/**
 * Update Issue Module
 * Handles updating existing Jira issues with field data
 */

const axios = require('axios');
const https = require('https');
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

class IssueUpdater {
  constructor(config) {
    this.jiraUrl = config.jiraUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    
    this.client = axios.create({
      baseURL: this.jiraUrl,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Load project-specific field mapping
   */
  loadFieldMapping(projectKey) {
    const mappingDir = path.join(__dirname, '../field-mappings');
    const projectMappingPath = path.join(mappingDir, `${projectKey}.json`);
    const defaultMappingPath = path.join(mappingDir, '_default.json');

    let mapping = {};
    
    // Try project-specific mapping first
    if (fs.existsSync(projectMappingPath)) {
      mapping = JSON.parse(fs.readFileSync(projectMappingPath, 'utf-8'));
    } else if (fs.existsSync(defaultMappingPath)) {
      mapping = JSON.parse(fs.readFileSync(defaultMappingPath, 'utf-8'));
    }

    return mapping;
  }

  /**
   * Update issue with provided data
   * @param {string} issueKey - Issue key (e.g., 'CEAJ-123')
   * @param {Object} issueData - Issue data to update
   * @param {Object} options - Additional options (silent, etc.)
   */
  async updateIssue(issueKey, issueData, options = {}) {
    const spinner = options.silent ? null : ora(`Updating ${issueKey}...`).start();

    try {
      // Extract project key from issue key
      const projectKey = issueKey.split('-')[0];

      // Build update payload
      const updatePayload = {
        fields: {}
      };

      // Copy all fields from issueData
      Object.keys(issueData).forEach(key => {
        if (key !== 'key' && key !== 'id') {
          updatePayload.fields[key] = issueData[key];
        }
      });

      // Make the API request to update issue
      const response = await this.client.put(
        `/rest/api/2/issue/${issueKey}`,
        updatePayload
      );

      if (spinner) {
        spinner.succeed(chalk.green(`Issue ${issueKey} updated successfully`));
      }

      return {
        success: true,
        key: issueKey,
        response: response.data
      };

    } catch (error) {
      if (spinner) {
        spinner.fail(chalk.red('Failed to update issue'));
      }

      // Extract error details
      let errorMessage = error.message;
      if (error.response) {
        if (error.response.data && error.response.data.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.keys(errors).map(field => 
            `${field}: ${errors[field]}`
          ).join(', ');
        } else if (error.response.data && error.response.data.errorMessages) {
          errorMessage = error.response.data.errorMessages.join(', ');
        }
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Update issue from JSON data string
   * @param {string} issueKey - Issue key
   * @param {string} jsonData - JSON string of issue data
   * @param {Object} options - Additional options
   */
  async updateFromJson(issueKey, jsonData, options = {}) {
    let issueData;
    
    try {
      issueData = JSON.parse(jsonData);
    } catch (error) {
      throw new Error(`Invalid JSON data: ${error.message}`);
    }

    return await this.updateIssue(issueKey, issueData, options);
  }

  /**
   * Get issue to verify it exists before updating
   * @param {string} issueKey - Issue key
   */
  async verifyIssueExists(issueKey) {
    try {
      const response = await this.client.get(
        `/rest/api/2/issue/${issueKey}`,
        {
          params: {
            fields: 'summary,status'
          }
        }
      );
      return {
        exists: true,
        summary: response.data.fields.summary,
        status: response.data.fields.status.name
      };
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return { exists: false };
      }
      throw error;
    }
  }
}

module.exports = IssueUpdater;
