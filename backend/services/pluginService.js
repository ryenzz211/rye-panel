import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLUGIN_DIR = path.resolve(process.cwd(), 'plugins');
const PLUGIN_CONFIG_FILE = path.join(PLUGIN_DIR, 'plugins.json');

// Ensure plugin directory exists
fs.ensureDirSync(PLUGIN_DIR);

// Load plugin config
export const loadPluginConfig = async () => {
  try {
    if (fs.existsSync(PLUGIN_CONFIG_FILE)) {
      const data = fs.readFileSync(PLUGIN_CONFIG_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Plugin] Failed to load config:', e.message);
  }
  
  // Default config
  const defaultConfig = { plugins: [] };
  fs.writeFileSync(PLUGIN_CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
  return defaultConfig;
};

// Save plugin config
export const savePluginConfig = async (config) => {
  fs.writeFileSync(PLUGIN_CONFIG_FILE, JSON.stringify(config, null, 2));
  return config;
};

// Get all plugins
export const getPlugins = async () => {
  const config = await loadPluginConfig();
  const plugins = [];
  
  // Check installed plugins
  for (const pluginId of config.plugins || []) {
    const pluginPath = path.join(PLUGIN_DIR, pluginId);
    const manifestPath = path.join(pluginPath, 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const enabled = config.enabled?.[pluginId] !== false;
        plugins.push({
          id: pluginId,
          ...manifest,
          enabled,
          installed: true,
          path: pluginPath
        });
      } catch (e) {
        console.error(`[Plugin] Failed to load ${pluginId}:`, e.message);
      }
    }
  }
  
  return plugins;
};

// Install plugin
export const installPlugin = async (pluginId, source) => {
  const config = await loadPluginConfig();
  const pluginPath = path.join(PLUGIN_DIR, pluginId);
  
  if (fs.existsSync(pluginPath)) {
    throw new Error(`Plugin ${pluginId} already installed`);
  }
  
  // Create plugin directory
  fs.ensureDirSync(pluginPath);
  
  // If source is a URL or path, copy from there
  if (source && fs.existsSync(source)) {
    fs.copySync(source, pluginPath);
  } else {
    // Create default plugin structure
    fs.writeFileSync(path.join(pluginPath, 'manifest.json'), JSON.stringify({
      id: pluginId,
      name: pluginId,
      version: '1.0.0',
      author: 'Unknown',
      description: 'A Rye Panel plugin',
      main: 'index.js',
      permissions: []
    }, null, 2));
    
    fs.writeFileSync(path.join(pluginPath, 'index.js'), `
// ${pluginId} plugin
export default {
  id: '${pluginId}',
  name: '${pluginId}',
  version: '1.0.0',
  
  async onLoad() {
    console.log('[Plugin] ${pluginId} loaded');
  },
  
  async onUnload() {
    console.log('[Plugin] ${pluginId} unloaded');
  }
};
`);
  }
  
  // Add to config
  if (!config.plugins.includes(pluginId)) {
    config.plugins.push(pluginId);
  }
  if (!config.enabled) config.enabled = {};
  config.enabled[pluginId] = true;
  
  await savePluginConfig(config);
  
  return { id: pluginId, installed: true };
};

// Uninstall plugin
export const uninstallPlugin = async (pluginId) => {
  const config = await loadPluginConfig();
  const pluginPath = path.join(PLUGIN_DIR, pluginId);
  
  if (!fs.existsSync(pluginPath)) {
    throw new Error(`Plugin ${pluginId} not found`);
  }
  
  // Remove from config
  config.plugins = config.plugins.filter(p => p !== pluginId);
  delete config.enabled?.[pluginId];
  
  await savePluginConfig(config);
  
  // Remove directory
  fs.removeSync(pluginPath);
  
  return { id: pluginId, uninstalled: true };
};

// Enable/disable plugin
export const togglePlugin = async (pluginId, enabled) => {
  const config = await loadPluginConfig();
  
  if (!config.plugins.includes(pluginId)) {
    throw new Error(`Plugin ${pluginId} not found`);
  }
  
  if (!config.enabled) config.enabled = {};
  config.enabled[pluginId] = enabled;
  
  await savePluginConfig(config);
  
  return { id: pluginId, enabled };
};

// Load plugin (runtime)
export const loadPlugin = async (pluginId) => {
  const pluginPath = path.join(PLUGIN_DIR, pluginId);
  const mainPath = path.join(pluginPath, 'index.js');
  
  if (!fs.existsSync(mainPath)) {
    throw new Error(`Plugin ${pluginId} main file not found`);
  }
  
  try {
    const plugin = await import(`file://${mainPath}`);
    if (plugin.default && typeof plugin.default.onLoad === 'function') {
      await plugin.default.onLoad();
    }
    return plugin.default || plugin;
  } catch (e) {
    console.error(`[Plugin] Failed to load ${pluginId}:`, e.message);
    throw e;
  }
};

// Load all enabled plugins
export const loadAllPlugins = async () => {
  const config = await loadPluginConfig();
  const results = [];
  
  for (const pluginId of config.plugins || []) {
    if (config.enabled?.[pluginId] !== false) {
      try {
        const plugin = await loadPlugin(pluginId);
        results.push({ id: pluginId, loaded: true, plugin });
      } catch (e) {
        results.push({ id: pluginId, loaded: false, error: e.message });
      }
    }
  }
  
  return results;
};

// Get plugin manifest
export const getPluginManifest = async (pluginId) => {
  const manifestPath = path.join(PLUGIN_DIR, pluginId, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Plugin ${pluginId} manifest not found`);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
};

export default {
  getPlugins,
  installPlugin,
  uninstallPlugin,
  togglePlugin,
  loadPlugin,
  loadAllPlugins,
  getPluginManifest
};
