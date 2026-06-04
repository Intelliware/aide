/**
 * Environment variable loader that searches for .env file
 * ONLY loads from workspace root (where .git exists)
 */

const fs = require('fs');
const path = require('path');

/**
 * Find workspace root directory with .env file
 * In multi-repo workspaces, searches up past nested .git folders
 * to find the true workspace root containing .env
 */
function getWorkspaceRoot(startDir = process.cwd()) {
  let currentDir = startDir;
  const root = path.parse(currentDir).root;
  let foundEnvDir = null;

  if (process.env.DEBUG) {
    console.log(`[env-loader] Starting search from: ${currentDir}`);
  }
  
  // Search up the directory tree looking for .env file
  while (currentDir !== root) {
    const envPath = path.join(currentDir, '.env');
    
    if (process.env.DEBUG) {
      console.log(`[env-loader] Checking for .env at: ${currentDir}`);
    }
    
    // If we find .env, this is our workspace root
    if (fs.existsSync(envPath)) {
      foundEnvDir = currentDir;
      if (process.env.DEBUG) {
        console.log(`[env-loader] Found .env at: ${currentDir} - Using as workspace root`);
      }
      return currentDir;
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  // If no .env found, fallback to finding .git directory
  if (!foundEnvDir) {
    currentDir = startDir;
    while (currentDir !== root) {
      const gitPath = path.join(currentDir, '.git');
      if (fs.existsSync(gitPath)) {
        if (process.env.DEBUG) {
          console.log(`[env-loader] No .env found, using .git location: ${currentDir}`);
        }
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }
  }

  if (process.env.DEBUG) {
    console.log(`[env-loader] No .env or .git found, using cwd: ${process.cwd()}`);
  }
  
  // Fallback to process.cwd() if nothing found
  return process.cwd();
}

/**
 * Find .env file in workspace root only
 * Does not search subdirectories or parent directories
 */
function findEnvFile(startDir = process.cwd()) {
  const workspaceRoot = getWorkspaceRoot(startDir);
  const envPath = path.join(workspaceRoot, '.env');
  
  if (fs.existsSync(envPath)) {
    return envPath;
  }
  
  return null;
}

/**
 * Load environment variables from workspace root .env file only
 * Does not use any other .env files
 */
function loadEnv() {
  const envPath = findEnvFile();
  
  if (!envPath) {
    // Silent - will error when token is actually needed
    return false;
  }

  require('dotenv').config({ path: envPath });
  return true;
}

module.exports = {
  findEnvFile,
  loadEnv,
  getWorkspaceRoot
};
