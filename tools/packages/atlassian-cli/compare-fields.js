#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

// Load both issues
const dPath = path.join(__dirname, '../../../atl/jira/DIGSTART-1258/DIGSTART-1258.json');
const cPath = path.join(__dirname, 'atl/jira/CEAJ-3843/CEAJ-3843.json');

const d = JSON.parse(fs.readFileSync(dPath, 'utf8'));
const c = JSON.parse(fs.readFileSync(cPath, 'utf8'));

const dFields = Object.keys(d.fields).filter(f => f.startsWith('customfield_')).sort();
const cFields = Object.keys(c.fields).filter(f => f.startsWith('customfield_')).sort();

console.log('\n=== CUSTOM FIELDS COMPARISON ===\n');
console.log('DIGSTART-1258 project:', d.fields.project.key);
console.log('Custom fields count:', dFields.length);
console.log('\nCEAJ-3843 project:', c.fields.project.key);
console.log('Custom fields count:', cFields.length);

// Find fields unique to each
const onlyInD = dFields.filter(f => !cFields.includes(f));
const onlyInC = cFields.filter(f => !dFields.includes(f));
const common = dFields.filter(f => cFields.includes(f));

console.log('\n--- Common fields:', common.length);
console.log('--- Only in DIGSTART:', onlyInD.length);
console.log('--- Only in CEAJ:', onlyInC.length);

if (onlyInD.length > 0) {
  console.log('\nFields ONLY in DIGSTART (first 10):');
  onlyInD.slice(0, 10).forEach(f => {
    const val = d.fields[f];
    const summary = val === null ? 'null' : (typeof val === 'object' ? '[object]' : String(val).substring(0, 40));
    console.log(`  ${f}: ${summary}`);
  });
}

if (onlyInC.length > 0) {
  console.log('\nFields ONLY in CEAJ (first 10):');
  onlyInC.slice(0, 10).forEach(f => {
    const val = c.fields[f];
    const summary = val === null ? 'null' : (typeof val === 'object' ? '[object]' : String(val).substring(0, 40));
    console.log(`  ${f}: ${summary}`);
  });
}

// Check important fields to see if they're the SAME between projects
console.log('\n=== CHECKING KEY FIELDS (Same ID, Different Purpose?) ===');
const keyFields = ['customfield_26903', 'customfield_14400', 'customfield_26905', 'customfield_10002', 'customfield_10008'];

keyFields.forEach(fid => {
  const dVal = d.fields[fid];
  const cVal = c.fields[fid];
  
  const dSummary = dVal === null ? 'null' : (typeof dVal === 'object' ? JSON.stringify(dVal).substring(0, 60) : String(dVal).substring(0, 60));
  const cSummary = cVal === null ? 'null' : (typeof cVal === 'object' ? JSON.stringify(cVal).substring(0, 60) : String(cVal).substring(0, 60));
  
  console.log(`\n${fid}:`);
  console.log(`  DIGSTART: ${dSummary}`);
  console.log(`  CEAJ:     ${cSummary}`);
  console.log(`  Same? ${JSON.stringify(dVal) === JSON.stringify(cVal)}`);
});

// Load current field mapping
const mappingPath = path.join(__dirname, 'src/utils/field-mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

console.log('\n=== CURRENT FIELD MAPPING ===');
console.log(`Loaded from: ${mappingPath}`);
console.log(`Total mappings: ${Object.keys(mapping).length}`);

// Check if mapping has fields from both projects
const mappedFields = Object.keys(mapping);
const dMapped = dFields.filter(f => mappedFields.includes(f));
const cMapped = cFields.filter(f => mappedFields.includes(f));

console.log(`\nDIGSTART fields in mapping: ${dMapped.length} of ${dFields.length}`);
console.log(`CEAJ fields in mapping: ${cMapped.length} of ${cFields.length}`);

console.log('\n=== RECOMMENDATION ===');
if (onlyInD.length > 5 || onlyInC.length > 5) {
  console.log('⚠️  Projects have DIFFERENT custom fields!');
  console.log('    You should create project-specific mappings:');
  console.log('    - field-mapping-DIGSTART.json');
  console.log('    - field-mapping-CEAJ.json');
  console.log('\n    Run:');
  console.log('      npm run generate-mapping DIGSTART-1258');
  console.log('      npm run generate-mapping CEAJ-3843');
} else {
  console.log('✓ Projects share most custom fields. Single mapping might be sufficient.');
}
