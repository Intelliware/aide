/**
 * Fetch Page Core Tests
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

jest.mock('../../src/api/confluence-client', () => jest.fn());
jest.mock('../../src/api/jira-client', () => jest.fn());
jest.mock('../../src/utils/env-loader', () => ({
  getWorkspaceRoot: jest.fn(() => process.cwd())
}));

const ConfluenceClient = require('../../src/api/confluence-client');
const { fetchPage } = require('../../src/core/fetch-page');

describe('fetchPage', () => {
  const mockPage = {
    id: '123456',
    title: 'API Design',
    space: { key: 'ARCH' },
    version: {
      number: 7,
      when: '2026-04-24T10:00:00.000Z'
    },
    history: {
      createdBy: { displayName: 'Jane Smith' },
      createdDate: '2026-04-20T08:00:00.000Z'
    },
    body: {
      storage: {
        value: '<p>Architecture details</p>'
      }
    },
    _links: {
      base: 'https://collaborate.example.com',
      webui: '/pages/viewpage.action?pageId=123456'
    }
  };

  let tempDir;
  let baseOutputDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atl-fetch-page-'));
    baseOutputDir = path.join(tempDir, 'confluence');
    ConfluenceClient.mockReset();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('stores JSON/meta only and returns an analysis path for agent-authored markdown', async () => {
    ConfluenceClient.mockImplementation(() => ({
      getPage: jest.fn().mockResolvedValue(mockPage)
    }));

    const result = await fetchPage('123456', {
      useCache: false,
      outputDir: baseOutputDir,
      silent: true
    });

    const pageDir = path.join(baseOutputDir, 'ARCH', '123456-api-design');
    const jsonPath = path.join(pageDir, '123456.json');
    const metaPath = path.join(pageDir, '.meta.json');
    const legacyMarkdownPath = path.join(pageDir, '123456.md');
    const analysisPath = path.join(pageDir, '123456.analysis.md');

    expect(result.success).toBe(true);
    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(fs.existsSync(metaPath)).toBe(true);
    expect(fs.existsSync(legacyMarkdownPath)).toBe(false);
    expect(result.paths).toEqual({
      outputDir: pageDir,
      jsonPath,
      metaPath,
      jiraPath: path.join(pageDir, '.jira.json'),
      analysisPath
    });

    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    expect(metadata.version).toBe(7);
    expect(metadata.analysisFile).toBe('123456.analysis.md');
  });

  it('removes legacy markdown files when a cached page is still current', async () => {
    const pageDir = path.join(baseOutputDir, 'ARCH', '123456-api-design');
    const metaPath = path.join(pageDir, '.meta.json');
    const jsonPath = path.join(pageDir, '123456.json');
    const legacyMarkdownPath = path.join(pageDir, '123456.md');

    fs.mkdirSync(pageDir, { recursive: true });
    fs.writeFileSync(metaPath, JSON.stringify({
      pageId: '123456',
      lastFetch: '2026-04-24T10:00:00.000Z',
      title: 'API Design',
      space: 'ARCH',
      version: 7,
      updated: '2026-04-24T10:00:00.000Z'
    }, null, 2));
    fs.writeFileSync(jsonPath, JSON.stringify(mockPage, null, 2));
    fs.writeFileSync(legacyMarkdownPath, '# legacy markdown');

    ConfluenceClient.mockImplementation(() => ({
      getPageTimestamp: jest.fn().mockResolvedValue({
        id: '123456',
        version: {
          number: 7,
          when: '2026-04-24T10:00:00.000Z'
        }
      })
    }));

    const result = await fetchPage('123456', {
      useCache: true,
      outputDir: baseOutputDir,
      silent: true
    });

    expect(result.success).toBe(true);
    expect(result.cached).toBe(true);
    expect(fs.existsSync(legacyMarkdownPath)).toBe(false);
    expect(result.paths.analysisPath).toBe(path.join(pageDir, '123456.analysis.md'));
  });
});
