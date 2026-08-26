const os = require('os');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'info',
  aliases: ['botinfo'],
  category: 'general',
  description: 'Informasi bot',
  permission: 'user',
  
  async execute(ctx) {
    const { from, sock } = ctx;
    
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8'));
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    let text = `🤖 *${process.env.BOT_NAME || 'RyeBot'} Info*\n\n`;
    text += `📦 *Name:* ${packageJson.name || 'RyeBot'}\n`;
    text += `📌 *Version:* ${packageJson.version || '1.0.0'}\n`;
    text += `📁 *Prefix:* ${process.env.BOT_PREFIX || '.'}\n`;
    text += `⏱️ *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s\n`;
    text += `🖥️ *Platform:* ${os.platform()} ${os.arch()}\n`;
    text += `📱 *Node:* ${process.version}\n`;
    text += `📝 *Commands:* 10+\n`;
    text += `📊 *Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB\n`;
    
    await sock.sendMessage(from, { text });
  }
};
