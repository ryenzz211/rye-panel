const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'menu',
  aliases: ['help', 'commands'],
  category: 'general',
  description: 'Menampilkan daftar command',
  permission: 'user',
  
  async execute(ctx) {
    const { from, sock, isOwner } = ctx;
    
    let text = `🤖 *${process.env.BOT_NAME || 'RyeBot'} Menu*\n\n`;
    text += `📌 Prefix: ${process.env.BOT_PREFIX || '.'}\n`;
    text += `👑 Owner: ${isOwner ? '✅ Ya' : '❌ Bukan'}\n\n`;
    
    // General
    text += '📋 *General*\n';
    text += '  .menu - Tampilkan menu\n';
    text += '  .ping - Cek respon bot\n';
    text += '  .runtime - Uptime bot\n';
    text += '  .info - Info bot\n\n';
    
    // Tools
    text += '🛠️ *Tools*\n';
    text += '  .sticker - Buat sticker\n';
    text += '  .toimg - Sticker ke gambar\n';
    text += '  .tts - Text to speech\n';
    text += '  .translate - Translate teks\n\n';
    
    // Downloader
    text += '📥 *Downloader*\n';
    text += '  .ytmp3 - Download audio YouTube\n';
    text += '  .ytmp4 - Download video YouTube\n';
    text += '  .tiktok - Download TikTok\n';
    text += '  .instagram - Download Instagram\n';
    text += '  .twitter - Download Twitter/X\n\n';
    
    // Group
    text += '👥 *Group*\n';
    text += '  .tagall - Tag semua anggota\n';
    text += '  .hidetag - Tag tanpa notif\n';
    text += '  .groupinfo - Info grup\n';
    text += '  .linkgc - Link grup\n\n';
    
    // Owner
    if (isOwner) {
      text += '👑 *Owner*\n';
      text += '  .addowner - Tambah owner\n';
      text += '  .removeowner - Hapus owner\n';
      text += '  .listowner - Daftar owner\n';
      text += '  .eval - Execute code\n';
      text += '  .broadcast - Broadcast pesan\n';
      text += '  .restart - Restart bot\n';
      text += '  .shutdown - Matikan bot\n\n';
    }
    
    text += `📱 *Bot Info*\n`;
    text += `  Prefix: ${process.env.BOT_PREFIX || '.'}\n`;
    text += `  Commands: ${Object.keys(require('fs').readdirSync(require('path').join(__dirname, '../..', 'commands'))).length}\n`;
    
    await sock.sendMessage(from, { text });
  }
};
