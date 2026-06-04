const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { getWorkspaceRoot, loadEnv } = require('../utils/env-loader');

loadEnv();

/**
 * List all attachments for a Jira issue.
 *
 * @param {string} issueKey - Jira issue key (e.g. CEAJ-3843)
 * @returns {Promise<{issueKey: string, summary: string, attachments: Array}>}
 */
async function listAttachments(issueKey) {
  const JiraClient = require('../api/jira-client');
  const jiraUrl = process.env.JIRA_URL || 'https://track.td.com';
  const client = new JiraClient({ baseURL: jiraUrl });

  const response = await client.client.get(`/issue/${issueKey}`, {
    params: { fields: 'attachment,summary' }
  });

  const fields = response.data.fields;
  const attachments = (fields.attachment || []).map(a => ({
    id: a.id,
    filename: a.filename,
    size: a.size,
    mimeType: a.mimeType,
    content: a.content,
    created: a.created,
    author: a.author?.displayName || 'unknown'
  }));

  return {
    issueKey,
    summary: fields.summary,
    attachments
  };
}

/**
 * Download all attachments for a Jira issue to the local cache.
 *
 * @param {string} issueKey - Jira issue key
 * @param {object} options
 * @param {boolean} options.fresh  - Re-download even if already cached
 * @param {string}  options.output - Override output directory
 * @param {boolean} options.silent - Suppress console output
 * @returns {Promise<{issueKey, downloaded, skipped, outputDir, total}>}
 */
async function downloadAttachments(issueKey, options = {}) {
  const workspaceRoot = getWorkspaceRoot();
  const projectKey = issueKey.split('-')[0];
  const outputDir = options.output
    ? path.resolve(options.output)
    : path.join(workspaceRoot, 'cache', 'jira', projectKey, issueKey, 'attachments');

  const { attachments, summary } = await listAttachments(issueKey);

  if (attachments.length === 0) {
    return { issueKey, summary, downloaded: [], skipped: [], outputDir, total: 0 };
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const token = process.env.JIRA_TOKEN;
  const downloaded = [];
  const skipped = [];
  const errors = [];

  for (const att of attachments) {
    const destPath = path.join(outputDir, att.filename);

    if (fs.existsSync(destPath) && !options.fresh) {
      skipped.push(att.filename);
      continue;
    }

    try {
      const response = await axios.get(att.content, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer'
      });
      fs.writeFileSync(destPath, response.data);
      downloaded.push(att.filename);
    } catch (err) {
      errors.push({ filename: att.filename, error: err.message });
    }
  }

  return {
    issueKey,
    summary,
    downloaded,
    skipped,
    errors,
    outputDir,
    total: attachments.length
  };
}

/**
 * Upload a file as an attachment to a Jira issue.
 *
 * @param {string} issueKey  - Jira issue key
 * @param {string} filePath  - Absolute or relative path to the file
 * @returns {Promise<Array>} - Jira attachment response array
 */
async function uploadAttachment(issueKey, filePath) {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  const jiraUrl = process.env.JIRA_URL || 'https://track.td.com';
  const token = process.env.JIRA_TOKEN;

  if (!token) {
    throw new Error('No JIRA_TOKEN found. Run: atl auth login');
  }

  const filename = path.basename(resolvedPath);
  const form = new FormData();
  form.append('file', fs.createReadStream(resolvedPath), filename);

  const response = await axios.post(
    `${jiraUrl}/rest/api/2/issue/${issueKey}/attachments`,
    form,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Atlassian-Token': 'no-check',
        ...form.getHeaders()
      }
    }
  );

  return response.data;
}

module.exports = { listAttachments, downloadAttachments, uploadAttachment };
