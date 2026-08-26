import { getSessionInfo, deleteSession as deleteSessionService, sessionExists, updateSessionStatus } from '../services/sessionService.js';

// Get session info
export const getSession = async (req, res) => {
  try {
    const { botId } = req.params;
    const info = await getSessionInfo(botId);
    return res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('[SessionController] Get error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil info session: ' + error.message
    });
  }
};

// Delete session
export const deleteSession = async (req, res) => {
  try {
    const { botId } = req.params;
    console.log('[SessionController] Deleting session for bot:', botId);
    
    const result = await deleteSessionService(botId);
    
    return res.json({
      success: true,
      message: 'Session berhasil dihapus',
      data: result
    });
  } catch (error) {
    console.error('[SessionController] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus session: ' + error.message
    });
  }
};

// Check if session exists
export const checkSession = async (req, res) => {
  try {
    const { botId } = req.params;
    const exists = await sessionExists(botId);
    return res.json({
      success: true,
      data: { exists }
    });
  } catch (error) {
    console.error('[SessionController] Check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal cek session: ' + error.message
    });
  }
};

// Update session status (for internal use)
export const updateSession = async (req, res) => {
  try {
    const { botId } = req.params;
    const data = req.body;
    const result = await updateSessionStatus(botId, data);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[SessionController] Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal update session: ' + error.message
    });
  }
};

export default {
  getSession,
  deleteSession,
  checkSession,
  updateSession
};
