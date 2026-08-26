import { getSystemInfo as getSystemInfoService } from '../services/systemService.js';

// Get system info
export const getSystemInfo = async (req, res) => {
  try {
    const info = await getSystemInfoService();
    return res.json({
      success: true,
      data: info
    });
  } catch (error) {
    console.error('[SystemController] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi sistem: ' + error.message
    });
  }
};

export default {
  getSystemInfo
};
