/**
 * Create Issue Module
 * Handles creation of Jira issues with project-specific field mapping support
 */

const axios = require('axios');
const https = require('https');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

class IssueCreator {
  constructor(config) {
    this.jiraUrl = config.jiraUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    
    this.client = axios.create({
      baseURL: this.jiraUrl,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Load project-specific field mapping
   */
  loadFieldMapping(projectKey) {
    const mappingDir = path.join(__dirname, '../config');
    const projectMappingPath = path.join(mappingDir, `field-mapping-${projectKey}.json`);
    const defaultMappingPath = path.join(mappingDir, 'field-mapping-default.json');

    let mapping = {};
    
    // Try project-specific mapping first
    if (fs.existsSync(projectMappingPath)) {
      mapping = JSON.parse(fs.readFileSync(projectMappingPath, 'utf-8'));
      console.log(chalk.dim(`Using field mapping for project: ${projectKey}`));
    } else if (fs.existsSync(defaultMappingPath)) {
      mapping = JSON.parse(fs.readFileSync(defaultMappingPath, 'utf-8'));
      console.log(chalk.yellow(`⚠ No project-specific mapping found, using default`));
    } else {
      console.log(chalk.yellow(`⚠ No field mapping found, using Jira field IDs`));
    }

    return mapping;
  }

  /**
   * Get reverse mapping (field name -> field ID)
   */
  getReverseMapping(fieldMapping) {
    const reverse = {};
    for (const [fieldId, fieldName] of Object.entries(fieldMapping)) {
      // Normalize field name for easier lookup
      const normalizedName = fieldName.toLowerCase().replace(/\s+/g, '');
      reverse[normalizedName] = fieldId;
    }
    return reverse;
  }

  /**
   * Get available issue types for a project
   */
  async getIssueTypes(projectKey) {
    try {
      const response = await this.client.get(`/rest/api/2/project/${projectKey}`);
      return response.data.issueTypes.map(type => ({
        name: type.name,
        id: type.id,
        subtask: type.subtask || false
      }));
    } catch (error) {
      throw new Error(`Failed to fetch issue types: ${error.message}`);
    }
  }

  /**
   * Interactive issue creation
   */
  async createInteractive(projectKey) {
    console.log(chalk.blue.bold(`\n🎫 Creating new Jira issue in ${projectKey}\n`));

    // Get issue types
    const spinner = ora('Fetching issue types...').start();
    let issueTypes;
    try {
      issueTypes = await this.getIssueTypes(projectKey);
      spinner.succeed('Issue types loaded');
    } catch (error) {
      spinner.fail(error.message);
      return null;
    }

    // Load field mapping
    const fieldMapping = this.loadFieldMapping(projectKey);
    const reverseMapping = this.getReverseMapping(fieldMapping);

    // Prompt for basic fields
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'issueType',
        message: 'Issue Type:',
        choices: issueTypes.filter(t => !t.subtask).map(t => ({
          name: t.name,
          value: t.id
        }))
      },
      {
        type: 'input',
        name: 'summary',
        message: 'Summary:',
        validate: input => input.length > 0 ? true : 'Summary is required'
      },
      {
        type: 'editor',
        name: 'description',
        message: 'Description (opens editor):',
        default: '## Description\n\n## Acceptance Criteria\n\n- [ ] \n\n## Technical Notes\n\n'
      },
      {
        type: 'input',
        name: 'assignee',
        message: 'Assignee (email or username, leave empty for unassigned):',
        default: ''
      },
      {
        type: 'list',
        name: 'priority',
        message: 'Priority:',
        choices: ['Highest', 'High', 'Medium', 'Low', 'Lowest'],
        default: 'Medium'
      },
      {
        type: 'input',
        name: 'labels',
        message: 'Labels (comma-separated):',
        default: '',
        filter: input => input.split(',').map(l => l.trim()).filter(l => l)
      }
    ]);

    // Ask for custom fields
    const customFieldAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addCustomFields',
        message: 'Add custom fields?',
        default: false
      }
    ]);

    let customFields = {};
    if (customFieldAnswers.addCustomFields) {
      customFields = await this.promptCustomFields(fieldMapping);
    }

    // Build issue object
    const issueData = this.buildIssueData(projectKey, answers, customFields, reverseMapping);

    // Confirm and create
    console.log(chalk.dim('\nIssue to create:'));
    console.log(chalk.dim(JSON.stringify(issueData, null, 2)));
    
    const confirm = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Create this issue?',
        default: true
      }
    ]);

    if (!confirm.proceed) {
      console.log(chalk.yellow('Issue creation cancelled'));
      return null;
    }

    return await this.create(issueData);
  }

  /**
   * Prompt for custom fields
   */
  async promptCustomFields(fieldMapping) {
    const customFields = {};
    const fieldNames = Object.values(fieldMapping).filter(name => 
      !['Epic Link', 'Sprint', 'Story Points'].includes(name) // Skip common ones we'll handle separately
    );

    if (fieldNames.length === 0) {
      return customFields;
    }

    const { selectedFields } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedFields',
        message: 'Select custom fields to populate:',
        choices: fieldNames
      }
    ]);

    for (const fieldName of selectedFields) {
      const fieldId = Object.keys(fieldMapping).find(id => fieldMapping[id] === fieldName);
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'value',
          message: `${fieldName}:`,
        }
      ]);
      
      if (answer.value) {
        customFields[fieldId] = answer.value;
      }
    }

    return customFields;
  }

  /**
   * Build issue data object for API
   */
  buildIssueData(projectKey, answers, customFields, reverseMapping) {
    const fields = {
      project: { key: projectKey },
      issuetype: { id: answers.issueType },
      summary: answers.summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: answers.description
              }
            ]
          }
        ]
      },
      priority: { name: answers.priority }
    };

    // Add assignee if provided
    if (answers.assignee) {
      fields.assignee = { id: answers.assignee };
    }

    // Add labels
    if (answers.labels && answers.labels.length > 0) {
      fields.labels = answers.labels;
    }

    // Add custom fields
    for (const [fieldId, value] of Object.entries(customFields)) {
      fields[fieldId] = value;
    }

    return { fields };
  }

  /**
   * Create issue from data object
   */
  async create(issueData) {
    const spinner = ora('Creating issue...').start();
    
    try {
      const response = await this.client.post('/rest/api/2/issue', issueData);;
      console.log(chalk.blue(`\n🔗 ${this.jiraUrl}/browse/${issueKey}\n`));
      
      return {
        key: issueKey,
        id: response.data.id,
        self: response.data.self
      };
    } catch (error) {
      spinner.fail('Failed to create issue');
      
      if (error.response) {
        console.error(chalk.red(`\nError: ${error.response.status} ${error.response.statusText}`));
        if (error.response.data.errors) {
          console.error(chalk.red('\nField errors:'));
          for (const [field, message] of Object.entries(error.response.data.errors)) {
            console.error(chalk.red(`  ${field}: ${message}`));
          }
        }
        if (error.response.data.errorMessages) {
          console.error(chalk.red('\nMessages:'));
          error.response.data.errorMessages.forEach(msg => {
            console.error(chalk.red(`  ${msg}`));
          });
        }
      } else {
        console.error(chalk.red(`\n${error.message}`));
      }
      
      throw error;
    }
  }

  /**
   * Create issue from template
   */
  async createFromTemplate(projectKey, templateName) {
    const templatePath = path.join(__dirname, '../templates', `issue-template-${templateName}.json`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }

    const template = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));
    template.fields.project = { key: projectKey };

    return await this.create(template);
  }

  /**
   * Create issue from provided data (non-interactive)
   * Used by jira-write skill for programmatic issue creation
   * @param {Object} issueData - Complete issue data with fields
   */
  async createFromData(issueData) {
    const spinner = ora('Creating issue from data...').start();

    // Build API payload
    const payload = {
      fields: {}
    };

    // If issueData has a 'fields' property, use it directly
    if (issueData.fields) {
      payload.fields = issueData.fields;
    } else {
      // Otherwise, treat all properties as fields
      payload.fields = { ...issueData };
    }

    // Ensure required fields exist
    if (!payload.fields.project) {
      spinner.fail('Missing required field: project');
      throw new Error('Issue data must include project');
    }
    if (!payload.fields.issuetype && !payload.fields.issueType) {
      spinner.fail('Missing required field: issuetype');
      throw new Error('Issue data must include issuetype');
    }
    if (!payload.fields.summary) {
      spinner.fail('Missing required field: summary');
      throw new Error('Issue data must include summary');
    }

    spinner.text = 'Submitting to JIRA...';

    try {
      const response = await this.client.post('/rest/api/2/issue', payload);
      const issueKey = response.data.key;
      
      spinner.succeed(chalk.green(`Issue created: ${issueKey}`));
      
      return {
        key: issueKey,
        id: response.data.id,
        self: response.data.self
      };
    } catch (error) {
      spinner.fail('Failed to create issue');
      
      // Detailed error reporting
      if (error.response) {
        let errorMsg = `HTTP ${error.response.status}: ${error.response.statusText}`;
        
        if (error.response.data.errors) {
          const errors = Object.entries(error.response.data.errors)
            .map(([field, msg]) => `  ${field}: ${msg}`)
            .join('\n');
          errorMsg += `\n\nField errors:\n${errors}`;
        }
        
        if (error.response.data.errorMessages) {
          errorMsg += `\n\nMessages:\n${error.response.data.errorMessages.map(m => `  ${m}`).join('\n')}`;
        }
        
        throw new Error(errorMsg);
      }
      
      throw error;
    }
  }
}

module.exports = IssueCreator;
