import express from 'express';
import { isFirstRun } from '../services/authService.js';

const router = express.Router();

// Middleware
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const checkFirstRun = async (req, res, next) => {
  try {
    const firstRun = await isFirstRun();
    if (firstRun && req.path !== '/setup') {
      return res.redirect('/setup');
    }
    next();
  } catch (error) {
    next();
  }
};

// Login
router.get('/login', async (req, res) => {
  try {
    const firstRun = await isFirstRun();
    if (firstRun) return res.redirect('/setup');
    if (req.session?.userId) return res.redirect('/dashboard');
    res.render('login', { title: 'Login - Rye Panel' });
  } catch {
    res.render('login', { title: 'Login - Rye Panel' });
  }
});

// Setup
router.get('/setup', async (req, res) => {
  try {
    const firstRun = await isFirstRun();
    if (!firstRun) return res.redirect('/login');
    res.render('setup', { title: 'Setup - Rye Panel' });
  } catch {
    res.render('setup', { title: 'Setup - Rye Panel' });
  }
});

// Dashboard
router.get(['/', '/dashboard'], checkFirstRun, requireAuth, (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard - Rye Panel',
    user: {
      username: req.session.username,
      display_name: req.session.username,
      role: req.session.role || 'Administrator',
      email: req.session.email || 'admin@rye-panel.com',
      last_active: Math.floor(Date.now() / 1000)
    },
    currentPath: '/dashboard'
  });
});

// Bots
router.get('/bots', checkFirstRun, requireAuth, (req, res) => {
  res.render('bots/index', {
    title: 'Bots - Rye Panel',
    user: {
      username: req.session.username,
      display_name: req.session.username,
      role: req.session.role || 'Administrator'
    },
    currentPath: '/bots'
  });
});

// Create Bot
router.get('/bots/create', checkFirstRun, requireAuth, (req, res) => {
  res.render('bots/create', {
    title: 'Buat Bot - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/bots'
  });
});

// Import Bot
router.get('/bots/import', checkFirstRun, requireAuth, (req, res) => {
  res.render('bots/import', {
    title: 'Import Bot - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/bots'
  });
});

// Built-in Bot
router.get('/bots/builtin', checkFirstRun, requireAuth, async (req, res) => {
  res.render('bots/builtin', {
    title: 'Built-in Bot - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/bots'
  });
});

// Terminal page
router.get('/bots/:id/terminal', checkFirstRun, requireAuth, async (req, res) => {
  const { id } = req.params;
  const botName = req.query.name || 'Bot';
  res.render('bots/terminal', {
    title: 'Terminal - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    botId: id,
    botName: botName,
    currentPath: '/bots'
  });
});

// File Manager page (per bot)
router.get('/bots/:id/files', checkFirstRun, requireAuth, async (req, res) => {
  const { id } = req.params;
  res.render('bots/files', {
    title: 'File Manager - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    botId: id,
    currentPath: '/files'
  });
});

// File Manager global
router.get('/files', checkFirstRun, requireAuth, async (req, res) => {
  res.render('files/index', {
    title: 'File Manager - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/files'
  });
});

// Environment Variables
router.get('/bots/:id/env', checkFirstRun, requireAuth, async (req, res) => {
  const { id } = req.params;
  res.render('bots/env', {
    title: 'Environment Variables - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    botId: id,
    currentPath: '/settings'
  });
});

// Settings
router.get('/settings', checkFirstRun, requireAuth, async (req, res) => {
  res.render('settings/index', {
    title: 'Settings - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/settings'
  });
});

// Backup
router.get('/backup', checkFirstRun, requireAuth, async (req, res) => {
  res.render('backup/index', {
    title: 'Backup - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/backup'
  });
});

// System
router.get('/system', checkFirstRun, requireAuth, async (req, res) => {
  res.render('system/index', {
    title: 'System - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/system'
  });
});

// Audit
router.get('/audit', checkFirstRun, requireAuth, async (req, res) => {
  res.render('audit/index', {
    title: 'Audit Logs - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/audit'
  });
});

// Users (admin only)
router.get('/users', checkFirstRun, requireAuth, async (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }
  res.render('users/index', {
    title: 'Users - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username, role: req.session.role },
    currentPath: '/users'
  });
});

// Plugins (admin only)
router.get('/plugins', checkFirstRun, requireAuth, async (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Access Denied');
  }
  res.render('plugins/index', {
    title: 'Plugins - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username, role: req.session.role },
    currentPath: '/plugins'
  });
});

// Developer
router.get('/developer', checkFirstRun, requireAuth, async (req, res) => {
  res.render('developer/index', {
    title: 'Developer - Rye Panel',
    user: { username: req.session.username, display_name: req.session.username },
    currentPath: '/developer'
  });
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

export default router;
