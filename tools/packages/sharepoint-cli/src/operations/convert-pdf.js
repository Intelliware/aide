const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

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
 * Format extracted PDF text into readable markdown
 * @param {string} text - Raw text from PDF
 * @param {Object} metadata - PDF metadata
 * @param {Object} options - Formatting options
 * @returns {string} Formatted markdown
 */
function formatPdfToMarkdown(text, metadata, options = {}) {
  let markdown = '';
  
  // Add metadata header if requested
  if (options.metadata && metadata) {
    markdown += '# Document Metadata\n\n';
    
    if (metadata.info) {
      if (metadata.info.Title) markdown += `**Title:** ${metadata.info.Title}\n\n`;
      if (metadata.info.Author) markdown += `**Author:** ${metadata.info.Author}\n\n`;
      if (metadata.info.Subject) markdown += `**Subject:** ${metadata.info.Subject}\n\n`;
      if (metadata.info.Creator) markdown += `**Creator:** ${metadata.info.Creator}\n\n`;
      if (metadata.info.Producer) markdown += `**Producer:** ${metadata.info.Producer}\n\n`;
      if (metadata.info.CreationDate) markdown += `**Created:** ${metadata.info.CreationDate}\n\n`;
      if (metadata.info.ModDate) markdown += `**Modified:** ${metadata.info.ModDate}\n\n`;
    }
    
    markdown += `**Pages:** ${metadata.numpages || 'Unknown'}\n\n`;
    markdown += '---\n\n';
  }
  
  // Clean up text
  let cleanText = text
    // Remove excessive whitespace
    .replace(/[ \t]{2,}/g, ' ')
    // Remove excessive line breaks (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Trim lines
    .split('\n')
    .map(line => line.trim())
    .join('\n');
  
  // Basic heading detection (lines in ALL CAPS or Title Case followed by content)
  const lines = cleanText.split('\n');
  const formattedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    
    // Skip empty lines
    if (!line) {
      formattedLines.push('');
      continue;
    }
    
    // Detect potential headings
    const isAllCaps = line === line.toUpperCase() && line.length > 3 && /[A-Z]/.test(line);
    const isTitleCase = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(line) && line.length > 5;
    const isShortLine = line.length < 60;
    const hasNextLine = nextLine && nextLine.length > 0;
    
    if ((isAllCaps || isTitleCase) && isShortLine && hasNextLine) {
      // Likely a heading
      formattedLines.push(`## ${line}`);
    } else {
      formattedLines.push(line);
    }
  }
  
  markdown += formattedLines.join('\n');
  
  // Clean up markdown
  markdown = markdown
    // Remove more than 2 consecutive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Ensure proper spacing around headings
    .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
    .replace(/(#{1,6}\s.*)\n([^\n#])/g, '$1\n\n$2')
    // Trim
    .trim();
  
  return markdown;
}

/**
 * Convert PDF to markdown
 * @param {string} inputPath - Input file path (.pdf)
 * @param {string|null} outputPath - Output file path (.md), or null for default (documentation/converted-docs/)
 * @param {Object} logger - Logger instance
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Conversion result
 */
async function convertPdfToMarkdown(inputPath, outputPath, logger, options = {}) {
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
    const inputFileName = path.basename(resolvedInputPath, '.pdf');
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
  
  logger.info('Starting PDF conversion', {
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
  if (ext !== '.pdf') {
    throw new Error(`Unsupported file format: ${ext}. Only .pdf files are supported.`);
  }
  
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(resolvedInputPath);
    
    // Parse PDF options
    const parseOptions = {};
    
    // Add page range if specified
    if (options.pages) {
      const pageRange = options.pages.split('-').map(n => parseInt(n.trim()));
      if (pageRange.length === 2) {
        parseOptions.max = pageRange[1];
        // Note: pdf-parse doesn't support starting page, only max pages
        logger.info('Page range specified', { pages: options.pages });
      }
    }
    
    // Parse PDF
    const data = await pdfParse(dataBuffer, parseOptions);
    
    logger.info('PDF parsed successfully', {
      pages: data.numpages,
      textLength: data.text.length,
      hasMetadata: !!data.metadata
    });
    
    // Format extracted text into markdown
    const markdown = formatPdfToMarkdown(data.text, data, {
      metadata: options.metadata
    });
    
    // Ensure output directory exists
    const outputDir = path.dirname(resolvedOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write markdown to output file
    fs.writeFileSync(resolvedOutputPath, markdown, 'utf8');
    
    // Get file stats
    const inputStats = fs.statSync(resolvedInputPath);
    const outputStats = fs.statSync(resolvedOutputPath);
    
    // Build warnings array
    const warnings = [];
    
    if (data.text.length < 100) {
      warnings.push('Output text is very short - PDF may be scanned or encrypted');
    }
    
    if (data.text.includes('�')) {
      warnings.push('Output contains replacement characters - some text may be garbled');
    }
    
    // Log warnings if any
    if (warnings.length > 0) {
      logger.warn('PDF conversion completed with warnings', { warnings });
    }
    
    const conversionResult = {
      success: true,
      inputPath: resolvedInputPath,
      outputPath: resolvedOutputPath,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      pages: data.numpages,
      format: 'markdown',
      warnings
    };
    
    logger.info('PDF conversion completed successfully', conversionResult);
    return conversionResult;
    
  } catch (error) {
    logger.error('PDF conversion failed', {
      error: error.message,
      inputPath: resolvedInputPath,
      outputPath: resolvedOutputPath
    });
    throw error;
  }
}

module.exports = { convertPdfToMarkdown };
