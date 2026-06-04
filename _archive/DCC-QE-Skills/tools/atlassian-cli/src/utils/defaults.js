/**
 * Default URLs for TD Atlassian services.
 * These are common across all users and don't need to be configured in .env.
 * Environment variables can still override these defaults if needed.
 */

const DEFAULTS = {
  CONFLUENCE_URL: 'https://collaborate.td.com',
  JIRA_URL: 'https://track.td.com',
  JTMF_URL: 'https://jtmf.td.com',
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
