/**
 * Search Issues Core Tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../../src/api/jira-client', () => jest.fn());
jest.mock('../../src/utils/env-loader', () => ({
  getWorkspaceRoot: jest.fn(() => process.cwd())
}));

const JiraClient = require('../../src/api/jira-client');
const { searchIssues } = require('../../src/core/search-issues');

describe('searchIssues', () => {
  const mockIssues = [
    {
      key: 'CEAJ-100',
      fields: {
        summary: 'First issue',
        status: { name: 'In Progress' },
        issuetype: { name: 'Story' },
        priority: { name: 'High' },
        assignee: { displayName: 'Alice' },
        reporter: { displayName: 'Bob' }
      }
    },
    {
      key: 'CEAJ-101',
      fields: {
        summary: 'Second issue',
        status: { name: 'Done' },
        issuetype: { name: 'Bug' },
        priority: { name: 'Medium' },
        assignee: null,
        reporter: { displayName: 'Carol' }
      }
    }
  ];

  let tempDir;
  let baseOutputDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atl-search-issues-'));
    baseOutputDir = path.join(tempDir, 'jira');
    JiraClient.mockReset();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('stores individual issue JSON/meta and a JSON summary without writing markdown', async () => {
    JiraClient.mockImplementation(() => ({
      search: jest.fn().mockResolvedValue(mockIssues)
    }));

    const result = await searchIssues('project = CEAJ', {
      outputDir: baseOutputDir,
      silent: true,
      saveIndividual: true,
      saveSummary: true
    });

    const issueDir = path.join(baseOutputDir, 'CEAJ', 'CEAJ-100');
    const jsonPath = path.join(issueDir, 'CEAJ-100.json');
    const metaPath = path.join(issueDir, '.meta.json');
    const legacyMarkdownPath = path.join(issueDir, 'CEAJ-100.md');
    const summaryPath = result.paths.summaryPath;

    expect(result.success).toBe(true);
    expect(result.count).toBe(2);
    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(metaPath)).toBe(true);
    expect(fs.existsSync(legacyMarkdownPath)).toBe(false);
    expect(summaryPath.endsWith('.json')).toBe(true);
    expect(fs.existsSync(summaryPath)).toBe(true);

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    expect(metadata.analysisFile).toBe('CEAJ-100.analysis.md');

    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    expect(summary.analysisFile.endsWith('.analysis.md')).toBe(true);
    expect(summary.count).toBe(2);
    expect(summary.summaryByStatus).toEqual({
      'In Progress': 1,
      Done: 1
    });
    expect(summary.summaryByType).toEqual({
      Story: 1,
      Bug: 1
    });

    expect(result.issues[0]).toMatchObject({
      key: 'CEAJ-100',
      jsonPath,
      metaPath,
      analysisPath: path.join(issueDir, 'CEAJ-100.analysis.md')
    });
  });
});
