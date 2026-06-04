const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const { getWorkspaceRoot, loadEnv } = require('../utils/env-loader');

loadEnv();

/**
 * List all attachments for a Confluence page.
 *
 * @param {string} pageId - Confluence page ID (numeric string)
 * @returns {Promise<{pageId: string, title: string, attachments: Array}>}
 */
async function listAttachments(pageId) {
  const ConfluenceClient = require('../api/confluence-client');
  const confluenceUrl = process.env.CONFLUENCE_URL || 'https://collaborate.td.com';
  const client = new ConfluenceClient({ baseURL: confluenceUrl });

  // Fetch page title
  let title = pageId;
  try {
    const pageResp = await client.client.get(`/content/${pageId}`, {
      params: { fields: 'title' }
    });
    title = pageResp.data.title;
  } catch (_) {
    // Fall back to using pageId as title
  }

  // Fetch all attachment records (paginate if needed)
  const attachments = [];
  let start = 0;
  const limit = 100;

  while (true) {
    const response = await client.client.get(`/content/${pageId}/child/attachment`, {
      params: { expand: 'version,metadata,extensions', limit, start }
    });

    const results = response.data.results || [];
    for (const a of results) {
      attachments.push({
        id: a.id,
        filename: a.title,
        size: a.extensions?.fileSize,
        mimeType: a.extensions?.mediaType,
        downloadPath: a._links?.download,
        created: a.version?.when,
        author: a.version?.by?.displayName || 'unknown'
      });
    }

    const total = response.data.size;
    start += results.length;
    if (start >= total || results.length === 0) break;
  }

  return { pageId, title, attachments };
}

/**
 * Download all attachments for a Confluence page to the local cache.
 *
 * @param {string} pageId   - Confluence page ID
 * @param {object} options
 * @param {boolean} options.fresh  - Re-download even if already cached
 * @param {string}  options.output - Override output directory
 * @param {boolean} options.silent - Suppress console output
 * @returns {Promise<{pageId, title, downloaded, skipped, errors, outputDir, total}>}
 */
async function downloadAttachments(pageId, options = {}) {
  const workspaceRoot = getWorkspaceRoot();
  const outputDir = options.output
    ? path.resolve(options.output)
    : path.join(workspaceRoot, 'cache', 'confluence', pageId, 'attachments');

  const { title, attachments } = await listAttachments(pageId);

  if (attachments.length === 0) {
    return { pageId, title, downloaded: [], skipped: [], errors: [], outputDir, total: 0 };
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const confluenceUrl = process.env.CONFLUENCE_URL || 'https://collaborate.td.com';
  const token = process.env.CONFLUENCE_TOKEN;
  const downloaded = [];
  const skipped = [];
  const errors = [];

  for (const att of attachments) {
    const destPath = path.join(outputDir, att.filename);

    if (fs.existsSync(destPath) && !options.fresh) {
      skipped.push(att.filename);
      continue;
    }

    // downloadPath is a relative path like /download/attachments/...
    const downloadUrl = att.downloadPath
      ? (att.downloadPath.startsWith('http') ? att.downloadPath : `${confluenceUrl}${att.downloadPath}`)
      : null;

    if (!downloadUrl) {
      errors.push({ filename: att.filename, error: 'No download URL available' });
      continue;
    }

    try {
      const response = await axios.get(downloadUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer'
      });
      fs.writeFileSync(destPath, response.data);
      downloaded.push(att.filename);
    } catch (err) {
      errors.push({ filename: att.filename, error: err.message });
    }
  }

  return { pageId, title, downloaded, skipped, errors, outputDir, total: attachments.length };
}

/**
 * Upload a file as an attachment to a Confluence page.
 *
 * @param {string} pageId   - Confluence page ID
 * @param {string} filePath - Absolute or relative path to the file
 * @param {object} options
 * @param {string} options.comment - Optional comment for the attachment version
 * @returns {Promise<object>} - Confluence attachment response
 */
async function uploadAttachment(pageId, filePath, options = {}) {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  const confluenceUrl = process.env.CONFLUENCE_URL || 'https://collaborate.td.com';
  const token = process.env.CONFLUENCE_TOKEN;

  if (!token) {
    throw new Error('No CONFLUENCE_TOKEN found. Run: atl auth login');
  }

  const filename = path.basename(resolvedPath);
  const form = new FormData();
  form.append('file', fs.createReadStream(resolvedPath), filename);
  if (options.comment) {
    form.append('comment', options.comment);
  }
  form.append('minorEdit', 'true');

  const response = await axios.post(
    `${confluenceUrl}/rest/api/content/${pageId}/child/attachment`,
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
