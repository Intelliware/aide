'use strict';
/**
 * issue-markdown.js
 *
 * Shared utilities for converting a cached Jira issue JSON into a structured
 * markdown document. Used by extract-deps.js and render-issue.js.
 */

const fs = require('fs');
const path = require('path');
const { getWorkspaceRoot } = require('./env-loader');
const { getJiraUrl } = require('./defaults');

// ─── Cache resolution ────────────────────────────────────────────────────────

function getCacheBaseDir() {
  const workspaceRoot = getWorkspaceRoot();
  const env = process.env.OUTPUT_DIR;
  return env
    ? (path.isAbsolute(env) ? env : path.join(workspaceRoot, env))
    : path.join(workspaceRoot, 'cache');
}

/**
 * Returns the path to a cached Jira issue JSON file.
 * @param {string} issueKey  e.g. "CEAJ-3843"
 * @returns {string}
 */
function getCacheJsonPath(issueKey) {
  const projectKey = issueKey.split('-')[0];
  return path.join(getCacheBaseDir(), 'jira', projectKey, issueKey, `${issueKey}.json`);
}

/**
 * Returns the default analysis markdown path inside the cache folder.
 * This matches the path the CLI already announces when fetching an issue.
 * @param {string} issueKey
 * @returns {string}
 */
function getDefaultMarkdownPath(issueKey) {
  const projectKey = issueKey.split('-')[0];
  return path.join(getCacheBaseDir(), 'jira', projectKey, issueKey, `${issueKey}.analysis.md`);
}

// ─── ADF → Markdown ──────────────────────────────────────────────────────────

/**
 * Recursively converts Atlassian Document Format (ADF) nodes to plain Markdown.
 * Falls back gracefully if the description is already a plain string.
 * @param {*} node
 * @returns {string}
 */
function adfToText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfToText).join('');

  switch (node.type) {
    case 'text':
      return node.text || '';
    case 'hardBreak':
      return '\n';
    case 'paragraph':
      return adfToText(node.content) + '\n\n';
    case 'heading': {
      const level = (node.attrs && node.attrs.level) || 2;
      return '#'.repeat(level) + ' ' + adfToText(node.content) + '\n\n';
    }
    case 'bulletList':
      return (node.content || []).map(item => '- ' + adfToText(item.content).trim()).join('\n') + '\n';
    case 'orderedList':
      return (node.content || [])
        .map((item, i) => `${i + 1}. ` + adfToText(item.content).trim())
        .join('\n') + '\n';
    case 'listItem':
      return adfToText(node.content);
    case 'codeBlock':
      return '```\n' + adfToText(node.content) + '\n```\n';
    case 'blockquote':
      return '> ' + adfToText(node.content).replace(/\n/g, '\n> ') + '\n';
    case 'table':
      return (node.content || []).map(row => {
        const cells = (row.content || []).map(cell => adfToText(cell.content).trim()).join(' | ');
        return `| ${cells} |`;
      }).join('\n') + '\n';
    default:
      return node.content ? adfToText(node.content) : '';
  }
}

function extractDescription(field, maxLen = 4000) {
  let text = '';
  if (!field) {
    text = '';
  } else if (typeof field === 'string') {
    text = field.trim();
  } else if (field.content) {
    text = adfToText(field).trim();
  }
  if (!text) return '_No description provided._';
  if (text.length > maxLen) {
    return text.substring(0, maxLen) + '\n\n_[truncated — see full JSON in cache]_';
  }
  return text;
}

// ─── Attachments section ─────────────────────────────────────────────────────

/**
 * Builds an ## Attachments markdown section for a dependency file,
 * checking whether each file is already present in the cache.
 * @param {string} issueKey
 * @param {Array}  attachmentFields  raw Jira attachment field array
 * @returns {string}  markdown section or empty string if none
 */
function buildAttachmentsSection(issueKey, attachmentFields) {
  if (!attachmentFields || attachmentFields.length === 0) return '';

  const projectKey = issueKey.split('-')[0];
  const attachDir  = path.join(getCacheBaseDir(), 'jira', projectKey, issueKey, 'attachments');

  const rows = attachmentFields.map(att => {
    const filename = att.filename || att.id || 'unknown';
    const size     = att.size ? `${Math.round(att.size / 1024)} KB` : '-';
    const ext      = path.extname(filename).toLowerCase();
    const cached   = fs.existsSync(path.join(attachDir, filename));
    const mdFile   = path.join(attachDir, filename.replace(/\.[^.]+$/, '.md'));
    const converted = fs.existsSync(mdFile);

    const cachedMark    = cached    ? '✅' : '[ ] run `atl j attachments ' + issueKey + '`';
    const convertedMark = !cached   ? '-'
      : converted       ? `✅ [.md](${path.relative(getWorkspaceRoot(), mdFile).replace(/\\/g, '/')})`
      : ['.pdf', '.docx', '.doc', '.pptx', '.ppt'].includes(ext) ? '[ ] use `pdf-convert` or `word-convert` skill' : 'n/a';

    return `| ${filename} | ${size} | ${cachedMark} | ${convertedMark} |`;
  });

  return [
    '',
    '## Attachments',
    '',
    '| File | Size | Cached | Converted to .md |',
    '|------|------|--------|------------------|',
    ...rows,
  ].join('\n');
}

// ─── Issue links section ─────────────────────────────────────────────────────

function buildLinksSection(fields) {
  const links = fields.issuelinks || [];
  if (links.length === 0) return '';

  const rows = links.map(link => {
    const type    = link.type && link.type.name     ? link.type.name : '-';
    const dir     = link.outwardIssue               ? 'outward'      : 'inward';
    const related = link.outwardIssue || link.inwardIssue;
    const key     = related ? related.key           : '-';
    const summary = related && related.fields ? (related.fields.summary || '-') : '-';
    const status  = related && related.fields && related.fields.status
      ? related.fields.status.name : '-';
    const jiraBaseUrl = getJiraUrl() || 'https://your-jira.atlassian.net';
    return `| ${type} (${dir}) | [${key}](${jiraBaseUrl}/browse/${key}) | ${summary} | ${status} |`;
  });

  return [
    '',
    '## Issue Links',
    '',
    '| Relationship | Key | Summary | Status |',
    '|---|---|---|---|',
    ...rows,
  ].join('\n');
}

// ─── Main builder ────────────────────────────────────────────────────────────

/**
 * Converts a raw Jira issue API response object to a structured markdown string.
 * @param {string} issueKey
 * @param {object} raw  Full Jira REST API response (fields at root level)
 * @returns {string}
 */
function buildMarkdown(issueKey, raw) {
  const f = raw.fields || {};

  const summary  = f.summary || issueKey;
  const status   = (f.status    && f.status.name)    || 'Unknown';
  const type     = (f.issuetype && f.issuetype.name) || 'Unknown';
  const priority = (f.priority  && f.priority.name)  || '-';
  const assignee = f.assignee
    ? (f.assignee.displayName || f.assignee.name || 'Unassigned')
    : 'Unassigned';
  const reporter = f.reporter
    ? (f.reporter.displayName || f.reporter.name || '-')
    : '-';
  const created  = (f.created || '').substring(0, 10);
  const updated  = (f.updated || '').substring(0, 10);
  const labels   = (f.labels || []).join(', ') || '-';
  const jiraUrl  = `${getJiraUrl() || 'https://your-jira.atlassian.net'}/browse/${issueKey}`;

  const descText = extractDescription(f.description);

  // Last 3 comments
  const commentList = (f.comment && f.comment.comments) || [];
  let commentsSection = '';
  if (commentList.length > 0) {
    const last3 = commentList.slice(-3);
    commentsSection = '\n\n## Recent Comments\n\n' + last3.map(c => {
      const author  = c.author ? (c.author.displayName || c.author.name) : 'Unknown';
      const date    = (c.created || '').substring(0, 10);
      const body    = extractDescription(c.body, 500);
      return `**${author}** (${date}):\n> ${body.replace(/\n/g, '\n> ')}`;
    }).join('\n\n');
  }

  const linksSection       = buildLinksSection(f);
  const attachmentsSection = buildAttachmentsSection(issueKey, f.attachment);

  return [
    '---',
    `jira_key: ${issueKey}`,
    `title: "${summary.replace(/"/g, "'")}"`,
    `type: ${type}`,
    `status: ${status}`,
    `priority: ${priority}`,
    `assignee: "${assignee}"`,
    `reporter: "${reporter}"`,
    `created: ${created}`,
    `updated: ${updated}`,
    `jira_url: ${jiraUrl}`,
    '---',
    '',
    `# ${issueKey} — ${summary}`,
    '',
    `**Type**: ${type} | **Status**: ${status} | **Priority**: ${priority}  `,
    `**Assignee**: ${assignee} | **Reporter**: ${reporter}  `,
    `**Created**: ${created} | **Updated**: ${updated}  `,
    `**Labels**: ${labels}`,
    '',
    `**Jira**: [${issueKey}](${jiraUrl})`,
    '',
    '---',
    '',
    '## Description',
    '',
    descText,
    commentsSection,
    linksSection,
    attachmentsSection,
  ].join('\n');
}

module.exports = {
  getCacheBaseDir,
  getCacheJsonPath,
  getDefaultMarkdownPath,
  adfToText,
  extractDescription,
  buildMarkdown,
  buildAttachmentsSection,
  buildLinksSection,
};
