import { getEnv, setEnv, setEnvVar, deleteEnvVar, importEnv, exportEnv } from '../services/envService.js';

export const getEnvVars = async (req, res) => {
  try {
    const { botId } = req.params;
    console.log('[EnvController] Getting env for bot:', botId);
    
    const result = await getEnv(botId);
    console.log('[EnvController] Result:', Object.keys(result.variables || {}));
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[EnvController] Get error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil environment variables: ' + error.message
    });
  }
};

export const setEnvVars = async (req, res) => {
  try {
    const { botId } = req.params;
    const { variables } = req.body;
    
    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Variables must be an object'
      });
    }
    
    const result = await setEnv(botId, variables);
    return res.json({
      success: true,
      message: 'Environment variables updated',
      data: result
    });
  } catch (error) {
    console.error('[EnvController] Set error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal update environment variables: ' + error.message
    });
  }
};

export const setVar = async (req, res) => {
  try {
    const { botId } = req.params;
    const { key, value } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }
    
    const result = await setEnvVar(botId, key, value);
    return res.json({
      success: true,
      message: `Variable "${key}" updated`,
      data: result
    });
  } catch (error) {
    console.error('[EnvController] SetVar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal update variable: ' + error.message
    });
  }
};

export const delVar = async (req, res) => {
  try {
    const { botId } = req.params;
    const { key } = req.body;
    
    if (!key) {
      return res.status(400).json({
        success: false,
        message: 'Key is required'
      });
    }
    
    const result = await deleteEnvVar(botId, key);
    return res.json({
      success: true,
      message: `Variable "${key}" deleted`,
      data: result
    });
  } catch (error) {
    console.error('[EnvController] DelVar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal hapus variable: ' + error.message
    });
  }
};

export const importVars = async (req, res) => {
  try {
    const { botId } = req.params;
    const { envText } = req.body;
    
    if (!envText) {
      return res.status(400).json({
        success: false,
        message: 'envText is required'
      });
    }
    
    const result = await importEnv(botId, envText);
    return res.json({
      success: true,
      message: 'Environment variables imported',
      data: result
    });
  } catch (error) {
    console.error('[EnvController] Import error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal import environment variables: ' + error.message
    });
  }
};

export const exportVars = async (req, res) => {
  try {
    const { botId } = req.params;
    const result = await exportEnv(botId);
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[EnvController] Export error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal export environment variables: ' + error.message
    });
  }
};

export default {
  getEnvVars,
  setEnvVars,
  setVar,
  delVar,
  importVars,
  exportVars
};
