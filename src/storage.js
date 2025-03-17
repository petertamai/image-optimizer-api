'use strict';

const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

/**
 * Storage - Handles temporary file storage and cleanup
 */
class Storage {
  /**
   * Initialize storage system
   */
  async init() {
    try {
      // Check if storage directory exists
      try {
        await fs.access(config.storage.path);
      } catch (error) {
        // Create storage directory if it doesn't exist
        await fs.mkdir(config.storage.path, { recursive: true });
        console.log(`Created storage directory: ${config.storage.path}`);
      }
      
      // Perform initial cleanup of old files
      await this.cleanOldFiles();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw error;
    }
  }
  
  /**
   * Clean up files older than the retention period
   * 
   * @returns {Promise<number>} Number of deleted files
   */
  async cleanOldFiles() {
    try {
      const files = await fs.readdir(config.storage.path);
      const now = new Date();
      let deletedCount = 0;
      
      // Get retention period in milliseconds
      const retentionMs = config.storage.retentionDays * 24 * 60 * 60 * 1000;
      
      // Process each file
      for (const file of files) {
        const filePath = path.join(config.storage.path, file);
        
        try {
          // Get file stats
          const stats = await fs.stat(filePath);
          
          // Check if file is older than retention period
          const fileAge = now - stats.mtime;
          if (fileAge > retentionMs) {
            // Delete the file
            await fs.unlink(filePath);
            deletedCount++;
          }
        } catch (fileError) {
          console.error(`Error processing file ${filePath}:`, fileError);
          // Continue with other files even if one fails
        }
      }
      
      console.log(`Cleaned ${deletedCount} old files from storage`);
      return deletedCount;
    } catch (error) {
      console.error('Failed to clean old files:', error);
      throw error;
    }
  }
  
  /**
   * Store a file in the temporary storage
   * 
   * @param {Buffer} data - File data
   * @param {String} filename - Filename
   * @returns {Promise<Object>} File storage info
   */
  async storeFile(data, filename) {
    try {
      const filePath = path.join(config.storage.path, filename);
      
      // Write the file
      await fs.writeFile(filePath, data);
      
      // Generate URL path
      const urlPath = `/downloads/${filename}`;
      
      return {
        filename,
        path: filePath,
        url: urlPath
      };
    } catch (error) {
      console.error(`Failed to store file ${filename}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a file from storage
   * 
   * @param {String} filename - Filename to delete
   * @returns {Promise<Boolean>} True if deleted, false if not found
   */
  async deleteFile(filename) {
    try {
      const filePath = path.join(config.storage.path, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (error) {
        // File doesn't exist
        return false;
      }
      
      // Delete the file
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${filename}:`, error);
      throw error;
    }
  }
  
  /**
   * Calculate storage usage
   * 
   * @returns {Promise<Object>} Storage statistics
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(config.storage.path);
      let totalSize = 0;
      let fileCount = 0;
      
      // Process each file
      for (const file of files) {
        const filePath = path.join(config.storage.path, file);
        
        try {
          // Get file stats
          const stats = await fs.stat(filePath);
          
          // Skip directories
          if (!stats.isFile()) continue;
          
          // Add to totals
          totalSize += stats.size;
          fileCount++;
        } catch (fileError) {
          console.error(`Error getting stats for file ${filePath}:`, fileError);
          // Continue with other files even if one fails
        }
      }
      
      return {
        fileCount,
        totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }
}

module.exports = new Storage();