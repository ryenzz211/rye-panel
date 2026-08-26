import { 
  getBackups, 
  createBackup as createBackupService, 
  restoreBackup as restoreBackupService, 
  deleteBackup as deleteBackupService, 
  downloadBackup as downloadBackupService 
} from '../services/backupService.js';

// Get all backups
export const listBackups = async (req, res) => {
  try {
    const backups = await getBackups();
    return res.json({
      success: true,
      data: backups
    });
  } catch (error) {
    console.error('[BackupController] List error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar backup: ' + error.message
    });
  }
};

// Create backup
export const createBackup = async (req, res) => {
  try {
    const { name } = req.body;
    const result = await createBackupService(name || 'backup');
    return res.json({
      success: true,
      message: 'Backup berhasil dibuat',
      data: result
    });
  } catch (error) {
    console.error('[BackupController] Create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat backup: ' + error.message
    });
  }
};

// Restore backup
export const restoreBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const result = await restoreBackupService(backupId);
    return res.json({
      success: true,
      message: 'Backup berhasil direstore',
      data: result
    });
  } catch (error) {
    console.error('[BackupController] Restore error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal restore backup: ' + error.message
    });
  }
};

// Delete backup
export const deleteBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const result = await deleteBackupService(backupId);
    return res.json({
      success: true,
      message: 'Backup berhasil dihapus',
      data: result
    });
  } catch (error) {
    console.error('[BackupController] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus backup: ' + error.message
    });
  }
};

// Download backup
export const downloadBackup = async (req, res) => {
  try {
    const { backupId } = req.params;
    const filePath = await downloadBackupService(backupId);
    
    res.download(filePath, `${backupId}.zip`, (err) => {
      if (err) {
        console.error('[BackupController] Download error:', err);
      }
    });
  } catch (error) {
    console.error('[BackupController] Download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal download backup: ' + error.message
    });
  }
};

export default {
  listBackups,
  createBackup,
  restoreBackup,
  deleteBackup,
  downloadBackup
};
