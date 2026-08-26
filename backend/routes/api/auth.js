import express from 'express';
import { login, logout, me, checkFirstRun, setupAdmin } from '../../controllers/authController.js';

const router = express.Router();

// Public routes
router.get('/first-run', checkFirstRun);
router.post('/setup', setupAdmin);

// Auth routes
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', me);

export default router;

// Register (public)
router.post('/register', async (req, res) => {
  try {
    const { username, password, display_name, email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }
    
    // Check if username exists
    const { getUserByUsername } = await import('../../services/authService.js');
    const existing = await getUserByUsername(username);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    
    // Create user (default role = user)
    const { createNewUser } = await import('../../services/userService.js');
    const user = await createNewUser({
      username,
      password,
      display_name: display_name || username,
      email: email || null,
      role: 'user'
    });
    
    return res.status(201).json({
      success: true,
      message: 'Akun berhasil dibuat! Silakan login.',
      data: user
    });
  } catch (error) {
    console.error('[Auth] Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat akun: ' + error.message
    });
  }
});

// Forgot password (placeholder)
router.post('/forgot-password', async (req, res) => {
  const { username, email } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({
      success: false,
      message: 'Username dan email wajib diisi'
    });
  }
  
  // Cek user
  const { getUserByUsername } = await import('../../services/authService.js');
  const user = await getUserByUsername(username);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });
  }
  
  // TODO: Kirim email reset password
  return res.json({
    success: true,
    message: 'Link reset password akan dikirim ke email Anda'
  });
});
