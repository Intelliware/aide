const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const JiraClient = require('../api/jira-client');
const { getWorkspaceRoot } = require('../utils/env-loader');

/**
 * Search Jira issues using JQL and save results
 * @param {string} jql - JQL query string
 * @param {object} options - Options object
 * @param {number} options.maxResults - Maximum number of results (default: 50)
 * @param {string[]} options.fields - Fields to retrieve (default: all)
 * @param {string} options.outputDir - Base output directory (overrides OUTPUT_DIR env var)
 * @param {boolean} options.silent - Suppress console output (default: false)
 * @param {boolean} options.saveIndividual - Save each issue in separate folders (default: true)
 * @param {boolean} options.saveSummary - Generate search summary JSON file (default: true)
 * @returns {Promise<object>} Result object with success status, issues, and paths
 */
async function searchIssues(jql, options = {}) {
  const workspaceRoot = getWorkspaceRoot();
  const defaultOutputDir = process.env.OUTPUT_DIR 
    ? (path.isAbsolute(process.env.OUTPUT_DIR) 
        ? process.env.OUTPUT_DIR 
        : path.join(workspaceRoot, process.env.OUTPUT_DIR))
    : path.join(workspaceRoot, 'docs');
  
  const {
    maxResults = 50,
    fields = ['*all'],
    outputDir: baseDir = path.join(defaultOutputDir, 'jira'),
    silent = false,
    saveIndividual = true,
    saveSummary = true
  } = options;
  
  if (!silent) {
    console.log(`\n🔍 Searching Jira issues...`);
    console.log(`   Query: ${jql}`);
    console.log(`   Max results: ${maxResults}`);
  }
  
  const client = new JiraClient();
  
  try {
    // Execute JQL search
    const issues = await client.search(jql, {
      maxResults,
      fields,
      expand: ['renderedFields']
    });
    
    if (!silent) {
      console.log(`✓ Found ${issues.length} issue(s)`);
    }
    
    if (issues.length === 0) {
      if (!silent) {
        console.log(`\n⚠️  No issues found matching the query.\n`);
      }
      return {
        success: true,
        count: 0,
        issues: [],
        paths: {}
      };
    }
    
    const savedIssues = [];
    const savedPaths = [];
    
    // Save individual issues
    if (saveIndividual) {
      if (!silent) {
        console.log(`\n💾 Saving individual issues...`);
      }
      
      for (const issue of issues) {
        if (!silent) {
          process.stdout.write(`   ${issue.key}... `);
        }
        
        try {
          // Save issue data directly
          const projectKey = issue.key.split('-')[0];
          const issueDir = path.join(baseDir, projectKey, issue.key);
          fs.mkdirSync(issueDir, { recursive: true });
          
          // Save JSON
          const jsonPath = path.join(issueDir, `${issue.key}.json`);
          fs.writeFileSync(jsonPath, JSON.stringify(issue, null, 2));
          
          // Save metadata
          const metaPath = path.join(issueDir, '.meta.json');
          const metadata = {
            issueKey: issue.key,
            lastFetch: new Date().toISOString(),
            summary: issue.fields.summary,
            status: issue.fields.status?.name || 'Unknown',
            type: issue.fields.issuetype?.name || 'Unknown',
            priority: issue.fields.priority?.name || 'None',
            assignee: issue.fields.assignee?.displayName || 'Unassigned',
            analysisFile: `${issue.key}.analysis.md`
          };
          fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));

          const legacyMarkdownPath = path.join(issueDir, `${issue.key}.md`);
          if (fs.existsSync(legacyMarkdownPath)) {
            fs.unlinkSync(legacyMarkdownPath);
          }

          const analysisPath = path.join(issueDir, `${issue.key}.analysis.md`);
          
          savedIssues.push({
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status?.name || 'Unknown',
            assignee: issue.fields.assignee?.displayName || 'Unassigned',
            priority: issue.fields.priority?.name || 'None',
            type: issue.fields.issuetype?.name || 'Unknown',
            jsonPath,
            metaPath,
            analysisPath
          });
          savedPaths.push(issueDir);
          
          if (!silent) {
            console.log(`✓`);
          }
        } catch (saveError) {
          if (!silent) {
            console.log(`✗ ${saveError.message}`);
          }
        }
      }
    }
    
    // Generate summary file
    let summaryPath = null;
    if (saveSummary) {
      summaryPath = await generateSearchSummary(jql, savedIssues, baseDir, silent);
    }
    
    if (!silent) {
      console.log(`\n✅ Search complete!`);
      console.log(`   Issues found: ${issues.length}`);
      console.log(`   Issues saved: ${savedIssues.length}`);
      if (summaryPath) {
        console.log(`   Summary JSON: ${summaryPath}`);
      }
      console.log(`   Markdown analysis is agent-generated from cached JSON artifacts.`);
      console.log(``);
    }
    
    return {
      success: true,
      count: issues.length,
      issues: savedIssues,
      paths: {
        baseDir,
        savedPaths,
        summaryPath
      }
    };
    
  } catch (error) {
    if (!silent) {
      console.error(`\n✗ Error executing search:`, error.message);
      if (error.response) {
        console.error(`  Status: ${error.response.status}`);
        
        if (error.response.status === 400) {
          console.error(chalk.yellow('\n💡 JQL syntax error. Check your query:'));
          console.error(chalk.gray(`  Query: ${jql}`));
          console.error(chalk.gray('  Common fixes:'));
          console.error(chalk.gray('    • Use quotes for multi-word values: status = "In Progress"'));
          console.error(chalk.gray('    • Check field names are correct'));
          console.error(chalk.gray('    • Use AND/OR for multiple conditions\n'));
        }
      }
    }
    
    return {
      success: false,
      error: error.message,
      errorResponse: error.response
    };
  }
}

/**
 * Generate a JSON summary of search results
 * @param {string} jql - Original JQL query
 * @param {object[]} issues - Array of issue summaries
 * @param {string} baseDir - Base output directory
 * @param {boolean} silent - Suppress console output
 * @returns {Promise<string>} Path to summary file
 */
async function generateSearchSummary(jql, issues, baseDir, silent = false) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const sanitizedQuery = jql.replace(/[^a-z0-9]+/gi, '-').substring(0, 30);
  const summaryDir = path.join(baseDir, '_searches');
  const summaryFile = `search-${timestamp}-${sanitizedQuery}.json`;
  const summaryPath = path.join(summaryDir, summaryFile);
  const analysisPath = path.join(summaryDir, `search-${timestamp}-${sanitizedQuery}.analysis.md`);
  const legacyMarkdownPath = path.join(summaryDir, `search-${timestamp}-${sanitizedQuery}.md`);
  
  // Create searches directory
  fs.mkdirSync(summaryDir, { recursive: true });

  const statusCounts = {};
  const typeCounts = {};
  for (const issue of issues) {
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    typeCounts[issue.type] = (typeCounts[issue.type] || 0) + 1;
  }

  const summary = {
    query: jql,
    executed: new Date().toISOString(),
    count: issues.length,
    analysisFile: path.basename(analysisPath),
    issues,
    summaryByStatus: statusCounts,
    summaryByType: typeCounts
  };

  if (fs.existsSync(legacyMarkdownPath)) {
    fs.unlinkSync(legacyMarkdownPath);
  }

  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  if (!silent) {
    console.log(`✓ Generated summary JSON: ${summaryPath}`);
  }
  
  return summaryPath;
}

module.exports = {
  searchIssues,
  generateSearchSummary
};
