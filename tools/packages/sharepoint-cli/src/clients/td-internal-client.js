const axios = require('axios');
const { NtlmClient } = require('axios-ntlm');
const BaseSharePointClient = require('./base-client');
const { handleApiError } = require('@ea-workspace/shared-utils');
const fs = require('fs');
const path = require('path');

/**
 * TDInternalClient - SharePoint client for TD Internal (myteam.td.com)
 * Uses SharePoint REST API with NTLM authentication
 */
class TDInternalClient extends BaseSharePointClient {
  constructor(siteUrl, auth, options) {
    super(siteUrl, auth, options);
    // Create HTTP client with NTLM auth
    this.httpClient = this._createHttpClient();
  }
  
  /**
   * Create HTTP client with NTLM or Bearer authentication
   */
  _createHttpClient() {
    if (this.auth.type === 'integrated') {
      // Windows integrated auth - no HTTP client needed (uses PowerShell)
      this.logger.info('Using Windows integrated authentication');
      return null;
    } else if (this.auth.type === 'ntlm') {
      // NtlmClient returns an axios instance configured with NTLM auth
      return NtlmClient({
        username: this.auth.username,
        password: this.auth.password,
        domain: this.auth.domain,
        workstation: this.auth.workstation || ''
      });
    } else {
      // Bearer token fallback
      return axios.create({
        baseURL: this.siteUrl,
        headers: {
          'Authorization': `Bearer ${this.auth.token}`,
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
    }
  }
  
  /**
   * Build SharePoint REST API URL
   */
  _buildRestApiUrl(endpoint) {
    return `${this.siteUrl}/_api/${endpoint}`;
  }
  
  /**
   * Upload file to SharePoint
   */
  async uploadFile(options) {
    try {
      const { filePath, targetFolder, overwrite = false } = options;
      
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      
      this.validateFileSize(fileSize);
      
      const url = this._buildRestApiUrl(
        `web/GetFolderByServerRelativeUrl('${targetFolder}')/Files/add(url='${fileName}',overwrite=${overwrite})`
      );
      
      this.logger.info('Uploading file to TD SharePoint', {
        fileName,
        targetFolder,
        size: fileSize
      });
      
      const response = await this.httpClient.post(url, fileContent, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      const result = {
        success: true,
        fileUrl: response.data.d.ServerRelativeUrl,
        fileName: response.data.d.Name,
        size: fileSize,
        uploadedAt: new Date(),
        serverUrl: `${this.siteUrl}${response.data.d.ServerRelativeUrl}`
      };
      
      this.logger.info('File uploaded successfully', result);
      return result;
      
    } catch (error) {
      this.logger.error('Upload failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Download file from SharePoint
   */
  async downloadFile(options) {
    try {
      const { fileUrl, outputPath } = options;
      
      // On Windows, use PowerShell with integrated auth (more reliable for TD SharePoint)
      if (process.platform === 'win32') {
        return await this._downloadViaPowerShell(fileUrl, outputPath);
      }
      
      // Fallback: Extract server-relative URL if full URL provided
      let serverRelativeUrl = fileUrl;
      if (fileUrl.startsWith('http')) {
        const urlObj = new URL(fileUrl);
        serverRelativeUrl = urlObj.pathname;
      }
      
      const url = this._buildRestApiUrl(
        `web/GetFileByServerRelativeUrl('${serverRelativeUrl}')/$value`
      );
      
      this.logger.info('Downloading file from TD SharePoint', {
        fileUrl: serverRelativeUrl,
        outputPath
      });
      
      const response = await this.httpClient.get(url, {
        responseType: 'arraybuffer'
      });
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputPath, response.data);
      
      const result = {
        success: true,
        outputPath,
        size: response.data.length
      };
      
      this.logger.info('File downloaded successfully', result);
      return result;
      
    } catch (error) {
      this.logger.error('Download failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Download file using PowerShell with Windows integrated authentication
   * This works better for TD Internal SharePoint which uses Kerberos/NTLM SSPI
   */
  async _downloadViaPowerShell(fileUrl, outputPath) {
    const { execSync } = require('child_process');
    
    try {
      // Resolve full URL if needed
      let fullUrl = fileUrl;
      if (!fileUrl.startsWith('http')) {
        fullUrl = `${this.siteUrl}${fileUrl}`;
      }
      
      // Handle OneDrive share links (mydrive.td.com)
      fullUrl = this._convertOneDriveShareLink(fullUrl);
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Resolve to absolute path
      const absoluteOutputPath = path.resolve(outputPath);
      
      // Escape single quotes in paths for PowerShell
      const escapedUrl = fullUrl.replace(/'/g, "''");
      const escapedPath = absoluteOutputPath.replace(/'/g, "''");
      
      // PowerShell command with Windows integrated authentication
      const psCommand = `Invoke-WebRequest -Uri '${escapedUrl}' -UseDefaultCredentials -OutFile '${escapedPath}' -UseBasicParsing`;
      
      this.logger.info('Using PowerShell with Windows integrated auth', {
        fileUrl: fullUrl,
        outputPath: absoluteOutputPath
      });
      
      // Execute PowerShell command
      execSync(`powershell -Command "${psCommand}"`, {
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Verify file was downloaded
      if (!fs.existsSync(absoluteOutputPath)) {
        throw new Error('File download failed - output file not created');
      }
      
      const stats = fs.statSync(absoluteOutputPath);
      
      const result = {
        success: true,
        outputPath: absoluteOutputPath,
        size: stats.size,
        method: 'PowerShell (Windows Integrated Auth)'
      };
      
      this.logger.info('File downloaded successfully via PowerShell', result);
      return result;
      
    } catch (error) {
      this.logger.error('PowerShell download failed', { error: error.message });
      throw new Error(`PowerShell download failed: ${error.message}`);
    }
  }
  
  /**
   * Convert OneDrive share link to direct download URL
   * @param {string} url - Original URL (may be share link or direct URL)
   * @returns {string} Direct download URL
   */
  _convertOneDriveShareLink(url) {
    try {
      const urlObj = new URL(url);
      
      // Check if it's a OneDrive share link (mydrive.td.com with :w:, :b:, :x:, :p: patterns)
      if (urlObj.hostname.includes('mydrive.td.com') && 
          (url.includes(':w:/') || url.includes(':b:/') || url.includes(':x:/') || url.includes(':p:/'))) {
        
        this.logger.info('OneDrive share link detected - converting to download URL', { originalUrl: url });
        
        // Add &download=1 parameter to convert share link to direct download
        // This works with PowerShell Invoke-WebRequest + UseDefaultCredentials
        const downloadUrl = url.includes('?') 
          ? `${url}&download=1` 
          : `${url}?download=1`;
        
        this.logger.info('Converted OneDrive share link to download URL', { downloadUrl });
        return downloadUrl;
      }
      
      // Not a share link, return original
      return url;
      
    } catch (error) {
      this.logger.warn('Error processing OneDrive share link', {
        error: error.message,
        url
      });
      // Return original URL if parsing fails
      return url;
    }
  }
  
  /**
   * List files in SharePoint folder
   */
  async listFiles(options) {
    try {
      const { folderPath, recursive = false } = options;
      
      const url = this._buildRestApiUrl(
        `web/GetFolderByServerRelativeUrl('${folderPath}')/Files`
      );
      
      this.logger.info('Listing files in TD SharePoint', { folderPath });
      
      const response = await this.httpClient.get(url, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      const files = response.data.d.results.map(file => ({
        name: file.Name,
        path: file.ServerRelativeUrl,
        size: file.Length,
        modifiedAt: new Date(file.TimeLastModified),
        modifiedBy: file.ModifiedBy?.Title || 'Unknown',
        url: `${this.siteUrl}${file.ServerRelativeUrl}`,
        type: path.extname(file.Name).substring(1),
        checkoutUser: file.CheckedOutByUser?.Title || null
      }));
      
      this.logger.info('Files listed successfully', {
        folderPath,
        count: files.length
      });
      
      return files;
      
    } catch (error) {
      this.logger.error('List files failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Search for files in SharePoint
   */
  async searchFiles(options) {
    try {
      const { query, fileType, maxResults = 50 } = options;
      
      let filter = `substringof('${query}',FileLeafRef)`;
      if (fileType) {
        filter += ` and endswith(FileLeafRef,'.${fileType}')`;
      }
      
      const url = this._buildRestApiUrl(
        `web/lists/getbytitle('Documents')/items?$filter=${filter}&$top=${maxResults}`
      );
      
      this.logger.info('Searching files in TD SharePoint', { query, fileType });
      
      const response = await this.httpClient.get(url, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      const files = response.data.d.results.map(item => ({
        name: item.FileLeafRef,
        path: item.FileRef,
        modifiedAt: new Date(item.Modified),
        modifiedBy: item.Editor?.Title || 'Unknown',
        url: `${this.siteUrl}${item.FileRef}`,
        type: path.extname(item.FileLeafRef).substring(1)
      }));
      
      this.logger.info('Search completed', { query, count: files.length });
      return files;
      
    } catch (error) {
      this.logger.error('Search failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Create folder in SharePoint
   */
  async createFolder(options) {
    try {
      const { folderPath } = options;
      
      const url = this._buildRestApiUrl(`web/folders`);
      
      this.logger.info('Creating folder in TD SharePoint', { folderPath });
      
      const response = await this.httpClient.post(url, {
        '__metadata': { 'type': 'SP.Folder' },
        'ServerRelativeUrl': folderPath
      }, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        }
      });
      
      const result = {
        success: true,
        folderUrl: response.data.d.ServerRelativeUrl,
        serverUrl: `${this.siteUrl}${response.data.d.ServerRelativeUrl}`
      };
      
      this.logger.info('Folder created successfully', result);
      return result;
      
    } catch (error) {
      this.logger.error('Create folder failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Get file metadata
   */
  async getMetadata(options) {
    try {
      const { fileUrl } = options;
      
      let serverRelativeUrl = fileUrl;
      if (fileUrl.startsWith('http')) {
        const urlObj = new URL(fileUrl);
        serverRelativeUrl = urlObj.pathname;
      }
      
      const url = this._buildRestApiUrl(
        `web/GetFileByServerRelativeUrl('${serverRelativeUrl}')/ListItemAllFields`
      );
      
      this.logger.info('Getting metadata from TD SharePoint', { fileUrl: serverRelativeUrl });
      
      const response = await this.httpClient.get(url, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      const data = response.data.d;
      const metadata = {
        title: data.Title,
        fileName: data.FileLeafRef,
        created: new Date(data.Created),
        modified: new Date(data.Modified),
        createdBy: data.Author?.Title || 'Unknown',
        modifiedBy: data.Editor?.Title || 'Unknown',
        fileSize: data.File_x0020_Size,
        fileType: data.File_x0020_Type,
        customFields: {}
      };
      
      // Extract custom fields (exclude system fields)
      const systemFields = ['__metadata', 'Title', 'FileLeafRef', 'Created', 'Modified', 'Author', 'Editor', 'File_x0020_Size', 'File_x0020_Type'];
      Object.keys(data).forEach(key => {
        if (!systemFields.includes(key) && !key.startsWith('_') && data[key] !== null) {
          metadata.customFields[key] = data[key];
        }
      });
      
      this.logger.info('Metadata retrieved successfully');
      return metadata;
      
    } catch (error) {
      this.logger.error('Get metadata failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Update file metadata
   */
  async updateMetadata(options) {
    try {
      const { fileUrl, metadata } = options;
      
      let serverRelativeUrl = fileUrl;
      if (fileUrl.startsWith('http')) {
        const urlObj = new URL(fileUrl);
        serverRelativeUrl = urlObj.pathname;
      }
      
      const url = this._buildRestApiUrl(
        `web/GetFileByServerRelativeUrl('${serverRelativeUrl}')/ListItemAllFields`
      );
      
      this.logger.info('Updating metadata in TD SharePoint', {
        fileUrl: serverRelativeUrl,
        metadata
      });
      
      // Format metadata for SharePoint
      const updateData = {
        '__metadata': { 'type': 'SP.Data.Shared_x0020_DocumentsItem' },
        ...metadata
      };
      
      const response = await this.httpClient.post(url, updateData, {
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose',
          'X-HTTP-Method': 'MERGE',
          'IF-MATCH': '*'
        }
      });
      
      const result = {
        success: true,
        updated: Object.keys(metadata)
      };
      
      this.logger.info('Metadata updated successfully', result);
      return result;
      
    } catch (error) {
      this.logger.error('Update metadata failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Test connection to TD SharePoint
   */
  async testConnection() {
    try {
      const url = this._buildRestApiUrl('web');
      
      const response = await this.httpClient.get(url, {
        headers: {
          'Accept': 'application/json;odata=verbose'
        }
      });
      
      this.logger.info('Connection test successful', {
        siteTitle: response.data.d.Title
      });
      
      return true;
    } catch (error) {
      this.logger.error('Connection test failed', { error: error.message });
      return false;
    }
  }
}

module.exports = TDInternalClient;
