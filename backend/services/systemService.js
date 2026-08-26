import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { getBots } from '../database/index.js';
import { getAllProcesses } from './processService.js';

// Get system information
export const getSystemInfo = async () => {
  const bots = await getBots();
  const processes = getAllProcesses();
  
  // CPU Info
  const cpus = os.cpus();
  const cpuCount = cpus.length;
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
  
  // Memory Info
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsagePercent = (usedMem / totalMem * 100).toFixed(1);
  
  // Storage Info (simulasi)
  let storageTotal = 0;
  let storageUsed = 0;
  try {
    const dataPath = path.resolve(process.cwd(), 'data');
    if (fs.existsSync(dataPath)) {
      const stat = fs.statSync(dataPath);
      // Estimate: use total disk space (simplified)
      storageTotal = 100 * 1024 * 1024 * 1024; // 100GB asumsi
      storageUsed = (await getDirectorySize(dataPath));
    }
  } catch (e) {
    storageTotal = 100 * 1024 * 1024 * 1024;
    storageUsed = 0;
  }
  
  // Uptime
  const uptime = os.uptime();
  const uptimeFormatted = formatUptime(uptime);
  
  // Load Average
  const loadAvg = os.loadavg();
  
  // Network
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'N/A';
  for (const name of Object.keys(networkInterfaces)) {
    for (const net of networkInterfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ipAddress = net.address;
        break;
      }
    }
    if (ipAddress !== 'N/A') break;
  }
  
  // Bot stats
  const runningBots = bots.filter(b => b.status === 'running' || b.status === 'connecting').length;
  const stoppedBots = bots.filter(b => b.status === 'stopped').length;
  const errorBots = bots.filter(b => b.status === 'error' || b.status === 'crashed').length;
  
  // Process stats
  const runningProcesses = processes.filter(p => p.running).length;
  
  return {
    os: {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: uptimeFormatted,
      uptimeSeconds: uptime
    },
    cpu: {
      model: cpuModel,
      cores: cpuCount,
      loadAverage: {
        '1min': loadAvg[0].toFixed(2),
        '5min': loadAvg[1].toFixed(2),
        '15min': loadAvg[2].toFixed(2)
      }
    },
    memory: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem),
      usagePercent: memUsagePercent + '%'
    },
    storage: {
      total: formatBytes(storageTotal),
      used: formatBytes(storageUsed),
      free: formatBytes(storageTotal - storageUsed),
      usagePercent: ((storageUsed / storageTotal) * 100).toFixed(1) + '%'
    },
    network: {
      ip: ipAddress
    },
    node: {
      version: process.version,
      env: process.env.NODE_ENV || 'development',
      pid: process.pid,
      cwd: process.cwd()
    },
    bots: {
      total: bots.length,
      running: runningBots,
      stopped: stoppedBots,
      error: errorBots,
      processes: runningProcesses
    }
  };
};

// Get directory size
const getDirectorySize = async (dir) => {
  let size = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        size += await getDirectorySize(filePath);
      } else {
        size += stat.size;
      }
    }
  } catch (e) {
    // Ignore
  }
  return size;
};

// Format uptime
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let parts = [];
  if (days > 0) parts.push(days + 'd');
  if (hours > 0) parts.push(hours + 'h');
  if (minutes > 0) parts.push(minutes + 'm');
  if (secs > 0 || parts.length === 0) parts.push(secs + 's');
  
  return parts.join(' ');
};

// Format bytes
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  getSystemInfo
};
