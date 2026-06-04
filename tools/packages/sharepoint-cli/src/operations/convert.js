const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

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
 * Convert document to markdown
 * @param {string} inputPath - Input file path (.docx)
 * @param {string} outputPath - Output file path (.md)
 * @param {Object} logger - Logger instance
 * @param {Object} options - Conversion options
 * @returns {Promise<Object>} Conversion result
 */
async function convertToMarkdown(inputPath, outputPath, logger, options = {}) {
  // Resolve paths relative to workspace root if they're relative
  let resolvedInputPath = inputPath;
  let resolvedOutputPath = outputPath;
  
  if (!path.isAbsolute(inputPath)) {
    const workspaceRoot = findWorkspaceRoot();
    resolvedInputPath = path.join(workspaceRoot, inputPath);
    logger.info('Resolved input path relative to workspace root', {
      workspaceRoot,
      relativePath: inputPath,
      absolutePath: resolvedInputPath
    });
  }
  
  if (!path.isAbsolute(outputPath)) {
    const workspaceRoot = findWorkspaceRoot();
    resolvedOutputPath = path.join(workspaceRoot, outputPath);
    logger.info('Resolved output path relative to workspace root', {
      workspaceRoot,
      relativePath: outputPath,
      absolutePath: resolvedOutputPath
    });
  }
  
  logger.info('Starting document conversion', {
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
  if (ext !== '.docx') {
    throw new Error(`Unsupported file format: ${ext}. Only .docx files are supported.`);
  }
  
  try {
    // Read the .docx file
    const buffer = fs.readFileSync(resolvedInputPath);
    
    // Ensure output directory exists
    const outputDir = path.dirname(resolvedOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create images directory alongside the markdown file
    const baseName = path.basename(resolvedOutputPath, '.md');
    const imagesDir = path.join(outputDir, `${baseName}-images`);
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    let imageCounter = 0;
    const savedImages = [];
    
    // Convert to markdown using mammoth with custom image handler
    const result = await mammoth.convertToMarkdown(buffer, {
      styleMap: options.styleMap || [
        "p[style-name='Heading 1'] => # ",
        "p[style-name='Heading 2'] => ## ",
        "p[style-name='Heading 3'] => ### ",
        "p[style-name='Heading 4'] => #### ",
        "p[style-name='Heading 5'] => ##### ",
        "p[style-name='Heading 6'] => ###### "
      ],
      convertImage: mammoth.images.imgElement(function(image) {
        return image.read("base64").then(function(imageBuffer) {
          imageCounter++;
          
          // Determine file extension from content type
          const contentType = image.contentType || 'image/png';
          const extension = contentType.split('/')[1] || 'png';
          const imageName = `image-${imageCounter}.${extension}`;
          const imagePath = path.join(imagesDir, imageName);
          
          // Convert base64 to buffer and save
          const buffer = Buffer.from(imageBuffer, 'base64');
          fs.writeFileSync(imagePath, buffer);
          
          savedImages.push({
            name: imageName,
            path: imagePath,
            size: buffer.length,
            contentType: contentType
          });
          
          logger.info('Extracted image', {
            name: imageName,
            size: buffer.length,
            contentType: contentType
          });
          
          // Return relative path for markdown
          return {
            src: `./${baseName}-images/${imageName}`
          };
        });
      })
    });
    
    // Write markdown to output file
    fs.writeFileSync(resolvedOutputPath, result.value, 'utf8');
    
    // Get file stats
    const inputStats = fs.statSync(resolvedInputPath);
    const outputStats = fs.statSync(resolvedOutputPath);
    
    // Log any conversion warnings
    if (result.messages && result.messages.length > 0) {
      logger.warn('Conversion completed with warnings', {
        warnings: result.messages.map(m => m.message)
      });
    }
    
    const conversionResult = {
      success: true,
      inputPath: resolvedInputPath,
      outputPath: resolvedOutputPath,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      format: 'markdown',
      warnings: result.messages || [],
      images: savedImages,
      imagesDirectory: savedImages.length > 0 ? imagesDir : null
    };
    
    logger.info('Conversion completed successfully', conversionResult);
    return conversionResult;
    
  } catch (error) {
    logger.error('Conversion failed', {
      error: error.message,
      inputPath: resolvedInputPath,
      outputPath: resolvedOutputPath
    });
    throw error;
  }
}

module.exports = { convertToMarkdown };
