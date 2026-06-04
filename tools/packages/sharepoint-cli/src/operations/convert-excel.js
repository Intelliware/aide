const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

/**
 * Find workspace root by looking for workspace markers
 */
function findWorkspaceRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;
  
  while (currentDir !== root) {
    // Check for workspace markers
    if (fs.existsSync(path.join(currentDir, '.env')) ||
        fs.existsSync(path.join(currentDir, 'easyapply.code-workspace')) ||
        fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Default to current directory if no workspace found
  return startDir;
}

/**
 * Convert a worksheet to markdown table
 * @param {Object} sheet - XLSX worksheet object
 * @param {Object} options - Conversion options
 * @returns {string} Markdown table
 */
function sheetToMarkdownTable(sheet, options = {}) {
  // Convert sheet to JSON (array of objects)
  const data = XLSX.utils.sheet_to_json(sheet, { 
    header: 1, // Use array of arrays
    defval: '', // Default value for empty cells
    blankrows: options.includeBlankRows || false
  });
  
  if (!data || data.length === 0) {
    return '*No data in this sheet*\n\n';
  }
  
  // Filter out completely empty rows
  const nonEmptyRows = data.filter(row => 
    row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );
  
  if (nonEmptyRows.length === 0) {
    return '*No data in this sheet*\n\n';
  }
  
  // Get max columns
  const maxCols = Math.max(...nonEmptyRows.map(row => row.length));
  
  // Normalize all rows to have the same length
  const normalizedRows = nonEmptyRows.map(row => {
    const normalized = [...row];
    while (normalized.length < maxCols) {
      normalized.push('');
    }
    return normalized;
  });
  
  // Build markdown table
  let markdown = '';
  
  // Header row
  const headers = normalizedRows[0].map(cell => String(cell || '').trim() || 'Column');
  markdown += '| ' + headers.join(' | ') + ' |\n';
  
  // Separator row
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  // Data rows
  for (let i = 1; i < normalizedRows.length; i++) {
    const row = normalizedRows[i];
    const cells = row.map(cell => {
      // Convert cell to string and escape pipe characters
      let value = String(cell ?? '').trim();
      value = value.replace(/\|/g, '\\|');
      // Escape newlines in cells
      value = value.replace(/\n/g, '<br>');
      return value;
    });
    markdown += '| ' + cells.join(' | ') + ' |\n';
  }
  
  return markdown + '\n';
}

/**
 * Format Excel workbook into markdown
 * @param {Object} workbook - XLSX workbook object
 * @param {Object} options - Formatting options
 * @returns {string} Formatted markdown
 */
function formatExcelToMarkdown(workbook, options = {}) {
  let markdown = '';
  
  // Add metadata if requested
  if (options.metadata && workbook.Props) {
    markdown += '# Document Metadata\n\n';
    
    const props = workbook.Props;
    if (props.Title) markdown += `**Title:** ${props.Title}\n\n`;
    if (props.Subject) markdown += `**Subject:** ${props.Subject}\n\n`;
    if (props.Author) markdown += `**Author:** ${props.Author}\n\n`;
    if (props.Company) markdown += `**Company:** ${props.Company}\n\n`;
    if (props.CreatedDate) markdown += `**Created:** ${new Date(props.CreatedDate).toLocaleString()}\n\n`;
    if (props.ModifiedDate) markdown += `**Modified:** ${new Date(props.ModifiedDate).toLocaleString()}\n\n`;
    
    markdown += '---\n\n';
  }
  
  // Get sheet names
  const sheetNames = workbook.SheetNames;
  
  if (!sheetNames || sheetNames.length === 0) {
    markdown += '*Workbook contains no sheets*\n';
    return markdown;
  }
  
  // Process specific sheet if requested
  if (options.sheet) {
    const sheetIndex = parseInt(options.sheet) - 1; // Convert to 0-based index
    const sheetName = isNaN(sheetIndex) ? options.sheet : sheetNames[sheetIndex];
    
    if (!workbook.Sheets[sheetName]) {
      throw new Error(`Sheet "${options.sheet}" not found. Available sheets: ${sheetNames.join(', ')}`);
    }
    
    markdown += `# ${sheetName}\n\n`;
    markdown += sheetToMarkdownTable(workbook.Sheets[sheetName], options);
    
    return markdown;
  }
  
  // Process all sheets
  const includeTableOfContents = sheetNames.length > 1 && !options.noToc;
  
  if (includeTableOfContents) {
    markdown += '# Table of Contents\n\n';
    sheetNames.forEach((name, index) => {
      const anchor = name.toLowerCase().replace(/[^\w]+/g, '-');
      markdown += `${index + 1}. [${name}](#${anchor})\n`;
    });
    markdown += '\n---\n\n';
  }
  
  // Process each sheet
  sheetNames.forEach((sheetName, index) => {
    if (index > 0) {
      markdown += '\n---\n\n';
    }
    
    markdown += `# ${sheetName}\n\n`;
    
    const sheet = workbook.Sheets[sheetName];
    markdown += sheetToMarkdownTable(sheet, options);
  });
  
  return markdown;
}

/**
 * Convert Excel file to markdown
 * @param {string} inputPath - Input file path (.xlsx, .xls)
 * @param {string|null} outputPath - Output file path (.md), or null for default (documentation/converted-docs/)
 * @param {Object} logger - Logger instance
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Conversion result
 */
async function convertExcelToMarkdown(inputPath, outputPath, logger, options = {}) {
  // Resolve paths relative to workspace root if they're relative
  const workspaceRoot = findWorkspaceRoot();
  let resolvedInputPath = inputPath;
  let resolvedOutputPath = outputPath;
  
  if (!path.isAbsolute(inputPath)) {
    resolvedInputPath = path.join(workspaceRoot, inputPath);
    logger.info('Resolved input path relative to workspace root', {
      workspaceRoot,
      relativePath: inputPath,
      absolutePath: resolvedInputPath
    });
  }
  
  // If no output path provided, use default folder
  if (!outputPath) {
    const inputExt = path.extname(resolvedInputPath);
    const inputFileName = path.basename(resolvedInputPath, inputExt);
    const defaultFolder = path.join(workspaceRoot, 'documentation', 'converted-docs');
    resolvedOutputPath = path.join(defaultFolder, `${inputFileName}.md`);
    logger.info('No output path provided, using default folder', {
      defaultFolder,
      outputPath: resolvedOutputPath
    });
  } else if (!path.isAbsolute(outputPath)) {
    resolvedOutputPath = path.join(workspaceRoot, outputPath);
    logger.info('Resolved output path relative to workspace root', {
      workspaceRoot,
      relativePath: outputPath,
      absolutePath: resolvedOutputPath
    });
  }
  
  logger.info('Starting Excel conversion', {
    inputPath: resolvedInputPath,
    outputPath: resolvedOutputPath,
    format: 'markdown'
  });
  
  // Check if input file exists
  if (!fs.existsSync(resolvedInputPath)) {
    throw new Error(`Input file not found: ${resolvedInputPath}`);
  }
  
  // Check file extension
  const ext = path.extname(resolvedInputPath).toLowerCase();
  const supportedFormats = ['.xlsx', '.xls', '.xlsm', '.xlsb', '.csv'];
  if (!supportedFormats.includes(ext)) {
    throw new Error(`Unsupported file format: ${ext}. Supported formats: ${supportedFormats.join(', ')}`);
  }
  
  try {
    // Read the Excel file
    const workbook = XLSX.readFile(resolvedInputPath);
    
    logger.info('Excel file parsed successfully', {
      sheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames
    });
    
    // Format workbook into markdown
    const markdown = formatExcelToMarkdown(workbook, {
      metadata: options.metadata,
      sheet: options.sheet,
      noToc: options.noToc,
      includeBlankRows: options.includeBlankRows
    });
    
    // Ensure output directory exists
    const outputDir = path.dirname(resolvedOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.info('Created output directory', { directory: outputDir });
    }
    
    // Write markdown file
    fs.writeFileSync(resolvedOutputPath, markdown, 'utf8');
    
    const inputStats = fs.statSync(resolvedInputPath);
    const outputStats = fs.statSync(resolvedOutputPath);
    
    logger.info('Conversion completed successfully', {
      inputSize: inputStats.size,
      outputSize: outputStats.size
    });
    
    const warnings = [];
    
    // Check for very large files
    if (inputStats.size > 10 * 1024 * 1024) { // 10MB
      warnings.push('Large input file detected. Conversion may take longer.');
    }
    
    return {
      inputPath: resolvedInputPath,
      outputPath: resolvedOutputPath,
      sheets: workbook.SheetNames.length,
      sheetNames: workbook.SheetNames,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      warnings: warnings.length > 0 ? warnings : null
    };
    
  } catch (error) {
    logger.error('Excel conversion failed', {
      error: error.message,
      stack: error.stack
    });
    
    // Re-throw with more context
    if (error.message.includes('Unsupported file')) {
      throw new Error(`Failed to parse Excel file: ${error.message}. The file may be corrupted or password-protected.`);
    }
    
    throw error;
  }
}

module.exports = { convertExcelToMarkdown };
