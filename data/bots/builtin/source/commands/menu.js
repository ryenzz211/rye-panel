module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Menampilkan daftar command',
  
  async execute(ctx) {
    const { from, sock } = ctx;
    let text = `🤖 *${process.env.BOT_NAME || 'RyeBot'} Menu*\n\n`;
    text += `📌 Prefix: ${process.env.BOT_PREFIX || '.'}\n\n`;
    text += '📋 *General*\n';
    text += '  .menu - Show menu\n';
    text += '  .ping - Check response\n';
    text += '  .runtime - Bot uptime\n\n';
    text += '🛠️ *Tools*\n';
    text += '  .sticker - Make sticker\n';
    text += '  .tts - Text to speech\n\n';
    text += '👑 *Owner*\n';
    text += '  .eval - Execute code\n';
    text += '  .broadcast - Broadcast message\n';
    await sock.sendMessage(from, { text });
  }
};
