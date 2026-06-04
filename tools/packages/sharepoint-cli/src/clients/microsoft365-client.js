const axios = require('axios');
const BaseSharePointClient = require('./base-client');
const { handleApiError } = require('@ea-workspace/shared-utils');
const fs = require('fs');
const path = require('path');

/**
 * Microsoft365Client - SharePoint client for Microsoft 365 (*.sharepoint.com)
 * Uses Microsoft Graph API with Bearer token authentication
 */
class Microsoft365Client extends BaseSharePointClient {
  constructor(siteUrl, auth, options) {
    super(siteUrl, auth, options);
    this.httpClient = this._createHttpClient();
    this.siteId = null;
    this.driveId = null;
  }
  
  /**
   * Create HTTP client with Bearer token authentication
   */
  _createHttpClient() {
    return axios.create({
      baseURL: 'https://graph.microsoft.com/v1.0',
      headers: {
        'Authorization': `Bearer ${this.auth.token}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  /**
   * Initialize site and drive IDs (cached after first call)
   */
  async _initializeSiteInfo() {
    if (this.siteId && this.driveId) {
      return; // Already initialized
    }
    
    try {
      // Parse site URL to get hostname and site path
      const url = new URL(this.siteUrl);
      const hostname = url.hostname;
      const sitePath = url.pathname;
      
      this.logger.info('Initializing M365 site info', { hostname, sitePath });
      
      // Get site ID
      const siteResponse = await this.httpClient.get(
        `/sites/${hostname}:${sitePath}`
      );
      this.siteId = siteResponse.data.id;
      
      // Get default drive ID (Documents library)
      const drivesResponse = await this.httpClient.get(
        `/sites/${this.siteId}/drives`
      );
      this.driveId = drivesResponse.data.value[0].id;
      
      this.logger.info('Site info initialized', {
        siteId: this.siteId,
        driveId: this.driveId
      });
    } catch (error) {
      this.logger.error('Failed to initialize site info', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Upload file to SharePoint
   */
  async uploadFile(options) {
    try {
      await this._initializeSiteInfo();
      
      const { filePath, targetFolder, overwrite = false } = options;
      
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);
      const fileSize = fs.statSync(filePath).size;
      
      this.validateFileSize(fileSize);
      
      const uploadPath = targetFolder.endsWith('/') 
        ? `${targetFolder}${fileName}` 
        : `${targetFolder}/${fileName}`;
      
      const url = `/sites/${this.siteId}/drives/${this.driveId}/root:${uploadPath}:/content`;
      
      this.logger.info('Uploading file to Microsoft 365 SharePoint', {
        fileName,
        targetFolder,
        size: fileSize
      });
      
      const response = await this.httpClient.put(url, fileContent, {
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });
      
      const result = {
        success: true,
        fileUrl: response.data.webUrl,
        fileName: response.data.name,
        itemId: response.data.id,
        size: response.data.size,
        uploadedAt: new Date()
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
      await this._initializeSiteInfo();
      
      const { itemId, fileUrl, outputPath } = options;
      
      let downloadUrl;
      
      if (itemId) {
        // Download by item ID
        downloadUrl = `/sites/${this.siteId}/drives/${this.driveId}/items/${itemId}/content`;
      } else if (fileUrl) {
        // Extract path from URL and download
        const urlObj = new URL(fileUrl);
        const filePath = decodeURIComponent(urlObj.pathname);
        downloadUrl = `/sites/${this.siteId}/drives/${this.driveId}/root:${filePath}:/content`;
      } else {
        throw new Error('Either itemId or fileUrl must be provided');
      }
      
      this.logger.info('Downloading file from Microsoft 365 SharePoint', {
        itemId,
        fileUrl,
        outputPath
      });
      
      const response = await this.httpClient.get(downloadUrl, {
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
   * List files in SharePoint folder
   */
  async listFiles(options) {
    try {
      await this._initializeSiteInfo();
      
      const { folderPath = '', recursive = false } = options;
      
      let url;
      if (folderPath && folderPath !== '/') {
        url = `/sites/${this.siteId}/drives/${this.driveId}/root:${folderPath}:/children`;
      } else {
        url = `/sites/${this.siteId}/drives/${this.driveId}/root/children`;
      }
      
      this.logger.info('Listing files in Microsoft 365 SharePoint', { folderPath });
      
      const response = await this.httpClient.get(url);
      
      const files = response.data.value
        .filter(item => item.file) // Only files, not folders
        .map(file => ({
          name: file.name,
          path: file.parentReference.path,
          size: file.size,
          itemId: file.id,
          modifiedAt: new Date(file.lastModifiedDateTime),
          modifiedBy: file.lastModifiedBy?.user?.displayName || 'Unknown',
          url: file.webUrl,
          type: path.extname(file.name).substring(1),
          downloadUrl: file['@microsoft.graph.downloadUrl']
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
      await this._initializeSiteInfo();
      
      const { query, fileType, maxResults = 50 } = options;
      
      let searchQuery = query;
      if (fileType) {
        searchQuery += ` .${fileType}`;
      }
      
      const url = `/sites/${this.siteId}/drive/root/search(q='${encodeURIComponent(searchQuery)}')?top=${maxResults}`;
      
      this.logger.info('Searching files in Microsoft 365 SharePoint', { query, fileType });
      
      const response = await this.httpClient.get(url);
      
      const files = response.data.value
        .filter(item => item.file)
        .map(file => ({
          name: file.name,
          path: file.parentReference.path,
          size: file.size,
          itemId: file.id,
          modifiedAt: new Date(file.lastModifiedDateTime),
          modifiedBy: file.lastModifiedBy?.user?.displayName || 'Unknown',
          url: file.webUrl,
          type: path.extname(file.name).substring(1)
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
      await this._initializeSiteInfo();
      
      const { folderName, parentPath = '' } = options;
      
      let url;
      if (parentPath && parentPath !== '/') {
        url = `/sites/${this.siteId}/drives/${this.driveId}/root:${parentPath}:/children`;
      } else {
        url = `/sites/${this.siteId}/drives/${this.driveId}/root/children`;
      }
      
      this.logger.info('Creating folder in Microsoft 365 SharePoint', {
        folderName,
        parentPath
      });
      
      const response = await this.httpClient.post(url, {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename'
      });
      
      const result = {
        success: true,
        folderUrl: response.data.webUrl,
        folderId: response.data.id,
        folderName: response.data.name
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
      await this._initializeSiteInfo();
      
      const { itemId, fileUrl } = options;
      
      let url;
      if (itemId) {
        url = `/sites/${this.siteId}/drives/${this.driveId}/items/${itemId}`;
      } else if (fileUrl) {
        const urlObj = new URL(fileUrl);
        const filePath = decodeURIComponent(urlObj.pathname);
        url = `/sites/${this.siteId}/drives/${this.driveId}/root:${filePath}`;
      } else {
        throw new Error('Either itemId or fileUrl must be provided');
      }
      
      this.logger.info('Getting metadata from Microsoft 365 SharePoint', { itemId, fileUrl });
      
      const response = await this.httpClient.get(url);
      const data = response.data;
      
      const metadata = {
        name: data.name,
        size: data.size,
        created: new Date(data.createdDateTime),
        modified: new Date(data.lastModifiedDateTime),
        createdBy: data.createdBy?.user?.displayName || 'Unknown',
        modifiedBy: data.lastModifiedBy?.user?.displayName || 'Unknown',
        itemId: data.id,
        webUrl: data.webUrl,
        downloadUrl: data['@microsoft.graph.downloadUrl'],
        mimeType: data.file?.mimeType
      };
      
      this.logger.info('Metadata retrieved successfully');
      return metadata;
      
    } catch (error) {
      this.logger.error('Get metadata failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Update file metadata (limited in Graph API)
   */
  async updateMetadata(options) {
    try {
      await this._initializeSiteInfo();
      
      const { itemId, metadata } = options;
      
      if (!itemId) {
        throw new Error('itemId is required for updating metadata in Microsoft 365');
      }
      
      const url = `/sites/${this.siteId}/drives/${this.driveId}/items/${itemId}`;
      
      this.logger.info('Updating metadata in Microsoft 365 SharePoint', {
        itemId,
        metadata
      });
      
      // Graph API only allows updating limited fields
      const updateData = {};
      if (metadata.name) updateData.name = metadata.name;
      if (metadata.description) updateData.description = metadata.description;
      
      const response = await this.httpClient.patch(url, updateData);
      
      const result = {
        success: true,
        updated: Object.keys(updateData)
      };
      
      this.logger.info('Metadata updated successfully', result);
      return result;
      
    } catch (error) {
      this.logger.error('Update metadata failed', { error: error.message });
      throw handleApiError(error);
    }
  }
  
  /**
   * Test connection to Microsoft 365 SharePoint
   */
  async testConnection() {
    try {
      await this._initializeSiteInfo();
      
      const url = `/sites/${this.siteId}`;
      const response = await this.httpClient.get(url);
      
      this.logger.info('Connection test successful', {
        siteName: response.data.displayName
      });
      
      return true;
    } catch (error) {
      this.logger.error('Connection test failed', { error: error.message });
      return false;
    }
  }
}

module.exports = Microsoft365Client;
