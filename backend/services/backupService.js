import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';
import { getBots, getDb, saveDb } from '../database/index.js';

const BACKUP_DIR = './data/backups';

// Ensure backup directory exists
fs.ensureDirSync(BACKUP_DIR);

// Get all backups
export const getBackups = async () => {
  const files = fs.readdirSync(BACKUP_DIR);
  const backups = [];
  
  for (const file of files) {
    if (file.endsWith('.zip')) {
      const filePath = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(filePath);
      const name = file.replace('.zip', '');
      const parts = name.split('_');
      
      backups.push({
        id: name,
        name: parts[0] || 'Backup',
        date: parts[1] || stat.mtime.toISOString(),
        size: stat.size,
        created: stat.mtime,
        path: filePath
      });
    }
  }
  
  // Sort by date descending (newest first)
  backups.sort((a, b) => b.created - a.created);
  
  return backups;
};

// Create backup
export const createBackup = async (name = 'backup') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `${name}_${timestamp}`;
  const zipPath = path.join(BACKUP_DIR, `${backupId}.zip`);
  
  const zip = new AdmZip();
  
  // 1. Backup database (JSON)
  const db = await getDb();
  const dbData = JSON.stringify(db, null, 2);
  zip.addFile('database.json', Buffer.from(dbData, 'utf8'));
  
  // 2. Backup bot workspaces (only config + session)
  const bots = await getBots();
  const botWorkspaces = {};
  
  for (const bot of bots) {
    const workspace = bot.workspace_path || `./data/bots/${bot.id}`;
    const fullWorkspace = path.resolve(process.cwd(), workspace);
    
    if (fs.existsSync(fullWorkspace)) {
      // Copy only config and session
      const botData = {};
      
      // Config
      const configPath = path.join(fullWorkspace, 'config.json');
      if (fs.existsSync(configPath)) {
        botData.config = fs.readFileSync(configPath, 'utf8');
      }
      
      // Session
      const sessionPath = path.join(fullWorkspace, 'session');
      if (fs.existsSync(sessionPath)) {
        const sessionFiles = fs.readdirSync(sessionPath);
        botData.session = {};
        for (const file of sessionFiles) {
          const filePath = path.join(sessionPath, file);
          if (fs.statSync(filePath).isFile()) {
            botData.session[file] = fs.readFileSync(filePath).toString('base64');
          }
        }
      }
      
      botWorkspaces[bot.id] = botData;
    }
  }
  
  zip.addFile('workspaces.json', Buffer.from(JSON.stringify(botWorkspaces, null, 2), 'utf8'));
  
  // 3. Add bot list
  zip.addFile('bots.json', Buffer.from(JSON.stringify(bots, null, 2), 'utf8'));
  
  // Write zip
  zip.writeZip(zipPath);
  
  const stat = fs.statSync(zipPath);
  
  return {
    id: backupId,
    name: name,
    path: zipPath,
    size: stat.size,
    created: stat.mtime,
    botCount: bots.length
  };
};

// Restore backup
export const restoreBackup = async (backupId) => {
  const zipPath = path.join(BACKUP_DIR, `${backupId}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    throw new Error('Backup file not found');
  }
  
  const zip = new AdmZip(zipPath);
  
  // 1. Restore database
  const dbEntry = zip.getEntry('database.json');
  if (dbEntry) {
    const dbData = JSON.parse(dbEntry.getData().toString('utf8'));
    // Update store (in-memory)
    const store = await getDb();
    Object.assign(store, dbData);
    await saveDb();
  }
  
  // 2. Restore bot workspaces
  const workspacesEntry = zip.getEntry('workspaces.json');
  if (workspacesEntry) {
    const workspaces = JSON.parse(workspacesEntry.getData().toString('utf8'));
    
    for (const [botId, data] of Object.entries(workspaces)) {
      const workspace = `./data/bots/${botId}`;
      const fullWorkspace = path.resolve(process.cwd(), workspace);
      
      // Create workspace directory
      fs.ensureDirSync(fullWorkspace);
      
      // Restore config
      if (data.config) {
        const configPath = path.join(fullWorkspace, 'config.json');
        fs.writeFileSync(configPath, data.config);
      }
      
      // Restore session
      if (data.session) {
        const sessionPath = path.join(fullWorkspace, 'session');
        fs.ensureDirSync(sessionPath);
        for (const [file, content] of Object.entries(data.session)) {
          const filePath = path.join(sessionPath, file);
          fs.writeFileSync(filePath, Buffer.from(content, 'base64'));
        }
      }
    }
  }
  
  return {
    id: backupId,
    restored: true,
    message: 'Backup restored successfully'
  };
};

// Delete backup
export const deleteBackup = async (backupId) => {
  const zipPath = path.join(BACKUP_DIR, `${backupId}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    throw new Error('Backup file not found');
  }
  
  fs.removeSync(zipPath);
  
  return {
    id: backupId,
    deleted: true
  };
};

// Download backup
export const downloadBackup = async (backupId) => {
  const zipPath = path.join(BACKUP_DIR, `${backupId}.zip`);
  
  if (!fs.existsSync(zipPath)) {
    throw new Error('Backup file not found');
  }
  
  return zipPath;
};

export default {
  getBackups,
  createBackup,
  restoreBackup,
  deleteBackup,
  downloadBackup
};
