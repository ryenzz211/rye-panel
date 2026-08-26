import { verifyLogin, getUserById, isFirstRun, createAdminUser } from '../services/authService.js';
import { logLogin, logLogout } from '../services/auditService.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username dan password wajib diisi'
      });
    }
    
    const user = await verifyLogin(username, password);
    
    if (!user) {
      await logLogin(null, username, req.ip, 'failed');
      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }
    
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    await logLogin(user.id, username, req.ip);
    
    return res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

export const logout = async (req, res) => {
  const userId = req.session?.userId;
  const username = req.session?.username;
  
  if (userId) {
    await logLogout(userId, username);
  }
  
  req.session.destroy((err) => {
    if (err) {
      console.error('[Auth] Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Gagal logout'
      });
    }
    res.clearCookie('connect.sid');
    return res.json({
      success: true,
      message: 'Logout berhasil'
    });
  });
};

export const me = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi'
      });
    }
    
    const user = await getUserById(req.session.userId);
    
    if (!user) {
      req.session.destroy();
      return res.status(401).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    
    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role,
        last_active: user.last_active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

export const checkFirstRun = async (req, res) => {
  try {
    const firstRun = await isFirstRun();
    return res.json({
      success: true,
      data: { firstRun }
    });
  } catch (error) {
    console.error('[Auth] First run check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

export const setupAdmin = async (req, res) => {
  try {
    const { username, password, display_name } = req.body;
    
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
    
    const firstRun = await isFirstRun();
    if (!firstRun) {
      return res.status(403).json({
        success: false,
        message: 'Setup sudah dilakukan'
      });
    }
    
    const user = await createAdminUser(username, password, display_name || 'Admin');
    
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    await logLogin(user.id, username, req.ip);
    
    return res.json({
      success: true,
      message: 'Admin berhasil dibuat',
      data: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth] Setup error:', error);
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

export default {
  login,
  logout,
  me,
  checkFirstRun,
  setupAdmin
};
