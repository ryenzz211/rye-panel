module.exports = {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'general',
  description: 'Menampilkan uptime bot',
  
  async execute(ctx) {
    const { from, sock } = ctx;
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    let text = `⏱️ *Runtime*\n${days}d ${hours}h ${minutes}m ${seconds}s`;
    await sock.sendMessage(from, { text });
  }
};
