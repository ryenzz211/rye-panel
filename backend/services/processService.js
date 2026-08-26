import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { getBot, updateBot } from './botService.js';
import { BOT_STATUS } from '../constants/botStatus.js';

let broadcastLog = null;
export const setBroadcastLog = (fn) => { broadcastLog = fn; };

const processes = new Map();

export const startBotProcess = async (botId) => {
  const bot = await getBot(botId);
  if (!bot) throw new Error('Bot not found');

  if (processes.has(botId)) {
    const proc = processes.get(botId);
    if (proc.child && !proc.child.killed) {
      throw new Error('Bot already running');
    }
  }

  // Resolve workspace path
  let workspace = bot.workspace_path || `./data/bots/${botId}`;
  if (workspace.startsWith('./')) {
    workspace = path.resolve(process.cwd(), workspace);
  } else {
    workspace = path.resolve(process.cwd(), workspace);
  }
  
  const entryFile = bot.entry_file || 'index.js';
  const entryPath = path.join(workspace, entryFile);

  console.log(`[Process] Workspace: ${workspace}`);
  console.log(`[Process] Entry: ${entryPath}`);

  if (!fs.existsSync(entryPath)) {
    const possiblePaths = [
      entryPath,
      path.join(workspace, 'source', entryFile),
      path.join(workspace, 'src', entryFile),
      path.join(workspace, 'bot', entryFile)
    ];
    
    let found = false;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        console.log(`[Process] Found entry at: ${p}`);
        const newWorkspace = path.dirname(p);
        const newEntry = path.basename(p);
        await updateBot(botId, { workspace_path: newWorkspace, entry_file: newEntry });
        workspace = newWorkspace;
        entryPath = p;
        found = true;
        break;
      }
    }
    
    if (!found) {
      throw new Error(`Entry file not found: ${entryPath}`);
    }
  }

  await updateBot(botId, { status: BOT_STATUS.STARTING });

  // ============ BUILD ENVIRONMENT ============
  let env = {};
  try {
    env = bot.environment ? JSON.parse(bot.environment) : {};
  } catch (e) {}

  // Phone number from panel
  if (bot.phone_number) {
    env.PHONE_NUMBER = bot.phone_number;
    env.BOT_PHONE = bot.phone_number;
  }

  // Prefix from panel
  if (bot.prefix) {
    env.BOT_PREFIX = bot.prefix;
    env.PREFIX = bot.prefix;
  }

  // Owner number from panel
  if (bot.owner_number) {
    env.OWNER_NUMBER = bot.owner_number;
    env.BOT_OWNER = bot.owner_number;
  }

  // Bot name
  env.BOT_NAME = bot.display_name || bot.name || 'RyeBot';

  // Config file will use these env vars
  console.log(`[Process] Env:`, Object.keys(env));
  console.log(`[Process] Phone: ${env.PHONE_NUMBER || 'Not set'}`);

  const child = spawn('node', [entryPath], {
    cwd: workspace,
    env: {
      ...process.env,
      ...env,
      BOT_ID: botId,
      BOT_NAME: bot.display_name || bot.name || 'RyeBot',
      NODE_ENV: process.env.NODE_ENV || 'production'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const processInfo = {
    child,
    botId,
    startedAt: Date.now(),
    status: BOT_STATUS.RUNNING
  };
  processes.set(botId, processInfo);

  const broadcast = (level, message) => {
    if (broadcastLog) {
      broadcastLog(botId, level, message);
    }
  };

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      console.log(`[Bot ${botId}] ${line}`);
      broadcast('info', line);
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    for (const line of lines) {
      console.error(`[Bot ${botId} ERR] ${line}`);
      broadcast('error', line);
    }
  });

  child.on('exit', async (code, signal) => {
    console.log(`[Bot ${botId}] Exited with code ${code}, signal ${signal}`);
    broadcast('info', `Process exited with code ${code}, signal ${signal}`);
    processes.delete(botId);
    if (code !== 0 && code !== null) {
      await updateBot(botId, { status: BOT_STATUS.ERROR });
    } else {
      await updateBot(botId, { status: BOT_STATUS.STOPPED });
    }
  });

  child.on('error', async (err) => {
    console.error(`[Bot ${botId}] Process error:`, err.message);
    broadcast('error', `Process error: ${err.message}`);
    processes.delete(botId);
    await updateBot(botId, { status: BOT_STATUS.ERROR });
  });

  await updateBot(botId, { 
    status: BOT_STATUS.RUNNING,
    last_started: Math.floor(Date.now() / 1000)
  });

  broadcast('success', 'Bot started successfully');
  return { botId, pid: child.pid };
};

export const stopBotProcess = async (botId) => {
  const processInfo = processes.get(botId);
  
  if (!processInfo) {
    const bot = await getBot(botId);
    if (bot) {
      await updateBot(botId, { status: BOT_STATUS.STOPPED });
      return { botId, stopped: true, message: 'Bot was not running' };
    }
    throw new Error('Bot not found');
  }

  const { child } = processInfo;
  
  if (child.killed) {
    processes.delete(botId);
    await updateBot(botId, { status: BOT_STATUS.STOPPED });
    return { botId, stopped: true, message: 'Bot already stopped' };
  }

  child.kill('SIGTERM');

  const timeout = 10000;
  const start = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      if (child.killed) {
        clearInterval(checkInterval);
        processes.delete(botId);
        updateBot(botId, { 
          status: BOT_STATUS.STOPPED,
          last_stopped: Math.floor(Date.now() / 1000)
        });
        resolve({ botId, stopped: true });
        return;
      }

      if (Date.now() - start > timeout) {
        clearInterval(checkInterval);
        child.kill('SIGKILL');
        processes.delete(botId);
        updateBot(botId, { 
          status: BOT_STATUS.STOPPED,
          last_stopped: Math.floor(Date.now() / 1000)
        });
        resolve({ botId, stopped: true, message: 'Force killed after timeout' });
      }
    }, 100);
  });
};

export const restartBotProcess = async (botId) => {
  await stopBotProcess(botId);
  await new Promise(resolve => setTimeout(resolve, 1000));
  return await startBotProcess(botId);
};

export const getProcessStatus = async (botId) => {
  const processInfo = processes.get(botId);
  
  if (!processInfo) {
    const bot = await getBot(botId);
    return {
      botId,
      status: bot ? bot.status : 'unknown',
      running: false,
      pid: null,
      uptime: 0
    };
  }

  const { child, startedAt } = processInfo;
  const running = !child.killed;
  const uptime = running ? Math.floor((Date.now() - startedAt) / 1000) : 0;

  return {
    botId,
    status: running ? BOT_STATUS.RUNNING : BOT_STATUS.STOPPED,
    running,
    pid: child.pid,
    uptime,
    startedAt
  };
};

export const getAllProcesses = () => {
  const result = [];
  for (const [botId, info] of processes) {
    const { child, startedAt } = info;
    result.push({
      botId,
      pid: child.pid,
      running: !child.killed,
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      startedAt
    });
  }
  return result;
};

export const killAllProcesses = async () => {
  const results = [];
  for (const [botId] of processes) {
    try {
      const result = await stopBotProcess(botId);
      results.push(result);
    } catch (e) {
      results.push({ botId, error: e.message });
    }
  }
  return results;
};

export const cleanup = () => {
  for (const [botId, info] of processes) {
    const { child } = info;
    if (child.killed) {
      processes.delete(botId);
    }
  }
};

export default {
  startBotProcess,
  stopBotProcess,
  restartBotProcess,
  getProcessStatus,
  getAllProcesses,
  killAllProcesses,
  cleanup,
  setBroadcastLog
};
