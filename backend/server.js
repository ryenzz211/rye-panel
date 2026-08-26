import dotenv from 'dotenv';
dotenv.config();

import app, { createServer } from './app.js';
import { migrate, seedData } from './database/index.js';
import { setupWebSocket } from './websocket/terminal.js';
import { setBroadcastLog } from './services/processService.js';

const PORT = parseInt(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('[Server] Starting Rye Panel...');

(async () => {
  try {
    console.log('[Server] Running migration...');
    await migrate();
    console.log('[Server] Migration done');
    
    // Seed initial data
    console.log('[Server] Seeding data...');
    await seedData();
    console.log('[Server] Seed done');
    
    // Create HTTP server
    const server = createServer();
    
    // Setup WebSocket
    const wss = setupWebSocket(server);
    setBroadcastLog((botId, level, message) => {
      if (global.broadcastLog) {
        global.broadcastLog(botId, level, message);
      }
    });
    
    global.wss = wss;
    
    // Start server
    server.listen(PORT, HOST, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════════════════╗');
      console.log('║                                                           ║');
      console.log('║   🚀 RYE PANEL — Multi WhatsApp Bot Management            ║');
      console.log('║                                                           ║');
      console.log('║   📱 Running on: http://' + HOST + ':' + PORT + '          ║');
      console.log('║   🔌 WebSocket: ws://' + HOST + ':' + PORT + '/ws/terminal ║');
      console.log('║   👤 Default: admin / admin123                            ║');
      console.log('║                                                           ║');
      console.log('║   © 2026 Ryenz Developer. All Rights Reserved.           ║');
      console.log('║                                                           ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      console.log('');
    });
    
  } catch (error) {
    console.error('[Server] Failed to start:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
