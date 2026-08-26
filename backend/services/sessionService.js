import fs from 'fs-extra';
import path from 'path';
import { getBot, updateBot, run, query, queryOne } from '../database/index.js';

// Get session info for a bot
export const getSessionInfo = async (botId) => {
  const bot = await getBot(botId);
  if (!bot) throw new Error('Bot not found');
  
  let session = await queryOne('SELECT * FROM bot_sessions WHERE bot_id = ?', [botId]);
  
  const sessionPath = bot.session_path || './session';
  const workspace = bot.workspace_path || `./data/bots/${botId}`;
  const fullSessionPath = path.join(workspace, sessionPath);
  
  let sessionExists = false;
  let sessionSize = 0;
  let fileCount = 0;
  
  if (fs.existsSync(fullSessionPath)) {
    sessionExists = true;
    const stats = fs.statSync(fullSessionPath);
    if (stats.isDirectory()) {
      const files = fs.readdirSync(fullSessionPath);
      fileCount = files.length;
      for (const file of files) {
        const filePath = path.join(fullSessionPath, file);
        const fileStat = fs.statSync(filePath);
        if (fileStat.isFile()) {
          sessionSize += fileStat.size;
        }
      }
    }
  }
  
  return {
    botId,
    botName: bot.display_name || bot.name,
    connected: session ? session.connected : false,
    pair_code: session ? session.pair_code : null,
    pair_requested_at: session ? session.pair_requested_at : null,
    connected_at: session ? session.connected_at : null,
    disconnected_at: session ? session.disconnected_at : null,
    last_error: session ? session.last_error : null,
    session_exists: sessionExists,
    session_size: sessionSize,
    file_count: fileCount,
    session_path: fullSessionPath
  };
};

// Delete session for a bot
export const deleteSession = async (botId) => {
  console.log('[SessionService] Deleting session for:', botId);
  
  const bot = await getBot(botId);
  if (!bot) throw new Error('Bot not found');
  
  // Delete from database
  await run('DELETE FROM bot_sessions WHERE bot_id = ?', [botId]);
  
  // Delete physical session folder
  const sessionPath = bot.session_path || './session';
  const workspace = bot.workspace_path || `./data/bots/${botId}`;
  const fullSessionPath = path.join(workspace, sessionPath);
  
  let deleted = false;
  if (fs.existsSync(fullSessionPath)) {
    fs.removeSync(fullSessionPath);
    deleted = true;
    console.log('[SessionService] Deleted session folder:', fullSessionPath);
  }
  
  // Update bot status
  await updateBot(botId, { status: 'stopped' });
  
  return {
    botId,
    botName: bot.display_name || bot.name,
    deleted,
    session_path: fullSessionPath
  };
};

// Check if session exists
export const sessionExists = async (botId) => {
  const bot = await getBot(botId);
  if (!bot) return false;
  
  const sessionPath = bot.session_path || './session';
  const workspace = bot.workspace_path || `./data/bots/${botId}`;
  const fullSessionPath = path.join(workspace, sessionPath);
  
  return fs.existsSync(fullSessionPath);
};

// Update session status
export const updateSessionStatus = async (botId, data) => {
  const { connected, pair_code, pair_requested_at, connected_at, disconnected_at, last_error } = data;
  
  const existing = await queryOne('SELECT * FROM bot_sessions WHERE bot_id = ?', [botId]);
  
  if (existing) {
    await run(`
      UPDATE bot_sessions SET 
        connected = ?,
        pair_code = ?,
        pair_requested_at = ?,
        connected_at = ?,
        disconnected_at = ?,
        last_error = ?
      WHERE bot_id = ?
    `, [
      connected !== undefined ? connected : existing.connected,
      pair_code || existing.pair_code,
      pair_requested_at || existing.pair_requested_at,
      connected_at || existing.connected_at,
      disconnected_at || existing.disconnected_at,
      last_error || existing.last_error,
      botId
    ]);
  } else {
    await run(`
      INSERT INTO bot_sessions (bot_id, connected, pair_code, pair_requested_at, connected_at, disconnected_at, last_error)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      botId,
      connected || 0,
      pair_code || null,
      pair_requested_at || null,
      connected_at || null,
      disconnected_at || null,
      last_error || null
    ]);
  }
  
  return await getSessionInfo(botId);
};

export default {
  getSessionInfo,
  deleteSession,
  sessionExists,
  updateSessionStatus
};
