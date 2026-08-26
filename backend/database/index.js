import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const DB_PATH = process.env.DB_PATH || './data/database/rye.db';
const FULL_DB_PATH = path.resolve(process.cwd(), DB_PATH);
const dbDir = path.dirname(FULL_DB_PATH);
fs.ensureDirSync(dbDir);

const store = {
  users: [],
  bots: [],
  bot_processes: [],
  bot_sessions: [],
  bot_logs: [],
  audit_logs: [],
  system_settings: {
    panel_name: 'Rye Panel',
    theme: 'dark',
    first_run: 'false',
    port: '3000',
    host: '0.0.0.0',
    auto_refresh: 'true',
    refresh_interval: '5',
    log_retention: '7',
    max_bots: '50',
    maintenance_mode: 'false',
    language: 'id'
  },
  _nextIds: { users: 1, bot_logs: 1, audit_logs: 1 }
};

const loadData = () => {
  try {
    if (fs.existsSync(FULL_DB_PATH)) {
      const data = fs.readFileSync(FULL_DB_PATH, 'utf8');
      if (data) {
        const parsed = JSON.parse(data);
        Object.assign(store, parsed);
        console.log('[DB] Data loaded from file');
        console.log('[DB] Users:', store.users.length);
        console.log('[DB] Bots:', store.bots.length);
        console.log('[DB] Audit Logs:', store.audit_logs.length);
      }
    }
  } catch (e) {
    console.log('[DB] No existing data, starting fresh');
  }
};

const saveData = () => {
  try {
    fs.writeFileSync(FULL_DB_PATH, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('[DB] Failed to save data:', e.message);
  }
};

loadData();

export const initDB = async () => {
  console.log('[DB] In-memory database ready');
  return store;
};

export const getDb = async () => store;
export const saveDb = async () => { saveData(); console.log('[DB] Data saved'); };

export const migrate = async () => {
  console.log('[DB] Running migration...');
  saveData();
  console.log('[DB] Migration completed');
};

export const seedData = async () => {
  if (store.users.length > 0) {
    console.log('[DB] Data already seeded');
    return;
  }
  console.log('[DB] Seeding initial data...');
  const hashed = await bcrypt.hash('admin123', 10);
  store.users.push({
    id: store._nextIds.users++,
    username: 'admin',
    password_hash: hashed,
    display_name: 'Administrator',
    email: 'admin@rye-panel.com',
    role: 'admin',
    status: 'active',
    last_active: Math.floor(Date.now() / 1000),
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000)
  });
  store.bots.push({
    id: 'sample-bot-1',
    name: 'Sample Bot',
    display_name: 'Sample Bot',
    type: 'imported',
    status: 'stopped',
    entry_file: 'index.js',
    session_path: './session',
    command_path: './commands',
    event_path: './events',
    config_file: 'config.js',
    environment: '{}',
    auto_restart: 1,
    restart_delay: 5,
    max_restart: 5,
    restart_count: 0,
    prefix: '.',
    owner_number: null,
    phone_number: null,
    pair_mode: 1,
    last_started: null,
    last_stopped: null,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    workspace_path: './data/bots/sample-bot-1',
    owner_id: 1
  });
  saveData();
  console.log('[DB] Seeded: 1 admin, 1 bot');
};

export const run = async (sql, params = []) => {
  if (sql.includes('INSERT INTO users')) {
    const user = {
      id: store._nextIds.users++,
      username: params[0],
      password_hash: params[1],
      display_name: params[2] || params[0],
      email: params[3] || null,
      role: params[4] || 'user',
      status: 'active',
      last_active: Math.floor(Date.now() / 1000),
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000)
    };
    store.users.push(user);
    saveData();
    return { changes: 1, lastInsertRowid: user.id };
  }
  if (sql.includes('INSERT INTO bots')) {
    const bot = {
      id: params[0] || uuidv4(),
      name: params[1],
      display_name: params[2],
      type: params[3] || 'imported',
      status: 'stopped',
      entry_file: params[4] || null,
      session_path: params[5] || null,
      command_path: params[6] || null,
      event_path: params[7] || null,
      config_file: params[8] || null,
      environment: params[9] || '{}',
      auto_restart: params[10] || 1,
      restart_delay: params[11] || 5,
      max_restart: params[12] || 5,
      restart_count: 0,
      prefix: params[13] || '.',
      owner_number: params[14] || null,
      phone_number: params[15] || null,
      pair_mode: params[16] || 1,
      last_started: null,
      last_stopped: null,
      created_at: Math.floor(Date.now() / 1000),
      updated_at: Math.floor(Date.now() / 1000),
      workspace_path: params[17] || './data/bots/' + (params[0] || uuidv4()),
      owner_id: params[18] || null
    };
    store.bots.push(bot);
    saveData();
    return { changes: 1, lastInsertRowid: bot.id };
  }
  if (sql.includes('UPDATE bots SET')) {
    const id = params[params.length - 1];
    const bot = store.bots.find(b => b.id === id);
    if (bot) {
      if (sql.includes('status')) bot.status = params[0];
      if (sql.includes('updated_at')) bot.updated_at = Math.floor(Date.now() / 1000);
      saveData();
      return { changes: 1 };
    }
    return { changes: 0 };
  }
  if (sql.includes('DELETE FROM bots')) {
    const id = params[0];
    const index = store.bots.findIndex(b => b.id === id);
    if (index !== -1) {
      store.bots.splice(index, 1);
      saveData();
      return { changes: 1 };
    }
    return { changes: 0 };
  }
  if (sql.includes('INSERT INTO audit_logs')) {
    const log = {
      id: store._nextIds.audit_logs++,
      user_id: params[0] || null,
      action: params[1],
      target: params[2] || null,
      status: params[3] || 'success',
      details: params[4] || null,
      ip: params[5] || null,
      timestamp: Math.floor(Date.now() / 1000)
    };
    store.audit_logs.push(log);
    saveData();
    return { changes: 1, lastInsertRowid: log.id };
  }
  if (sql.includes('DELETE FROM audit_logs')) {
    store.audit_logs = [];
    saveData();
    return { changes: 1 };
  }
  return { changes: 0 };
};

export const query = async (sql, params = []) => {
  if (sql.includes('SELECT * FROM users')) {
    if (sql.includes('WHERE username = ?')) {
      const user = store.users.find(u => u.username === params[0]);
      return user ? [user] : [];
    }
    if (sql.includes('WHERE id = ?')) {
      const user = store.users.find(u => u.id === params[0]);
      return user ? [user] : [];
    }
    return store.users;
  }
  if (sql.includes('SELECT COUNT(*) as count FROM users')) {
    return [{ count: store.users.length }];
  }
  if (sql.includes('SELECT * FROM bots')) {
    if (sql.includes('WHERE id = ?')) {
      const bot = store.bots.find(b => b.id === params[0]);
      return bot ? [bot] : [];
    }
    return store.bots;
  }
  if (sql.includes('SELECT * FROM audit_logs')) {
    let logs = [...store.audit_logs];
    logs.sort((a, b) => b.timestamp - a.timestamp);
    if (sql.includes('LIMIT')) {
      const limit = parseInt(sql.match(/LIMIT\s+(\d+)/)?.[1] || 50);
      logs = logs.slice(0, limit);
    }
    return logs;
  }
  if (sql.includes('SELECT value FROM system_settings')) {
    if (sql.includes('WHERE key = ?')) {
      const value = store.system_settings[params[0]];
      return value ? [{ value }] : [];
    }
    return Object.entries(store.system_settings).map(([key, value]) => ({ key, value }));
  }
  return [];
};

export const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows[0] || null;
};

export const getSetting = async (key) => {
  return store.system_settings[key] || null;
};

export const setSetting = async (key, value) => {
  store.system_settings[key] = value;
  saveData();
};

export const getBots = async () => store.bots;
export const getBot = async (id) => store.bots.find(b => b.id === id) || null;
export const createBot = async (data) => {
  const bot = {
    id: data.id || uuidv4(),
    name: data.name,
    display_name: data.display_name || data.name,
    type: data.type || 'imported',
    status: 'stopped',
    entry_file: data.entry_file || null,
    session_path: data.session_path || null,
    command_path: data.command_path || null,
    event_path: data.event_path || null,
    config_file: data.config_file || null,
    environment: data.environment || '{}',
    auto_restart: data.auto_restart !== undefined ? data.auto_restart : 1,
    restart_delay: data.restart_delay || 5,
    max_restart: data.max_restart || 5,
    restart_count: 0,
    prefix: data.prefix || '.',
    owner_number: data.owner_number || null,
    phone_number: data.phone_number || null,
    pair_mode: data.pair_mode !== undefined ? data.pair_mode : 1,
    last_started: null,
    last_stopped: null,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    workspace_path: data.workspace_path || './data/bots/' + (data.id || uuidv4()),
    owner_id: data.owner_id || null
  };
  store.bots.push(bot);
  saveData();
  return bot;
};

export const updateBot = async (id, data) => {
  const bot = store.bots.find(b => b.id === id);
  if (!bot) return null;
  Object.assign(bot, data);
  bot.updated_at = Math.floor(Date.now() / 1000);
  saveData();
  return bot;
};

export const deleteBot = async (id) => {
  const index = store.bots.findIndex(b => b.id === id);
  if (index === -1) return false;
  store.bots.splice(index, 1);
  saveData();
  return true;
};

export const getUsers = async () => store.users;
export const getUser = async (id) => store.users.find(u => u.id === id) || null;
export const getUserByUsername = async (username) => store.users.find(u => u.username === username) || null;

export const addAuditLog = async (data) => {
  const { user_id, action, target, status, details, ip } = data;
  await run(
    `INSERT INTO audit_logs (user_id, action, target, status, details, ip) VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id || null, action, target || null, status || 'success', details || null, ip || null]
  );
  return true;
};

export const getAuditLogs = async (limit = 50) => {
  return await query(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ${limit}`);
};

export default {
  initDB, getDb, saveDb, migrate, seedData,
  run, query, queryOne, getSetting, setSetting,
  getBots, getBot, createBot, updateBot, deleteBot,
  getUsers, getUser, getUserByUsername,
  addAuditLog, getAuditLogs
};
