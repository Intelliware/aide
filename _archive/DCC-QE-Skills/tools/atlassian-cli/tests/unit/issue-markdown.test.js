const { buildMarkdown } = require('../../src/utils/issue-markdown');

describe('issue-markdown', () => {
  it('renders Acceptance Criteria for RMBJTDBC issues using the mapped custom field', () => {
    const raw = {
      fields: {
        summary: 'Mapped field test',
        status: { name: 'To Do' },
        issuetype: { name: 'Story' },
        priority: { name: 'High' },
        reporter: { displayName: 'Reporter Example' },
        assignee: { displayName: 'Assignee Example' },
        created: '2026-05-05T00:00:00.000Z',
        updated: '2026-05-05T01:00:00.000Z',
        labels: [],
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Description body' }]
            }
          ]
        },
        customfield_14400: {
          type: 'doc',
          content: [
            {
              type: 'bulletList',
              content: [
                {
                  type: 'listItem',
                  content: [
                    {
                      type: 'paragraph',
                      content: [{ type: 'text', text: 'Keyboard navigation keeps focused option visible' }]
                    }
                  ]
                }
              ]
            }
          ]
        }
      }
    };

    const markdown = buildMarkdown('RMBJTDBC-99999', raw);

    expect(markdown).toContain('## Acceptance Criteria');
    expect(markdown).toContain('Keyboard navigation keeps focused option visible');
  });
});
