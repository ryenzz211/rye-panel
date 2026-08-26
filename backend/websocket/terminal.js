import { WebSocketServer } from 'ws';
import { getProcessStatus } from '../services/processService.js';
import { getBot } from '../services/botService.js';

const clients = new Map();

export const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server, path: '/ws/terminal' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const botId = url.searchParams.get('botId');

    if (!botId) {
      ws.send(JSON.stringify({ type: 'error', message: 'botId required' }));
      ws.close();
      return;
    }

    if (!clients.has(botId)) {
      clients.set(botId, []);
    }
    clients.get(botId).push(ws);

    console.log(`[WS] Client subscribed to bot: ${botId}`);

    sendStatus(ws, botId);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'get_status') {
          await sendStatus(ws, botId);
        }
      } catch (error) {
        console.error('[WS] Message error:', error);
      }
    });

    ws.on('close', () => {
      if (clients.has(botId)) {
        const clientList = clients.get(botId).filter(c => c !== ws);
        if (clientList.length > 0) {
          clients.set(botId, clientList);
        } else {
          clients.delete(botId);
        }
      }
      console.log(`[WS] Client disconnected from bot: ${botId}`);
    });

    const pingInterval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);

    ws.on('close', () => clearInterval(pingInterval));
  });

  console.log('[WS] WebSocket server started on /ws/terminal');
  return wss;
};

const sendStatus = async (ws, botId) => {
  try {
    const bot = await getBot(botId);
    const status = await getProcessStatus(botId);
    
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        bot: bot || { id: botId, name: 'Unknown', status: 'unknown' },
        process: status
      }
    }));
  } catch (error) {
    ws.send(JSON.stringify({ type: 'error', message: error.message }));
  }
};

// Broadcast log to all clients of a bot
export const broadcastLog = (botId, level, message) => {
  if (!clients.has(botId)) return;
  
  const timestamp = new Date().toISOString();
  const logData = {
    type: 'log',
    data: {
      level: level || 'info',
      message: message,
      timestamp: timestamp
    }
  };

  const clientList = clients.get(botId);
  for (const ws of clientList) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(logData));
    }
  }
};

export const broadcastStatus = async (botId) => {
  if (!clients.has(botId)) return;

  try {
    const bot = await getBot(botId);
    const status = await getProcessStatus(botId);
    
    const clientList = clients.get(botId);
    for (const ws of clientList) {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: 'status',
          data: {
            bot: bot || { id: botId, name: 'Unknown', status: 'unknown' },
            process: status
          }
        }));
      }
    }
  } catch (error) {
    console.error('[WS] Broadcast status error:', error);
  }
};

export const getClients = () => {
  return clients;
};

export default {
  setupWebSocket,
  broadcastLog,
  broadcastStatus,
  getClients
};
