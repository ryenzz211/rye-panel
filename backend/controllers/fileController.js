import { listFiles, readFile, writeFile, createFolder, deleteItem, renameItem, uploadFile } from '../services/fileService.js';

// List files
export const list = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: subPath = '' } = req.query;
    
    const result = await listFiles(botId, subPath);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[FileController] List error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar file: ' + error.message
    });
  }
};

// Read file
export const read = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Path file wajib diisi'
      });
    }
    
    const result = await readFile(botId, filePath);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[FileController] Read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membaca file: ' + error.message
    });
  }
};

// Write file
export const write = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Path file wajib diisi'
      });
    }
    
    const result = await writeFile(botId, filePath, content);
    return res.json({
      success: true,
      message: 'File berhasil disimpan',
      data: result
    });
  } catch (error) {
    console.error('[FileController] Write error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menyimpan file: ' + error.message
    });
  }
};

// Create folder
export const mkdir = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: folderPath } = req.body;
    
    if (!folderPath) {
      return res.status(400).json({
        success: false,
        message: 'Path folder wajib diisi'
      });
    }
    
    const result = await createFolder(botId, folderPath);
    return res.json({
      success: true,
      message: 'Folder berhasil dibuat',
      data: result
    });
  } catch (error) {
    console.error('[FileController] Mkdir error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat folder: ' + error.message
    });
  }
};

// Delete file/folder
export const del = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: itemPath } = req.body;
    
    if (!itemPath) {
      return res.status(400).json({
        success: false,
        message: 'Path item wajib diisi'
      });
    }
    
    const result = await deleteItem(botId, itemPath);
    return res.json({
      success: true,
      message: 'Item berhasil dihapus',
      data: result
    });
  } catch (error) {
    console.error('[FileController] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus item: ' + error.message
    });
  }
};

// Rename file/folder
export const rename = async (req, res) => {
  try {
    const { botId } = req.params;
    const { oldPath, newName } = req.body;
    
    if (!oldPath || !newName) {
      return res.status(400).json({
        success: false,
        message: 'oldPath dan newName wajib diisi'
      });
    }
    
    const result = await renameItem(botId, oldPath, newName);
    return res.json({
      success: true,
      message: 'Item berhasil direname',
      data: result
    });
  } catch (error) {
    console.error('[FileController] Rename error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal rename item: ' + error.message
    });
  }
};

// Upload file
export const upload = async (req, res) => {
  try {
    const { botId } = req.params;
    const { path: filePath } = req.body;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File tidak ditemukan'
      });
    }
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'Path file wajib diisi'
      });
    }
    
    const result = await uploadFile(botId, filePath, file.buffer);
    return res.json({
      success: true,
      message: 'File berhasil diupload',
      data: result
    });
  } catch (error) {
    console.error('[FileController] Upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal upload file: ' + error.message
    });
  }
};

export default {
  list,
  read,
  write,
  mkdir,
  del,
  rename,
  upload
};
