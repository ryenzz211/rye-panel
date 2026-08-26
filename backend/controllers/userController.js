import { 
  getAllUsers, 
  getUserById, 
  createNewUser, 
  updateUserById, 
  deleteUserById,
  changeUserPassword,
  resetUserPassword
} from '../services/userService.js';
import { log } from '../services/auditService.js';

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('[UserController] Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar user: ' + error.message
    });
  }
};

// Get user by id
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }
    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('[UserController] Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil user: ' + error.message
    });
  }
};

// Create user
export const createUser = async (req, res) => {
  try {
    const { username, password, display_name, email, role } = req.body;
    
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
    
    // Only admin can create users
    if (req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat membuat user'
      });
    }
    
    const user = await createNewUser({ username, password, display_name, email, role });
    
    // Log
    await log({
      userId: req.session.userId,
      action: 'USER_CREATE',
      target: user.id,
      details: `User ${username} created by ${req.session.username}`
    });
    
    return res.status(201).json({
      success: true,
      message: 'User berhasil dibuat',
      data: user
    });
  } catch (error) {
    console.error('[UserController] Create user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat user: ' + error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Only admin can update other users
    if (req.session.role !== 'admin' && parseInt(id) !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses untuk update user ini'
      });
    }
    
    const user = await updateUserById(id, data);
    
    return res.json({
      success: true,
      message: 'User berhasil diupdate',
      data: user
    });
  } catch (error) {
    console.error('[UserController] Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal update user: ' + error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Can't delete self
    if (parseInt(id) === req.session.userId) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus akun sendiri'
      });
    }
    
    // Only admin can delete users
    if (req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat menghapus user'
      });
    }
    
    const result = await deleteUserById(id);
    
    return res.json({
      success: true,
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('[UserController] Delete user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus user: ' + error.message
    });
  }
};

// Change own password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.userId;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru wajib diisi'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }
    
    await changeUserPassword(userId, oldPassword, newPassword);
    
    return res.json({
      success: true,
      message: 'Password berhasil diubah'
    });
  } catch (error) {
    console.error('[UserController] Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah password: ' + error.message
    });
  }
};

// Reset user password (admin)
export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (req.session.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Hanya admin yang dapat reset password'
      });
    }
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }
    
    await resetUserPassword(id, newPassword);
    
    return res.json({
      success: true,
      message: 'Password berhasil direset'
    });
  } catch (error) {
    console.error('[UserController] Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal reset password: ' + error.message
    });
  }
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  resetPassword
};
