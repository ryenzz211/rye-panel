import dotenv from 'dotenv';
dotenv.config();

try {
  console.log('[START] Loading modules...');
  import('express');
  import('ws');
  import('sql.js');
} catch (e) {
  console.log('[ERROR] Module not found:', e.message);
}

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { initDB, seedData } from './database/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Setup database
await initDB();
await seedData();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend/views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Rye Panel' });
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('🔗 WebSocket connected');
  ws.send(JSON.stringify({ type: 'info', message: 'Connected to Rye Panel' }));
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Rye Panel running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
