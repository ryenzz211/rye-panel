import bcrypt from 'bcrypt';
import { getUsers, getUser, getUserByUsername, createUser, updateUser, deleteUser } from '../database/index.js';
import { log } from './auditService.js';

const SALT_ROUNDS = 10;

// Get all users
export const getAllUsers = async () => {
  const users = await getUsers();
  // Remove password_hash from response
  return users.map(u => {
    const { password_hash, ...rest } = u;
    return rest;
  });
};

// Get user by id
export const getUserById = async (id) => {
  const user = await getUser(id);
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
};

// Create user
export const createNewUser = async (data) => {
  const { username, password, display_name, email, role } = data;
  
  // Check if username exists
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error('Username already exists');
  }
  
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  
  const user = await createUser({
    username,
    password_hash: hashed,
    display_name: display_name || username,
    email: email || null,
    role: role || 'user'
  });
  
  // Log
  await log({
    userId: null,
    action: 'USER_CREATE',
    target: user.id,
    details: `User ${username} created with role ${role || 'user'}`
  });
  
  const { password_hash, ...rest } = user;
  return rest;
};

// Update user
export const updateUserById = async (id, data) => {
  const user = await getUser(id);
  if (!user) throw new Error('User not found');
  
  const updateData = {};
  
  if (data.display_name) updateData.display_name = data.display_name;
  if (data.email) updateData.email = data.email;
  if (data.role) updateData.role = data.role;
  if (data.status) updateData.status = data.status;
  
  if (data.password) {
    updateData.password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }
  
  const updated = await updateUser(id, updateData);
  
  // Log
  await log({
    userId: id,
    action: 'USER_UPDATE',
    target: id,
    details: `User ${user.username} updated`
  });
  
  const { password_hash, ...rest } = updated;
  return rest;
};

// Delete user
export const deleteUserById = async (id) => {
  const user = await getUser(id);
  if (!user) throw new Error('User not found');
  
  // Check if last admin
  const admins = await getUsers();
  const adminCount = admins.filter(u => u.role === 'admin').length;
  if (user.role === 'admin' && adminCount <= 1) {
    throw new Error('Cannot delete last admin');
  }
  
  const result = await deleteUser(id);
  
  // Log
  await log({
    userId: id,
    action: 'USER_DELETE',
    target: id,
    details: `User ${user.username} deleted`
  });
  
  return result;
};

// Change user password
export const changeUserPassword = async (id, oldPassword, newPassword) => {
  const user = await getUser(id);
  if (!user) throw new Error('User not found');
  
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw new Error('Old password is incorrect');
  
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUser(id, { password_hash: hashed });
  
  return { success: true };
};

// Reset user password (admin only)
export const resetUserPassword = async (id, newPassword) => {
  const user = await getUser(id);
  if (!user) throw new Error('User not found');
  
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await updateUser(id, { password_hash: hashed });
  
  return { success: true };
};

export default {
  getAllUsers,
  getUserById,
  createNewUser,
  updateUserById,
  deleteUserById,
  changeUserPassword,
  resetUserPassword
};
