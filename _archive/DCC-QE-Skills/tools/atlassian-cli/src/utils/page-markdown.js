'use strict';

const TurndownService = require('turndown');

function createTurndown() {
  const service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
  });

  service.remove(['script', 'style']);

  service.addRule('confluenceMacro', {
    filter(node) {
      return Boolean(node.nodeName && String(node.nodeName).toLowerCase().includes('structured-macro'));
    },
    replacement(_content, node) {
      const name = node.getAttribute && (node.getAttribute('ac:name') || node.getAttribute('name'));
      return name ? `\n> [Confluence macro: ${name}]\n` : '\n';
    }
  });

  service.addRule('confluencePlainTextBody', {
    filter(node) {
      return Boolean(node.nodeName && String(node.nodeName).toLowerCase().includes('plain-text-body'));
    },
    replacement(content) {
      const text = (content || '').trim();
      return text ? `\n\n\`\`\`\n${text}\n\`\`\`\n\n` : '\n';
    }
  });

  return service;
}

function normalizeMarkdown(markdown) {
  return (markdown || '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToMarkdown(html) {
  if (!html) return '_No page body found._';
  const turndown = createTurndown();
  const markdown = turndown.turndown(html);
  return normalizeMarkdown(markdown) || '_No page body found._';
}

function buildJiraSection(jiraIssues = []) {
  if (!jiraIssues.length) return '';

  const lines = [
    '## Referenced Jira Issues',
    '',
    '| Key | Status | Assignee | Summary |',
    '|---|---|---|---|',
    ...jiraIssues.map(issue => `| [${issue.key}](${issue.url}) | ${issue.status || '-'} | ${issue.assignee || 'Unassigned'} | ${(issue.summary || '').replace(/\|/g, '\\|')} |`),
  ];

  return lines.join('\n');
}

function buildMarkdown(page, meta = {}, jiraIssues = []) {
  const title = page?.title || meta.title || `Confluence Page ${meta.pageId || ''}`.trim();
  const pageId = page?.id || meta.pageId || '';
  const space = page?.space?.key || meta.space || '';
  const version = page?.version?.number || meta.version || '';
  const updated = page?.version?.when || meta.updated || '';
  const url = meta.url || (page?._links?.base && page?._links?.webui ? `${page._links.base}${page._links.webui}` : '');
  const bodyHtml = page?.body?.storage?.value || '';
  const bodyMarkdown = htmlToMarkdown(bodyHtml);
  const jiraSection = buildJiraSection(jiraIssues);

  return [
    '---',
    `page_id: ${pageId}`,
    `title: "${String(title).replace(/"/g, "'")}"`,
    `space: ${space}`,
    `version: ${version}`,
    `updated: ${updated}`,
    `url: ${url}`,
    '---',
    '',
    `# ${title}`,
    '',
    `**Page ID**: ${pageId}  `,
    `**Space**: ${space}  `,
    version ? `**Version**: ${version}  ` : '',
    updated ? `**Updated**: ${updated}  ` : '',
    url ? `**Confluence**: [Open page](${url})` : '',
    '',
    '---',
    '',
    '## Content',
    '',
    bodyMarkdown,
    jiraSection ? `\n\n${jiraSection}` : '',
    '',
  ].filter(Boolean).join('\n');
}

module.exports = {
  htmlToMarkdown,
  buildMarkdown,
};
