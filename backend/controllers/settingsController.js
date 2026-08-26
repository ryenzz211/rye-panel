import { getAllSettings, updateSettings as updateSettingsService, getSettingValue } from '../services/settingsService.js';

// Get all settings
export const getSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();
    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('[SettingsController] Get error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan: ' + error.message
    });
  }
};

// Update settings
export const updateSettings = async (req, res) => {
  try {
    const data = req.body;
    const result = await updateSettingsService(data);
    return res.json({
      success: true,
      message: 'Pengaturan berhasil diupdate',
      data: result
    });
  } catch (error) {
    console.error('[SettingsController] Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal update pengaturan: ' + error.message
    });
  }
};

// Get single setting
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const value = await getSettingValue(key);
    return res.json({
      success: true,
      data: { key, value }
    });
  } catch (error) {
    console.error('[SettingsController] Get single error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil pengaturan: ' + error.message
    });
  }
};

export default {
  getSettings,
  updateSettings,
  getSetting
};
