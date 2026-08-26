import AdmZip from 'adm-zip';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createNewBot } from './botService.js';

const UPLOAD_DIR = './data/uploads';
const BOTS_DIR = './data/bots';
const MAX_ZIP_SIZE = 200 * 1024 * 1024;

fs.ensureDirSync(UPLOAD_DIR);
fs.ensureDirSync(BOTS_DIR);

export const uploadZip = async (file) => {
  console.log('[ImportService] Uploading:', file.originalname, file.size);
  
  if (file.size > MAX_ZIP_SIZE) {
    throw new Error(`File terlalu besar. Maksimal ${MAX_ZIP_SIZE / 1024 / 1024}MB`);
  }
  
  const tempId = uuidv4();
  const tempDir = path.join(UPLOAD_DIR, tempId);
  fs.ensureDirSync(tempDir);
  
  const zipPath = path.join(tempDir, 'bot.zip');
  fs.writeFileSync(zipPath, file.buffer);
  
  console.log('[ImportService] Uploaded to:', zipPath);
  
  return {
    tempId,
    tempDir,
    zipPath,
    size: file.size,
    originalName: file.originalname
  };
};

export const extractAndScan = async (tempId) => {
  console.log('[ImportService] Extracting:', tempId);
  
  const tempDir = path.join(UPLOAD_DIR, tempId);
  const zipPath = path.join(tempDir, 'bot.zip');
  
  if (!fs.existsSync(zipPath)) {
    console.log('[ImportService] ZIP not found:', zipPath);
    throw new Error('ZIP file not found');
  }
  
  const stats = fs.statSync(zipPath);
  console.log('[ImportService] ZIP size:', stats.size);
  
  if (stats.size === 0) {
    throw new Error('ZIP file is empty');
  }
  
  try {
    const zip = new AdmZip(zipPath);
    const extractDir = path.join(tempDir, 'extracted');
    zip.extractAllTo(extractDir, true);
    console.log('[ImportService] Extracted to:', extractDir);
    
    // Cek hasil ekstrak
    const files = fs.readdirSync(extractDir);
    console.log('[ImportService] Extracted files:', files);
    
    if (files.length === 0) {
      throw new Error('ZIP extracted but no files found');
    }
    
    const structure = scanDirectory(extractDir);
    console.log('[ImportService] Structure scanned, items:', structure.length);
    
    let packageJson = null;
    let packageJsonPath = path.join(extractDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      console.log('[ImportService] package.json found:', packageJson.name);
    }
    
    const entryFiles = [
      'index.js', 'main.js', 'app.js', 'bot.js', 'server.js',
      'src/index.js', 'src/main.js', 'src/app.js'
    ];
    
    const detectedEntry = [];
    for (const file of entryFiles) {
      const fullPath = path.join(extractDir, file);
      if (fs.existsSync(fullPath)) {
        detectedEntry.push(file);
      }
    }
    console.log('[ImportService] Detected entry:', detectedEntry);
    
    const folders = {
      commands: fs.existsSync(path.join(extractDir, 'commands')),
      events: fs.existsSync(path.join(extractDir, 'events')),
      session: fs.existsSync(path.join(extractDir, 'session')),
      lib: fs.existsSync(path.join(extractDir, 'lib')),
      config: fs.existsSync(path.join(extractDir, 'config'))
    };
    
    return {
      tempId,
      extractDir,
      structure,
      packageJson,
      detectedEntry,
      folders,
      fileCount: structure.length,
      size: stats.size
    };
  } catch (error) {
    console.error('[ImportService] Extract error:', error.message);
    throw new Error('Gagal extract ZIP: ' + error.message);
  }
};

const scanDirectory = (dir, prefix = '') => {
  const items = [];
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        items.push({
          name: file,
          path: path.join(prefix, file),
          type: 'folder',
          children: scanDirectory(fullPath, path.join(prefix, file))
        });
      } else {
        items.push({
          name: file,
          path: path.join(prefix, file),
          type: 'file',
          size: stat.size
        });
      }
    }
  } catch (e) {
    console.error('[ImportService] Scan error:', e.message);
  }
  
  return items;
};

export const confirmImport = async (tempId, config) => {
  console.log('[ImportService] Confirming:', tempId);
  
  const tempDir = path.join(UPLOAD_DIR, tempId);
  const extractDir = path.join(tempDir, 'extracted');
  
  if (!fs.existsSync(extractDir)) {
    throw new Error('Extracted directory not found');
  }
  
  const botData = {
    name: config.name || 'Imported Bot',
    display_name: config.display_name || config.name || 'Imported Bot',
    type: 'imported',
    entry_file: config.entry_file || 'index.js',
    session_path: config.session_path || './session',
    command_path: config.command_path || './commands',
    event_path: config.event_path || './events',
    config_file: config.config_file || 'config.js',
    prefix: config.prefix || '.',
    phone_number: config.phone_number || null,
    pair_mode: config.pair_mode !== undefined ? config.pair_mode : 1,
    workspace_path: path.join(BOTS_DIR, 'imported', tempId)
  };
  
  const bot = await createNewBot(botData);
  
  const workspaceDir = bot.workspace_path;
  fs.ensureDirSync(workspaceDir);
  fs.copySync(extractDir, workspaceDir);
  
  fs.removeSync(tempDir);
  
  console.log('[ImportService] Import complete:', bot.id);
  
  return bot;
};

export const getFileStructure = async (tempId) => {
  const tempDir = path.join(UPLOAD_DIR, tempId);
  const extractDir = path.join(tempDir, 'extracted');
  
  if (!fs.existsSync(extractDir)) {
    throw new Error('Extracted directory not found');
  }
  
  return scanDirectory(extractDir);
};

export default {
  uploadZip,
  extractAndScan,
  confirmImport,
  getFileStructure,
  UPLOAD_DIR,
  BOTS_DIR,
  MAX_ZIP_SIZE
};
