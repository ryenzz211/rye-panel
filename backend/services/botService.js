import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { getBots, getBot, createBot, updateBot, deleteBot } from '../database/index.js';
import { BOT_STATUS, BOT_TYPE } from '../constants/botStatus.js';
import { startBotProcess, stopBotProcess, restartBotProcess, getProcessStatus } from './processService.js';

const BUILTIN_BOT_ID = 'rye-bot-builtin';

// Get all bots (excluding built-in)
export const getAllBots = async () => {
  const bots = await getBots();
  const filtered = bots.filter(b => b.id !== BUILTIN_BOT_ID);
  
  for (const bot of filtered) {
    try {
      const status = await getProcessStatus(bot.id);
      bot.realStatus = status.running ? 'running' : bot.status;
      bot.pid = status.pid;
      bot.uptime = status.uptime;
    } catch (e) {
      bot.realStatus = bot.status;
    }
  }
  
  return filtered;
};

// Get built-in bot
export const getBuiltinBot = async () => {
  const bot = await getBot(BUILTIN_BOT_ID);
  if (!bot) return null;
  
  try {
    const status = await getProcessStatus(BUILTIN_BOT_ID);
    bot.realStatus = status.running ? 'running' : bot.status;
    bot.pid = status.pid;
    bot.uptime = status.uptime;
  } catch (e) {
    bot.realStatus = bot.status;
  }
  
  return bot;
};

// Get bot by id (including built-in)
export const getBotById = async (id) => {
  const bot = await getBot(id);
  if (bot) {
    try {
      const status = await getProcessStatus(id);
      bot.realStatus = status.running ? 'running' : bot.status;
      bot.pid = status.pid;
      bot.uptime = status.uptime;
    } catch (e) {
      bot.realStatus = bot.status;
    }
  }
  return bot;
};

// Create new bot
export const createNewBot = async (data) => {
  const botData = {
    id: uuidv4(),
    name: data.name,
    display_name: data.display_name || data.name,
    type: data.type || BOT_TYPE.IMPORTED,
    status: BOT_STATUS.STOPPED,
    entry_file: data.entry_file || 'index.js',
    session_path: data.session_path || './session',
    command_path: data.command_path || './commands',
    event_path: data.event_path || './events',
    config_file: data.config_file || 'config.js',
    environment: data.environment || '{}',
    auto_restart: data.auto_restart !== undefined ? data.auto_restart : 1,
    restart_delay: data.restart_delay || 5,
    max_restart: data.max_restart || 5,
    prefix: data.prefix || '.',
    owner_number: data.owner_number || null,
    phone_number: data.phone_number || null,
    pair_mode: data.pair_mode !== undefined ? data.pair_mode : 1,
    workspace_path: data.workspace_path || `./data/bots/${uuidv4()}`
  };
  
  return await createBot(botData);
};

// Update bot
export const updateBotById = async (id, data) => {
  return await updateBot(id, data);
};

// Update bot status
export const updateBotStatus = async (id, status) => {
  return await updateBot(id, { status });
};

// Delete bot (prevent deleting built-in)
export const deleteBotById = async (id) => {
  if (id === BUILTIN_BOT_ID) {
    throw new Error('Cannot delete built-in bot');
  }
  try {
    await stopBotProcess(id);
  } catch (e) {}
  return await deleteBot(id);
};

// Start bot
export const startBot = async (id) => {
  const bot = await getBot(id);
  if (!bot) throw new Error('Bot not found');
  
  const workspace = bot.workspace_path || `./data/bots/${id}`;
  if (!fs.existsSync(workspace)) {
    throw new Error(`Workspace not found: ${workspace}`);
  }
  
  return await startBotProcess(id);
};

// Stop bot
export const stopBot = async (id) => {
  const bot = await getBot(id);
  if (!bot) throw new Error('Bot not found');
  return await stopBotProcess(id);
};

// Restart bot
export const restartBot = async (id) => {
  const bot = await getBot(id);
  if (!bot) throw new Error('Bot not found');
  return await restartBotProcess(id);
};

// Update phone number
export const updatePhoneNumber = async (id, phoneNumber) => {
  return await updateBot(id, { phone_number: phoneNumber });
};

// Update owner number
export const updateOwnerNumber = async (id, ownerNumber) => {
  return await updateBot(id, { owner_number: ownerNumber });
};

// Re-export
export { getBot, updateBot };

export default {
  getAllBots,
  getBuiltinBot,
  getBotById,
  createNewBot,
  updateBotById,
  updateBotStatus,
  deleteBotById,
  startBot,
  stopBot,
  restartBot,
  updatePhoneNumber,
  updateOwnerNumber,
  getBot,
  updateBot,
  BUILTIN_BOT_ID
};
