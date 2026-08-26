import express from 'express';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('views', path.resolve(__dirname, '../frontend/views'));
app.set('view engine', 'ejs');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'rye-panel-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 604800000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

const publicPath = path.resolve(__dirname, '../frontend/public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

import authRoutes from './routes/api/auth.js';
import botRoutes from './routes/api/bots.js';
import importRoutes from './routes/api/import.js';
import sessionRoutes from './routes/api/sessions.js';
import fileRoutes from './routes/api/files.js';
import envRoutes from './routes/api/env.js';
import settingsRoutes from './routes/api/settings.js';
import backupRoutes from './routes/api/backup.js';
import systemRoutes from './routes/api/system.js';
import pingRoutes from './routes/api/ping.js';
import auditRoutes from './routes/api/audit.js';
import userRoutes from './routes/api/users.js';
import pluginRoutes from './routes/api/plugins.js';
import viewRoutes from './routes/views.js';

app.use('/api/auth', authRoutes);
app.use('/api/bots', botRoutes);
app.use('/api/import', importRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/env', envRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/ping', pingRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/plugins', pluginRoutes);

app.use('/', viewRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
  }
  res.status(404).send('404 - Page Not Found');
});

app.use((err, req, res, next) => {
  console.error('[App] Error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
  res.status(500).send('500 - Internal Server Error');
});

export const createServer = () => {
  return http.createServer(app);
};

export default app;
