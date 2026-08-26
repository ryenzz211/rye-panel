module.exports = {
  name: 'ping',
  aliases: ['p'],
  category: 'general',
  description: 'Cek respon bot',
  
  async execute(ctx) {
    const { from, sock } = ctx;
    const start = Date.now();
    await sock.sendMessage(from, { text: '🏓 Pinging...' });
    const latency = Date.now() - start;
    await sock.sendMessage(from, { text: `🏓 Pong! ${latency}ms` });
  }
};
