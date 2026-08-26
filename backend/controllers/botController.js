import { 
  getAllBots, 
  getBuiltinBot,
  getBotById, 
  createNewBot, 
  updateBotById, 
  deleteBotById,
  startBot as startBotService,
  stopBot as stopBotService,
  restartBot as restartBotService
} from '../services/botService.js';

export const listBots = async (req, res) => {
  try {
    const bots = await getAllBots();
    return res.json({ success: true, data: bots });
  } catch (error) {
    console.error('[BotController] List error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar bot' });
  }
};

// Get built-in bot
export const getBuiltin = async (req, res) => {
  try {
    const bot = await getBuiltinBot();
    return res.json({ success: true, data: bot });
  } catch (error) {
    console.error('[BotController] Get builtin error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil built-in bot' });
  }
};

export const getBot = async (req, res) => {
  try {
    const { id } = req.params;
    const bot = await getBotById(id);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot tidak ditemukan' });
    }
    return res.json({ success: true, data: bot });
  } catch (error) {
    console.error('[BotController] Get error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data bot' });
  }
};

export const createBot = async (req, res) => {
  try {
    const { name, display_name, type, entry_file, prefix, phone_number } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama bot wajib diisi' });
    }
    const bot = await createNewBot({
      name,
      display_name: display_name || name,
      type: type || 'imported',
      entry_file: entry_file || 'index.js',
      prefix: prefix || '.',
      phone_number: phone_number || null
    });
    return res.status(201).json({ success: true, message: 'Bot berhasil dibuat', data: bot });
  } catch (error) {
    console.error('[BotController] Create error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat bot' });
  }
};

export const updateBot = async (req, res) => {
  try {
    const { id } = req.params;
    const bot = await updateBotById(id, req.body);
    if (!bot) {
      return res.status(404).json({ success: false, message: 'Bot tidak ditemukan' });
    }
    return res.json({ success: true, message: 'Bot berhasil diupdate', data: bot });
  } catch (error) {
    console.error('[BotController] Update error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengupdate bot' });
  }
};

export const deleteBot = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteBotById(id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Bot tidak ditemukan' });
    }
    return res.json({ success: true, message: 'Bot berhasil dihapus' });
  } catch (error) {
    console.error('[BotController] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus bot: ' + error.message
    });
  }
};

export const startBot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await startBotService(id);
    return res.json({ success: true, message: 'Bot sedang di-start', data: result });
  } catch (error) {
    console.error('[BotController] Start error:', error);
    return res.status(500).json({ success: false, message: 'Gagal men-start bot: ' + error.message });
  }
};

export const stopBot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await stopBotService(id);
    return res.json({ success: true, message: 'Bot sedang di-stop', data: result });
  } catch (error) {
    console.error('[BotController] Stop error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menghentikan bot' });
  }
};

export const restartBot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await restartBotService(id);
    return res.json({ success: true, message: 'Bot sedang di-restart', data: result });
  } catch (error) {
    console.error('[BotController] Restart error:', error);
    return res.status(500).json({ success: false, message: 'Gagal merestart bot' });
  }
};

export default {
  listBots,
  getBuiltin,
  getBot,
  createBot,
  updateBot,
  deleteBot,
  startBot,
  stopBot,
  restartBot
};
