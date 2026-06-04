/**
 * Fetch Issue Core Tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../../src/api/jira-client', () => jest.fn());
jest.mock('../../src/utils/env-loader', () => ({
  getWorkspaceRoot: jest.fn(() => process.cwd())
}));

const JiraClient = require('../../src/api/jira-client');
const { fetchIssue } = require('../../src/core/fetch-issue');

describe('fetchIssue', () => {
  const mockIssue = {
    key: 'CEAJ-123',
    fields: {
      summary: 'Test issue summary',
      status: { name: 'In Progress' },
      updated: '2026-04-24T10:00:00.000Z',
      reporter: { displayName: 'Reporter' },
      assignee: { displayName: 'Assignee' },
      issuetype: { name: 'Story' },
      labels: [],
      components: []
    }
  };

  let tempDir;
  let baseOutputDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atl-fetch-issue-'));
    baseOutputDir = path.join(tempDir, 'jira', 'CEAJ');
    JiraClient.mockReset();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('stores JSON/meta only and returns an analysis path for agent-authored markdown', async () => {
    JiraClient.mockImplementation(() => ({
      getIssue: jest.fn().mockResolvedValue(mockIssue)
    }));

    const result = await fetchIssue('CEAJ-123', {
      useCache: false,
      outputDir: baseOutputDir,
      silent: true
    });

    const issueDir = path.join(baseOutputDir, 'CEAJ-123');
    const jsonPath = path.join(issueDir, 'CEAJ-123.json');
    const metaPath = path.join(issueDir, '.meta.json');
    const legacyMarkdownPath = path.join(issueDir, 'CEAJ-123.md');
    const analysisPath = path.join(issueDir, 'CEAJ-123.analysis.md');

    expect(result.success).toBe(true);
    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(metaPath)).toBe(true);
    expect(fs.existsSync(legacyMarkdownPath)).toBe(false);
    expect(result.paths).toEqual({
      outputDir: issueDir,
      jsonPath,
      metaPath,
      analysisPath
    });

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    expect(metadata.analysisFile).toBe('CEAJ-123.analysis.md');
  });

  it('removes legacy markdown files when a cached issue is still current', async () => {
    const issueDir = path.join(baseOutputDir, 'CEAJ-123');
    const metaPath = path.join(issueDir, '.meta.json');
    const jsonPath = path.join(issueDir, 'CEAJ-123.json');
    const legacyMarkdownPath = path.join(issueDir, 'CEAJ-123.md');

    fs.mkdirSync(issueDir, { recursive: true });
    fs.writeFileSync(metaPath, JSON.stringify({
      issueKey: 'CEAJ-123',
      lastFetch: '2026-04-24T10:00:00.000Z',
      summary: 'Test issue summary',
      status: 'In Progress',
      updated: '2026-04-24T10:00:00.000Z'
    }, null, 2));
    fs.writeFileSync(jsonPath, JSON.stringify(mockIssue, null, 2));
    fs.writeFileSync(legacyMarkdownPath, '# legacy markdown');

    JiraClient.mockImplementation(() => ({
      getIssueTimestamp: jest.fn().mockResolvedValue({
        key: 'CEAJ-123',
        updated: '2026-04-24T10:00:00.000Z'
      })
    }));

    const result = await fetchIssue('CEAJ-123', {
      useCache: true,
      outputDir: baseOutputDir,
      silent: true
    });

    expect(result.success).toBe(true);
    expect(result.cached).toBe(true);
    expect(fs.existsSync(legacyMarkdownPath)).toBe(false);
    expect(result.paths.analysisPath).toBe(path.join(issueDir, 'CEAJ-123.analysis.md'));
  });
});
