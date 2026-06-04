/**
 * Default URLs for Atlassian services.
 * These should be configured in .env - see .env.example for reference.
 * Environment variables take precedence over these defaults.
 */

const DEFAULTS = {
  CONFLUENCE_URL: null,
  JIRA_URL: null,
  JTMF_URL: null,
};

/**
 * Get Confluence URL (env override > default)
 */
function getConfluenceUrl() {
  return process.env.CONFLUENCE_URL || process.env.ATLASSIAN_URL || DEFAULTS.CONFLUENCE_URL;
}

/**
 * Get Jira URL (env override > default)
 */
function getJiraUrl() {
  return process.env.JIRA_URL || process.env.ATLASSIAN_URL || DEFAULTS.JIRA_URL;
}

/**
 * Get JTMF URL (env override > default)
 */
function getJtmfUrl() {
  return process.env.JTMF_URL || DEFAULTS.JTMF_URL;
}

module.exports = {
  DEFAULTS,
  getConfluenceUrl,
  getJiraUrl,
  getJtmfUrl,
};
