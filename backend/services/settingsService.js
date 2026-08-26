import { getSetting, setSetting } from '../database/index.js';

// Get all settings
export const getAllSettings = async () => {
  const settings = {
    panel_name: await getSetting('panel_name') || 'Rye Panel',
    theme: await getSetting('theme') || 'dark',
    port: await getSetting('port') || '3000',
    host: await getSetting('host') || '0.0.0.0',
    auto_refresh: await getSetting('auto_refresh') || 'true',
    refresh_interval: await getSetting('refresh_interval') || '5',
    log_retention: await getSetting('log_retention') || '7',
    max_bots: await getSetting('max_bots') || '50',
    maintenance_mode: await getSetting('maintenance_mode') || 'false',
    language: await getSetting('language') || 'id'
  };
  return settings;
};

// Update settings
export const updateSettings = async (data) => {
  const updates = [];
  const validKeys = [
    'panel_name', 'theme', 'port', 'host', 
    'auto_refresh', 'refresh_interval', 'log_retention',
    'max_bots', 'maintenance_mode', 'language'
  ];
  
  for (const [key, value] of Object.entries(data)) {
    if (validKeys.includes(key)) {
      await setSetting(key, String(value));
      updates.push(key);
    }
  }
  
  // Jika theme diupdate, simpan ke session untuk immediate effect
  if (data.theme) {
    // Theme akan diapply di frontend via JavaScript
  }
  
  return {
    updated: updates,
    settings: await getAllSettings()
  };
};

// Get single setting
export const getSettingValue = async (key) => {
  return await getSetting(key);
};

// Apply theme (frontend akan handle)
export const applyTheme = (theme) => {
  // Frontend akan handle via JavaScript
  return { theme };
};

export default {
  getAllSettings,
  updateSettings,
  getSettingValue,
  applyTheme
};
