import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.SESSION_SECRET || 'rye_panel_secret';

// Database sederhana (dari file)
let db = {
  users: [],
  bots: []
};

try {
  const dbPath = path.resolve(process.cwd(), 'data/database/rye.db');
  fs.ensureDirSync(path.dirname(dbPath));
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log('[DB] Data loaded from file');
    console.log('[DB] Users:', db.users?.length || 0);
    console.log('[DB] Bots:', db.bots?.length || 0);
  } else {
    // Seed default
    const hashed = await bcrypt.hash('admin123', 10);
    db.users = [{ id: 1, username: 'admin', password_hash: hashed, role: 'admin' }];
    db.bots = [];
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log('[DB] Seeded initial data');
  }
} catch (e) {
  console.log('[DB] Error:', e.message);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
const publicPath = path.join(__dirname, '../frontend/public');
app.use(express.static(publicPath));

// View engine
app.set('view engine', 'ejs');
const viewsPath = path.join(__dirname, '../frontend/views');
app.set('views', viewsPath);

// ============================================
// ROUTES
// ============================================

// Halaman utama
app.get('/', (req, res) => {
  try {
    res.render('index', { title: 'Rye Panel' });
  } catch (e) {
    res.status(500).send('View error: ' + e.message);
  }
});

// API Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('[LOGIN] Attempt:', username);

    const user = db.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    console.error('[LOGIN] Error:', e.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard (protected)
app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>Dashboard Rye Panel</h1>
    <p>Selamat datang! Login berhasil.</p>
    <p><a href="/">Kembali ke home</a></p>
  `);
});

// Ping
app.get('/ping', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// WebSocket
wss.on('connection', (ws) => {
  console.log('🔗 WebSocket connected');
  ws.send(JSON.stringify({ type: 'info', message: 'Connected to Rye Panel' }));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Rye Panel running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
