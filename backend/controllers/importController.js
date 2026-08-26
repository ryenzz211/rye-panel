import { uploadZip, extractAndScan, confirmImport, getFileStructure } from '../services/importService.js';

// Upload ZIP
export const upload = async (req, res) => {
  try {
    console.log('[Import] Upload request received');
    
    if (!req.file) {
      console.log('[Import] No file received');
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file ZIP yang diupload'
      });
    }
    
    console.log('[Import] File:', req.file.originalname, req.file.size);
    
    const result = await uploadZip(req.file);
    
    console.log('[Import] Upload success:', result.tempId);
    
    return res.json({
      success: true,
      message: 'ZIP berhasil diupload',
      data: result
    });
  } catch (error) {
    console.error('[Import] Upload error:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Gagal upload ZIP: ' + error.message
    });
  }
};

// Scan uploaded ZIP
export const scan = async (req, res) => {
  try {
    const { tempId } = req.body;
    
    console.log('[Import] Scan request for:', tempId);
    
    if (!tempId) {
      return res.status(400).json({
        success: false,
        message: 'tempId wajib diisi'
      });
    }
    
    const result = await extractAndScan(tempId);
    
    console.log('[Import] Scan success, files:', result.fileCount);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Import] Scan error:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Gagal scan ZIP: ' + error.message
    });
  }
};

// Confirm import
export const confirm = async (req, res) => {
  try {
    const { tempId, config } = req.body;
    
    console.log('[Import] Confirm request for:', tempId);
    
    if (!tempId) {
      return res.status(400).json({
        success: false,
        message: 'tempId wajib diisi'
      });
    }
    
    const bot = await confirmImport(tempId, config || {});
    
    console.log('[Import] Confirm success, bot:', bot.id);
    
    return res.json({
      success: true,
      message: 'Bot berhasil diimport',
      data: bot
    });
  } catch (error) {
    console.error('[Import] Confirm error:', error.message);
    console.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Gagal import bot: ' + error.message
    });
  }
};

// Get file structure
export const getStructure = async (req, res) => {
  try {
    const { tempId } = req.params;
    
    if (!tempId) {
      return res.status(400).json({
        success: false,
        message: 'tempId wajib diisi'
      });
    }
    
    const structure = await getFileStructure(tempId);
    
    return res.json({
      success: true,
      data: structure
    });
  } catch (error) {
    console.error('[Import] Structure error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil struktur file: ' + error.message
    });
  }
};

export default {
  upload,
  scan,
  confirm,
  getStructure
};
