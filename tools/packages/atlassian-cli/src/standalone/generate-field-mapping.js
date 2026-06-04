#!/usr/bin/env node

/**
 * Generate project-specific field mapping from Jira issue metadata
 * 
 * Usage:
 *   npm run generate-mapping CEAJ-3843          # Generate from issue (auto-detects project)
 *   npm run generate-mapping DIGSTART-1258      # Generate from issue (auto-detects project)
 *   npm run generate-mapping -- --project CEAJ  # Generate for specific project (requires cached issue)
 * 
 * Note: Field mappings are project-specific and stored in src/field-mappings/{PROJECT}/fields.json
 *       They are auto-generated on first fetch if they don't exist.
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const issueKey = args.find(arg => !arg.startsWith('--'));
const projectFlag = args.find(arg => arg.startsWith('--project'));
const projectKey = projectFlag ? projectFlag.split('=')[1] : null;

async function generateFieldMapping() {
  let project = projectKey;
  let fields = [];
  
  // If issue key provided, fetch from cached issue
  if (issueKey) {
    console.log(`\n🔍 Generating field mapping from issue: ${issueKey}\n`);
    
    // Extract project key from issue key (e.g., CEAJ-3843 → CEAJ)
    project = issueKey.split('-')[0];
    
    // Try to load cached issue
    const issueJsonPath = path.join(process.cwd(), 'atl', 'jira', issueKey, `${issueKey}.json`);
    
    if (!fs.existsSync(issueJsonPath)) {
      console.error(`❌ Error: Issue ${issueKey} not found in cache.`);
      console.error(`   Please fetch it first: npm run atl:issue ${issueKey}\n`);
      process.exit(1);
    }
    
    // Load issue JSON
    const issueData = JSON.parse(fs.readFileSync(issueJsonPath, 'utf8'));
    
    // Extract all fields from the issue
    const allFields = issueData.fields || {};
    
    // Get field metadata from issue's editmeta or create from fields
    console.log('📋 Analyzing issue fields...\n');
    
    // Create field list from actual fields in issue
    Object.keys(allFields).forEach(fieldId => {
      if (fieldId.startsWith('customfield_')) {
        const value = allFields[fieldId];
        const fieldName = getFieldName(fieldId, value);
        
        fields.push({
          id: fieldId,
          name: fieldName,
          custom: true,
          hasValue: value !== null && value !== undefined
        });
      }
    });
    
    console.log(`✓ Found ${fields.length} custom fields in issue`);
    console.log(`✓ Issue Type: ${issueData.fields.issuetype?.name || 'Unknown'}`);
    console.log(`✓ Project: ${project} (${issueData.fields.project?.name || 'Unknown'})\n`);
    
  } else {
    // Fall back to jira-fields.json if available
    const fieldsJsonPath = path.join(__dirname, '..', '..', 'jira-fields.json');
    
    if (fs.existsSync(fieldsJsonPath)) {
      console.log(`\n📋 Generating field mapping from jira-fields.json\n`);
      fields = require(fieldsJsonPath);
    } else {
      console.error(`❌ Error: No issue key provided and jira-fields.json not found.`);
      console.error(`\nUsage:`);
      console.error(`  npm run generate-mapping CEAJ-3843       # From issue`);
      console.error(`  npm run generate-mapping -- --project CEAJ  # For project\n`);
      process.exit(1);
    }
  }
  
  // Create mapping of custom field IDs to names
  const fieldMapping = {};
  const fieldsByName = {};
  
  fields.forEach(field => {
    if (field.custom && field.id.startsWith('customfield_')) {
      fieldMapping[field.id] = field.name;
      fieldsByName[field.name] = field.id;
    }
  });
  
  // Determine output path using project-specific directory structure
  const mappingsBasePath = path.join(__dirname, '..', 'field-mappings');
  
  if (!project) {
    console.error(`❌ Error: Project key is required.`);
    console.error(`\nUsage:`);
    console.error(`  npm run generate-mapping CEAJ-3843       # From issue key`);
    console.error(`  npm run generate-mapping -- --project CEAJ  # Explicit project\n`);
    process.exit(1);
  }
  
  const outputDir = path.join(mappingsBasePath, project);
  const outputPath = path.join(outputDir, 'fields.json');
  
  console.log(`📁 Generating field mapping for project: ${project}`);
  
  // Create directory if it doesn't exist
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Save mapping
  fs.writeFileSync(outputPath, JSON.stringify(fieldMapping, null, 2));
  
  console.log(`\n✓ Generated field mapping with ${Object.keys(fieldMapping).length} custom fields`);
  console.log(`✓ Saved to: ${outputPath}\n`);
  
  // Show important fields found
  const importantFieldNames = [
    'Epic Link',
    'Acceptance Criteria',
    'Feature Statement',
    'Feature Size',
    'Feature Owner',
    'Story Points',
    'Sprint',
    'Parent Link',
    'Business Value',
    'Technical Spec',
    'Dependencies'
  ];
  
  const foundImportant = importantFieldNames
    .filter(name => fieldsByName[name])
    .map(name => ({ name, id: fieldsByName[name] }));
  
  if (foundImportant.length > 0) {
    console.log('📌 Important fields found:');
    foundImportant.forEach(({ name, id }) => {
      console.log(`   ${id}: ${name}`);
    });
    console.log('');
  }
  
  // Show fields with values (if from issue)
  if (issueKey) {
    const fieldsWithValues = fields.filter(f => f.hasValue);
    console.log(`💡 Fields with values in ${issueKey}: ${fieldsWithValues.length}/${fields.length}`);
    console.log('   (These fields are likely used in your project)\n');
  }
  
  // Save metadata
  const metaPath = path.join(outputDir, 'fields.json.meta');
  const metadata = {
    generatedAt: new Date().toISOString(),
    source: issueKey || 'jira-fields.json',
    project: project || 'default',
    fieldCount: Object.keys(fieldMapping).length,
    importantFields: foundImportant
  };
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  
  console.log(`✅ Field mapping generation complete!\n`);
  
  if (project) {
    console.log(`Next steps:`);
    console.log(`1. Review the mapping: cat ${outputPath}`);
    console.log(`2. Test with a ticket: npm run issue ${issueKey || `${project}-XXX`} -- --fresh`);
    console.log(`3. Check the markdown output for readable field names\n`);
  }
}

// Helper function to infer field name from value structure
function getFieldName(fieldId, value) {
  // Try to infer from well-known field IDs
  const knownFields = {
    'customfield_10008': 'Epic Link',
    'customfield_10016': 'Story Points',
    'customfield_10020': 'Sprint',
    'customfield_14400': 'Acceptance Criteria',
    'customfield_26903': 'Feature Owner',
    'customfield_26904': 'Feature Size',
    'customfield_26905': 'Feature Statement'
  };
  
  if (knownFields[fieldId]) {
    return knownFields[fieldId];
  }
  
  // Try to infer from value structure
  if (value && typeof value === 'object') {
    if (value.name) return `Custom ${fieldId} (${value.name})`;
    if (value.value) return `Custom ${fieldId} (${value.value})`;
    if (value.displayName) return `Custom ${fieldId} (${value.displayName})`;
  }
  
  // Default naming
  return `Custom Field ${fieldId.replace('customfield_', '')}`;
}

// Run the generator
generateFieldMapping().catch(error => {
  console.error(`\n❌ Error: ${error.message}\n`);
  process.exit(1);
});
