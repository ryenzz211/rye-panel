import { getLogs, clearOldLogs, deleteAllLogs as deleteAllLogsService, deleteLogById } from '../services/auditService.js';

// Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    console.log('[AuditController] Getting logs, limit:', limit);
    
    const logs = await getLogs(limit);
    console.log('[AuditController] Found', logs.length, 'logs');
    
    return res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('[AuditController] Get error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil audit logs: ' + error.message
    });
  }
};

// Clear old audit logs (by days)
export const clearAuditLogs = async (req, res) => {
  try {
    const { days } = req.body;
    const retention = days || 30;
    await clearOldLogs(retention);
    return res.json({
      success: true,
      message: `Audit logs older than ${retention} days cleared`
    });
  } catch (error) {
    console.error('[AuditController] Clear error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membersihkan audit logs: ' + error.message
    });
  }
};

// Delete all audit logs
export const deleteAllLogs = async (req, res) => {
  try {
    await deleteAllLogsService();
    return res.json({
      success: true,
      message: 'Semua audit logs berhasil dihapus'
    });
  } catch (error) {
    console.error('[AuditController] Delete all error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus audit logs: ' + error.message
    });
  }
};

// Delete single audit log by ID
export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteLogById(id);
    return res.json({
      success: true,
      message: 'Audit log berhasil dihapus'
    });
  } catch (error) {
    console.error('[AuditController] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus audit log: ' + error.message
    });
  }
};

export default {
  getAuditLogs,
  clearAuditLogs,
  deleteAllLogs,
  deleteLog
};
