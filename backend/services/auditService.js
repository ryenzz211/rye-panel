import { addAuditLog, getAuditLogs, clearAuditLogs, run, queryOne } from '../database/index.js';

// Add audit log
export const log = async (data) => {
  const { userId, action, target, status, details, ip } = data;
  console.log('[Audit] Log:', { userId, action, target, status });
  return await addAuditLog({
    user_id: userId,
    action,
    target,
    status: status || 'success',
    details: details || null,
    ip: ip || null
  });
};

// Get audit logs
export const getLogs = async (limit = 50) => {
  console.log('[Audit] Getting logs, limit:', limit);
  const logs = await getAuditLogs(limit);
  console.log('[Audit] Found:', logs.length);
  return logs;
};

// Clear old logs (by days)
export const clearOldLogs = async (days = 30) => {
  return await clearAuditLogs(days);
};

// Delete all logs
export const deleteAllLogs = async () => {
  await run('DELETE FROM audit_logs');
  return true;
};

// Delete single log by ID
export const deleteLogById = async (id) => {
  const result = await run('DELETE FROM audit_logs WHERE id = ?', [id]);
  if (result.changes === 0) {
    throw new Error('Audit log not found');
  }
  return true;
};

// Log user login
export const logLogin = async (userId, username, ip) => {
  return await log({
    userId,
    action: 'LOGIN',
    target: username,
    status: 'success',
    details: `User ${username} logged in`,
    ip
  });
};

// Log user logout
export const logLogout = async (userId, username) => {
  return await log({
    userId,
    action: 'LOGOUT',
    target: username,
    status: 'success',
    details: `User ${username} logged out`
  });
};

// Log bot action
export const logBotAction = async (userId, action, botId, botName, status = 'success', error = null) => {
  return await log({
    userId,
    action: `BOT_${action.toUpperCase()}`,
    target: botId,
    status,
    details: error ? `Bot ${botName}: ${error}` : `Bot ${botName} ${action}ed successfully`
  });
};

// Log import
export const logImport = async (userId, botId, botName) => {
  return await log({
    userId,
    action: 'BOT_IMPORT',
    target: botId,
    status: 'success',
    details: `Bot ${botName} imported successfully`
  });
};

// Log delete
export const logDelete = async (userId, botId, botName) => {
  return await log({
    userId,
    action: 'BOT_DELETE',
    target: botId,
    status: 'success',
    details: `Bot ${botName} deleted`
  });
};

export default {
  log,
  getLogs,
  clearOldLogs,
  deleteAllLogs,
  deleteLogById,
  logLogin,
  logLogout,
  logBotAction,
  logImport,
  logDelete
};
