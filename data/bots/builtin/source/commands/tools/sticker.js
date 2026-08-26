module.exports = {
  name: 'sticker',
  aliases: ['s'],
  category: 'tools',
  description: 'Membuat sticker dari gambar',
  permission: 'user',
  
  async execute(ctx) {
    const { from, sock, message } = ctx;
    
    // Cek apakah ada gambar
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const image = message.message?.imageMessage || quoted?.imageMessage;
    
    if (!image) {
      await sock.sendMessage(from, { 
        text: '❌ Kirim gambar dengan caption .sticker\nAtau reply gambar dengan .sticker' 
      });
      return;
    }
    
    try {
      // Download image
      const stream = await sock.downloadMediaMessage(message);
      // TODO: Convert to sticker
      await sock.sendMessage(from, { 
        text: '🎨 Fitur sticker masih dalam pengembangan.\nMedia received!' 
      });
    } catch (e) {
      await sock.sendMessage(from, { text: '❌ Gagal membuat sticker: ' + e.message });
    }
  }
};
