/**
 * Update Status Module
 * Handles Jira issue status transitions with mandatory field validation and auto-population
 */

const axios = require('axios');
const https = require('https');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');

class StatusUpdater {
  constructor(config) {
    this.jiraUrl = config.jiraUrl;
    this.email = config.email;
    this.apiToken = config.apiToken;
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    
    this.client = axios.create({
      baseURL: this.jiraUrl,
      auth: {
        username: this.email,
        password: this.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });
  }

  /**
   * Load status transition configuration for project
   */
  loadTransitionConfig(projectKey) {
    const configDir = path.join(__dirname, '../config');
    const projectConfigPath = path.join(configDir, `status-transitions-${projectKey}.json`);
    const defaultConfigPath = path.join(configDir, 'status-transitions-default.json');

    let config = { transitions: {} };
    
    // Try project-specific config first
    if (fs.existsSync(projectConfigPath)) {
      config = JSON.parse(fs.readFileSync(projectConfigPath, 'utf-8'));
      console.log(chalk.dim(`Using transition config for project: ${projectKey}`));
    } else if (fs.existsSync(defaultConfigPath)) {
      config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
      console.log(chalk.yellow(`⚠ No project-specific transition config, using default`));
    } else {
      console.log(chalk.yellow(`⚠ No transition config found`));
    }

    return config;
  }

  /**
   * Get available transitions for an issue
   */
  async getAvailableTransitions(issueKey) {
    try {
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}/transitions`);
      return response.data.transitions.map(t => ({
        id: t.id,
        name: t.name,
        to: t.to
      }));
    } catch (error) {
      throw new Error(`Failed to fetch transitions: ${error.message}`);
    }
  }

  /**
   * Get current issue details
   */
  async getIssue(issueKey) {
    try {
      const response = await this.client.get(`/rest/api/3/issue/${issueKey}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch issue: ${error.message}`);
    }
  }

  /**
   * Interactive status update
   */
  async updateInteractive(issueKey) {
    console.log(chalk.blue.bold(`\n🔄 Updating status for ${issueKey}\n`));

    // Get current issue
    const spinner = ora('Fetching issue details...').start();
    let issue, transitions;
    try {
      [issue, transitions] = await Promise.all([
        this.getIssue(issueKey),
        this.getAvailableTransitions(issueKey)
      ]);
      spinner.succeed('Issue loaded');
    } catch (error) {
      spinner.fail(error.message);
      return null;
    }

    const projectKey = issue.fields.project.key;
    const currentStatus = issue.fields.status.name;
    
    console.log(chalk.dim(`Current status: ${currentStatus}`));
    console.log(chalk.dim(`Available transitions: ${transitions.length}\n`));

    // Select transition
    if (transitions.length === 0) {
      console.log(chalk.yellow('No transitions available for this issue'));
      return null;
    }

    const { selectedTransition } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTransition',
        message: 'Select new status:',
        choices: transitions.map(t => ({
          name: `${t.to.name}${t.to.name === currentStatus ? ' (current)' : ''}`,
          value: t
        }))
      }
    ]);

    // Load transition config
    const transitionConfig = this.loadTransitionConfig(projectKey);
    const statusConfig = transitionConfig.transitions[selectedTransition.to.name] || {};
    
    // Check validations
    if (statusConfig.validations) {
      const validationResult = await this.checkValidations(issue, statusConfig.validations);
      if (!validationResult.valid) {
        console.log(chalk.red('\n❌ Validation failed:'));
        validationResult.errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
        return null;
      }
    }

    // Gather mandatory fields
    const mandatoryFields = statusConfig.mandatoryFields || [];
    const fieldUpdates = await this.gatherMandatoryFields(mandatoryFields);

    // Add comment
    const { addComment, commentText } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addComment',
        message: 'Add a comment?',
        default: true
      },
      {
        type: 'input',
        name: 'commentText',
        message: 'Comment:',
        when: answers => answers.addComment,
        default: `Status changed to ${selectedTransition.to.name}`
      }
    ]);

    // Confirm
    console.log(chalk.dim('\nTransition details:'));
    console.log(chalk.dim(`  From: ${currentStatus}`));
    console.log(chalk.dim(`  To: ${selectedTransition.to.name}`));
    if (Object.keys(fieldUpdates).length > 0) {
      console.log(chalk.dim('  Field updates:'));
      for (const [field, value] of Object.entries(fieldUpdates)) {
        console.log(chalk.dim(`    ${field}: ${JSON.stringify(value)}`));
      }
    }
    
    const { proceed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Proceed with status update?',
        default: true
      }
    ]);

    if (!proceed) {
      console.log(chalk.yellow('Status update cancelled'));
      return null;
    }

    // Perform transition
    return await this.transition(issueKey, selectedTransition.id, fieldUpdates, addComment ? commentText : null);
  }

  /**
   * Gather mandatory field values
   */
  async gatherMandatoryFields(mandatoryFields) {
    const fieldUpdates = {};

    for (const fieldDef of mandatoryFields) {
      // Auto-populate if autoValue is set
      if (fieldDef.autoValue) {
        if (fieldDef.autoValue === 'NOW') {
          const now = new Date();
          if (fieldDef.type === 'date') {
            fieldUpdates[fieldDef.field] = now.toISOString().split('T')[0];
          } else if (fieldDef.type === 'datetime') {
            fieldUpdates[fieldDef.field] = now.toISOString();
          }
          console.log(chalk.dim(`✓ Auto-set ${fieldDef.name}: ${fieldUpdates[fieldDef.field]}`));
          continue;
        }
      }

      // Use default value if set and no prompt
      if (fieldDef.defaultValue && !fieldDef.prompt) {
        fieldUpdates[fieldDef.field] = this.formatFieldValue(fieldDef.defaultValue, fieldDef.type);
        console.log(chalk.dim(`✓ Using default ${fieldDef.name}: ${fieldDef.defaultValue}`));
        continue;
      }

      // Prompt user if needed
      if (fieldDef.prompt) {
        const promptConfig = this.buildFieldPrompt(fieldDef);
        const answer = await inquirer.prompt([promptConfig]);
        
        if (answer.value) {
          fieldUpdates[fieldDef.field] = this.formatFieldValue(answer.value, fieldDef.type);
        } else if (fieldDef.required) {
          throw new Error(`Required field ${fieldDef.name} was not provided`);
        }
      }
    }

    return fieldUpdates;
  }

  /**
   * Build inquirer prompt for a field
   */
  buildFieldPrompt(fieldDef) {
    const prompt = {
      name: 'value',
      message: `${fieldDef.name}${fieldDef.description ? ` (${fieldDef.description})` : ''}:`,
      validate: input => {
        if (fieldDef.required && !input) {
          return `${fieldDef.name} is required`;
        }
        return true;
      }
    };

    if (fieldDef.type === 'select' && fieldDef.options) {
      prompt.type = 'list';
      prompt.choices = fieldDef.options;
    } else if (fieldDef.type === 'textarea') {
      prompt.type = 'editor';
    } else {
      prompt.type = 'input';
    }

    return prompt;
  }

  /**
   * Format field value based on type
   */
  formatFieldValue(value, type) {
    switch (type) {
      case 'number':
        return parseFloat(value);
      case 'select':
      case 'resolution':
        return { name: value };
      case 'issuelink':
        return { key: value };
      case 'url':
        return value;
      default:
        return value;
    }
  }

  /**
   * Check validations before transition
   */
  async checkValidations(issue, validations) {
    const errors = [];

    if (validations.requireAssignee && !issue.fields.assignee) {
      errors.push('Issue must have an assignee');
    }

    if (validations.requireEstimate && !issue.fields.timeestimate) {
      errors.push('Issue must have a time estimate');
    }

    if (validations.requireSubtasksClosed) {
      // Would need to fetch subtasks and check their status
      // Simplified for now
      if (issue.fields.subtasks && issue.fields.subtasks.length > 0) {
        const openSubtasks = issue.fields.subtasks.filter(
          st => st.fields.status.statusCategory.key !== 'done'
        );
        if (openSubtasks.length > 0) {
          errors.push(`${openSubtasks.length} subtask(s) still open`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Perform status transition
   */
  async transition(issueKey, transitionId, fieldUpdates = {}, comment = null) {
    const spinner = ora('Updating issue status...').start();
    
    try {
      // Build transition request
      const transitionData = {
        transition: { id: transitionId }
      };

      // Add field updates if any
      if (Object.keys(fieldUpdates).length > 0) {
        transitionData.update = {};
        for (const [field, value] of Object.entries(fieldUpdates)) {
          transitionData.update[field] = [{ set: value }];
        }
      }

      // Add comment if provided
      if (comment) {
        if (!transitionData.update) {
          transitionData.update = {};
        }
        transitionData.update.comment = [{
          add: {
            body: {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: comment }]
                }
              ]
            }
          }
        }];
      }

      // Execute transition
      await this.client.post(
        `/rest/api/3/issue/${issueKey}/transitions`,
        transitionData
      );
      
      spinner.succeed(chalk.green(`✅ Status updated successfully`));
      console.log(chalk.blue(`\n🔗 ${this.jiraUrl}/browse/${issueKey}\n`));
      
      return { success: true, issueKey };
    } catch (error) {
      spinner.fail('Failed to update status');
      
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
   * Quick status update (non-interactive)
   */
  async updateStatus(issueKey, statusName, fieldUpdates = {}, comment = null) {
    // Get available transitions
    const transitions = await this.getAvailableTransitions(issueKey);
    
    // Find matching transition
    const transition = transitions.find(
      t => t.to.name.toLowerCase() === statusName.toLowerCase()
    );

    if (!transition) {
      throw new Error(
        `No transition to "${statusName}" available. Options: ${transitions.map(t => t.to.name).join(', ')}`
      );
    }

    return await this.transition(issueKey, transition.id, fieldUpdates, comment);
  }
}

module.exports = StatusUpdater;
