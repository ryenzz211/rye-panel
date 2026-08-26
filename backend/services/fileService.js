import fs from 'fs-extra';
import path from 'path';
import { getBot } from '../database/index.js';

export const listFiles = async (botId, subPath = '') => {
  try {
    const bot = await getBot(botId);
    if (!bot) {
      return { items: [], path: subPath || '/', fullPath: '', workspace: '' };
    }
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, subPath || '');
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      return { items: [], path: subPath || '/', fullPath, workspace };
    }
    
    if (!fs.existsSync(fullPath)) {
      return { items: [], path: subPath || '/', fullPath, workspace };
    }
    
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      return {
        items: [{
          name: path.basename(fullPath),
          path: subPath,
          type: 'file',
          size: stat.size,
          modified: stat.mtime
        }],
        path: subPath || '/',
        fullPath,
        workspace
      };
    }
    
    const files = fs.readdirSync(fullPath);
    const items = [];
    
    for (const file of files) {
      const filePath = path.join(fullPath, file);
      const fileStat = fs.statSync(filePath);
      const relativePath = path.join(subPath, file);
      
      items.push({
        name: file,
        path: relativePath,
        type: fileStat.isDirectory() ? 'folder' : 'file',
        size: fileStat.isDirectory() ? 0 : fileStat.size,
        modified: fileStat.mtime,
        extension: fileStat.isDirectory() ? '' : path.extname(file).substring(1)
      });
    }
    
    items.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
    
    return {
      items,
      path: subPath || '/',
      fullPath,
      workspace
    };
  } catch (error) {
    console.warn('[FileService] List error:', error.message);
    return { items: [], path: subPath || '/', fullPath: '', workspace: '' };
  }
};

export const readFile = async (botId, filePath) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, filePath);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found');
    }
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      throw new Error('Cannot read directory as file');
    }
    
    if (stat.size > 1024 * 1024) {
      throw new Error('File too large (max 1MB)');
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    return {
      content,
      path: filePath,
      size: stat.size,
      modified: stat.mtime
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const writeFile = async (botId, filePath, content) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, filePath);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    const dir = path.dirname(fullPath);
    fs.ensureDirSync(dir);
    fs.writeFileSync(fullPath, content, 'utf8');
    
    return {
      path: filePath,
      size: Buffer.byteLength(content, 'utf8')
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createFolder = async (botId, folderPath) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, folderPath);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    fs.ensureDirSync(fullPath);
    return { path: folderPath, created: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteItem = async (botId, itemPath) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, itemPath);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    if (!fs.existsSync(fullPath)) {
      throw new Error('File or folder not found');
    }
    
    if (fullPath === workspaceResolved) {
      throw new Error('Cannot delete workspace root');
    }
    
    fs.removeSync(fullPath);
    return { path: itemPath, deleted: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const renameItem = async (botId, oldPath, newName) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullOldPath = path.resolve(workspace, oldPath);
    const fullNewPath = path.resolve(workspace, path.dirname(oldPath), newName);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullOldPath.startsWith(workspaceResolved) || !fullNewPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    if (!fs.existsSync(fullOldPath)) {
      throw new Error('File or folder not found');
    }
    
    if (fs.existsSync(fullNewPath)) {
      throw new Error('Target already exists');
    }
    
    fs.renameSync(fullOldPath, fullNewPath);
    return { oldPath, newPath: path.join(path.dirname(oldPath), newName), renamed: true };
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadFile = async (botId, filePath, fileBuffer) => {
  try {
    const bot = await getBot(botId);
    if (!bot) throw new Error('Bot not found');
    
    let workspace = bot.workspace_path || `./data/bots/${botId}`;
    if (workspace.startsWith('./')) {
      workspace = path.resolve(process.cwd(), workspace);
    }
    
    const fullPath = path.resolve(workspace, filePath);
    const workspaceResolved = path.resolve(workspace);
    
    if (!fullPath.startsWith(workspaceResolved)) {
      throw new Error('Access denied');
    }
    
    const dir = path.dirname(fullPath);
    fs.ensureDirSync(dir);
    fs.writeFileSync(fullPath, fileBuffer);
    
    return { path: filePath, size: fileBuffer.length };
  } catch (error) {
    throw new Error(error.message);
  }
};

export default {
  listFiles,
  readFile,
  writeFile,
  createFolder,
  deleteItem,
  renameItem,
  uploadFile
};
