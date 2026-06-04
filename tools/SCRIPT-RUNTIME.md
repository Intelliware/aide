# Script Runtime Configuration

This document explains how skills should handle JSON parsing and scripting based on the user's available runtime environment.

---

## Overview

Users may have different scripting runtimes available:
- **Node.js** (required for CLI tools)
- **Python 3.x** (optional)
- **Python 2.x** (legacy, avoid)

The `SCRIPT_RUNTIME` environment variable tells skills which runtime to use for any custom scripting needs.

---

## Configuration

Set in `.env` file at workspace root:

```bash
# Options: node, python, python3
SCRIPT_RUNTIME=node
```

**Recommended**: Use `node` since it's required for CLI tools anyway.

---

## Detection (During Installation)

During tools installation, the workflow detects available runtimes:

```bash
# Check Python
python --version 2>/dev/null || python3 --version 2>/dev/null

# Check Node.js (always required)
node --version
```

**Priority**:
1. **Node.js** — Always available (required for tools)
2. **Python 3.x** — Optional, use if available and preferred
3. **Python 2.x** — Avoid (deprecated)

---

## Usage in Skills

### Preferred: Agent's Native Capabilities

**Always prefer the agent's native JSON parsing** — no external scripts needed:

```javascript
// ✅ PREFERRED - Works in all environments
const jsonPath = 'cache/jira/PROJ/PROJ-123/PROJ-123.json';
const data = JSON.parse(await read_file({ 
  filePath: jsonPath, 
  startLine: 1, 
  endLine: 5000 
}));

console.log(data.fields.summary);
```

### When Custom Scripts Are Needed

If the agent needs to execute a script for complex parsing:

```javascript
// Check runtime environment
const runtime = process.env.SCRIPT_RUNTIME || 'node';

if (runtime === 'node') {
  // Use Node.js
  await run_in_terminal({
    command: `node -e "const data = require('./cache/jira/PROJ/PROJ-123/PROJ-123.json'); console.log(data.fields.summary);"`,
    isBackground: false,
    timeout: 5000
  });
  
} else if (runtime === 'python3' || runtime === 'python') {
  // Use Python
  await run_in_terminal({
    command: `${runtime} -c "import json; data = json.load(open('cache/jira/PROJ/PROJ-123/PROJ-123.json')); print(data['fields']['summary'])"`,
    isBackground: false,
    timeout: 5000
  });
}
```

---

## Node.js Examples

### Parse JSON File
```bash
node -e "const data = require('./data.json'); console.log(JSON.stringify(data, null, 2));"
```

### Extract Specific Fields
```bash
node -e "const d = require('./cache/jira/PROJ/PROJ-123/PROJ-123.json'); console.log('Summary:', d.fields.summary, '\nStatus:', d.fields.status.name);"
```

### Process Multiple Files
```bash
node -e "
const fs = require('fs');
const files = fs.readdirSync('cache/jira/PROJ/PROJ-123/');
files.forEach(f => {
  if (f.endsWith('.json') && f !== '.meta.json') {
    const data = JSON.parse(fs.readFileSync('cache/jira/PROJ/PROJ-123/' + f));
    console.log(f, ':', data.fields.summary);
  }
});
"
```

---

## Python Examples

### Parse JSON File
```bash
python3 -c "import json; data = json.load(open('data.json')); print(json.dumps(data, indent=2))"
```

### Extract Specific Fields
```bash
python3 -c "
import json
data = json.load(open('cache/jira/PROJ/PROJ-123/PROJ-123.json'))
print(f\"Summary: {data['fields']['summary']}\")
print(f\"Status: {data['fields']['status']['name']}\")
"
```

### Process Multiple Files
```bash
python3 -c "
import os, json
for f in os.listdir('cache/jira/PROJ/PROJ-123/'):
    if f.endswith('.json') and f != '.meta.json':
        path = f'cache/jira/PROJ/PROJ-123/{f}'
        data = json.load(open(path))
        print(f\"{f}: {data['fields']['summary']}\")
"
```

---

## Skills Reference

### Skills That May Need SCRIPT_RUNTIME

- **jira-get** — Parsing cached Jira JSON
- **jira-search** — Aggregating search results
- **jira-extract-requirements** — Building requirement packages
- **confluence-fetch** — Parsing cached Confluence JSON
- **confluence-extract-package** — Building Confluence packages
- **document-convert** — Format-specific conversions

### Best Practices for Skills

1. ✅ **Always prefer agent's native JSON.parse()** — No external scripts needed
2. ✅ **Check `SCRIPT_RUNTIME` before running scripts** — Respect user's environment
3. ✅ **Default to `node`** if `SCRIPT_RUNTIME` not set
4. ✅ **Handle errors gracefully** — Try alternative runtime or ask user
5. ❌ **Never assume Python is available** — It's optional

---

## Troubleshooting

### Script Runtime Not Available

**Error**: `command not found: python` or `command not found: node`

**Solution**:
1. Check `SCRIPT_RUNTIME` value in `.env`
2. Verify the runtime is actually installed:
   ```bash
   node --version
   python3 --version
   ```
3. Update `.env` to match available runtime

### JSON Parsing Fails

**Error**: `SyntaxError: Unexpected token` or `JSONDecodeError`

**Solution**:
1. Verify JSON file exists and is valid
2. Check file permissions
3. Use agent's read_file + JSON.parse (always works)

### Permission Denied

**Error**: `permission denied` when running scripts

**Solution**:
1. Use agent's native capabilities instead of scripts
2. Check file/directory permissions
3. Run from workspace root directory

---

## Migration Guide

### Old Approach (Python-only)
```python
# ❌ Assumes Python is available
import json
data = json.load(open('data.json'))
print(data['field'])
```

### New Approach (Runtime-aware)
```javascript
// ✅ Respects SCRIPT_RUNTIME
const runtime = process.env.SCRIPT_RUNTIME || 'node';
if (runtime === 'node') {
  // Node.js version
} else {
  // Python version
}
```

### Best Approach (Agent-native)
```javascript
// ✅ BEST - No external scripts, works everywhere
const data = JSON.parse(await read_file({ filePath: 'data.json', startLine: 1, endLine: 1000 }));
console.log(data.field);
```

---

## Summary

- **Always set `SCRIPT_RUNTIME=node`** (recommended, always available)
- **Prefer agent's native JSON.parse()** over external scripts
- **Check `SCRIPT_RUNTIME`** before running any custom scripts
- **Handle missing runtimes gracefully** — Never assume Python exists
- **Default to Node.js** if environment variable not set

This ensures skills work reliably across different user environments.
