export const BOT_STATUS = {
  STOPPED: 'stopped',
  STARTING: 'starting',
  RUNNING: 'running',
  STOPPING: 'stopping',
  ERROR: 'error',
  INSTALLING: 'installing',
  CONNECTING: 'connecting',
  CRASHED: 'crashed'
};

export const BOT_TYPE = {
  BUILTIN: 'builtin',
  IMPORTED: 'imported'
};

export const isRunning = (status) => {
  return status === BOT_STATUS.RUNNING || status === BOT_STATUS.CONNECTING;
};

export const isActive = (status) => {
  return status === BOT_STATUS.RUNNING || 
         status === BOT_STATUS.CONNECTING || 
         status === BOT_STATUS.STARTING;
};

export const getStatusColor = (status) => {
  const colors = {
    [BOT_STATUS.STOPPED]: '#6b7280',
    [BOT_STATUS.STARTING]: '#f59e0b',
    [BOT_STATUS.RUNNING]: '#22c55e',
    [BOT_STATUS.STOPPING]: '#f59e0b',
    [BOT_STATUS.ERROR]: '#ef4444',
    [BOT_STATUS.INSTALLING]: '#3b82f6',
    [BOT_STATUS.CONNECTING]: '#8b5cf6',
    [BOT_STATUS.CRASHED]: '#ef4444'
  };
  return colors[status] || '#6b7280';
};

export const getStatusLabel = (status) => {
  const labels = {
    [BOT_STATUS.STOPPED]: 'Stopped',
    [BOT_STATUS.STARTING]: 'Starting...',
    [BOT_STATUS.RUNNING]: 'Online',
    [BOT_STATUS.STOPPING]: 'Stopping...',
    [BOT_STATUS.ERROR]: 'Error',
    [BOT_STATUS.INSTALLING]: 'Installing...',
    [BOT_STATUS.CONNECTING]: 'Connecting...',
    [BOT_STATUS.CRASHED]: 'Crashed'
  };
  return labels[status] || status;
};

export default {
  BOT_STATUS,
  BOT_TYPE,
  isRunning,
  isActive,
  getStatusColor,
  getStatusLabel
};
