import bcrypt from 'bcrypt';
import { query, queryOne, run } from '../database/index.js';

const SALT_ROUNDS = 10;

export const createAdminUser = async (username, password, displayName = 'Admin') => {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  
  await run(
    `INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, 'admin')`,
    [username, hashed, displayName]
  );
  
  return await getUserByUsername(username);
};

export const getUserByUsername = async (username) => {
  return await queryOne('SELECT * FROM users WHERE username = ?', [username]);
};

export const getUserById = async (id) => {
  return await queryOne('SELECT * FROM users WHERE id = ?', [id]);
};

export const verifyLogin = async (username, password) => {
  const user = await getUserByUsername(username);
  if (!user) return null;
  
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return null;
  
  await run(
    `UPDATE users SET last_active = strftime('%s', 'now') WHERE id = ?`,
    [user.id]
  );
  
  return user;
};

export const hasUsers = async () => {
  const result = await queryOne('SELECT COUNT(*) as count FROM users');
  return result.count > 0;
};

export const isFirstRun = async () => {
  return !(await hasUsers());
};

export default {
  createAdminUser,
  getUserByUsername,
  getUserById,
  verifyLogin,
  hasUsers,
  isFirstRun
};
