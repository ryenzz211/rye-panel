import { 
  getPlugins, 
  installPlugin as installPluginService, 
  uninstallPlugin as uninstallPluginService, 
  togglePlugin as togglePluginService,
  loadAllPlugins,
  getPluginManifest
} from '../services/pluginService.js';

// Get all plugins
export const listPlugins = async (req, res) => {
  try {
    const plugins = await getPlugins();
    return res.json({
      success: true,
      data: plugins
    });
  } catch (error) {
    console.error('[PluginController] List error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar plugin: ' + error.message
    });
  }
};

// Install plugin
export const installPlugin = async (req, res) => {
  try {
    const { pluginId, source } = req.body;
    
    if (!pluginId) {
      return res.status(400).json({
        success: false,
        message: 'pluginId wajib diisi'
      });
    }
    
    const result = await installPluginService(pluginId, source);
    return res.json({
      success: true,
      message: `Plugin ${pluginId} berhasil diinstall`,
      data: result
    });
  } catch (error) {
    console.error('[PluginController] Install error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal install plugin: ' + error.message
    });
  }
};

// Uninstall plugin
export const uninstallPlugin = async (req, res) => {
  try {
    const { pluginId } = req.params;
    const result = await uninstallPluginService(pluginId);
    return res.json({
      success: true,
      message: `Plugin ${pluginId} berhasil diuninstall`,
      data: result
    });
  } catch (error) {
    console.error('[PluginController] Uninstall error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal uninstall plugin: ' + error.message
    });
  }
};

// Toggle plugin
export const togglePlugin = async (req, res) => {
  try {
    const { pluginId } = req.params;
    const { enabled } = req.body;
    
    const result = await togglePluginService(pluginId, enabled);
    return res.json({
      success: true,
      message: `Plugin ${pluginId} ${enabled ? 'diaktifkan' : 'dinonaktifkan'}`,
      data: result
    });
  } catch (error) {
    console.error('[PluginController] Toggle error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal toggle plugin: ' + error.message
    });
  }
};

// Load all plugins
export const loadPlugins = async (req, res) => {
  try {
    const results = await loadAllPlugins();
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('[PluginController] Load error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal load plugins: ' + error.message
    });
  }
};

// Get plugin manifest
export const getManifest = async (req, res) => {
  try {
    const { pluginId } = req.params;
    const manifest = await getPluginManifest(pluginId);
    return res.json({
      success: true,
      data: manifest
    });
  } catch (error) {
    console.error('[PluginController] Manifest error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil manifest: ' + error.message
    });
  }
};

export default {
  listPlugins,
  installPlugin,
  uninstallPlugin,
  togglePlugin,
  loadPlugins,
  getManifest
};
