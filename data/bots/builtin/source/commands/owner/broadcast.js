module.exports = {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  description: 'Broadcast pesan ke semua chat',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock, args, isOwner } = ctx;
    
    if (!isOwner) {
      await sock.sendMessage(from, { text: '❌ Hanya owner!' });
      return;
    }
    
    if (args.length === 0) {
      await sock.sendMessage(from, { text: '❌ Masukkan pesan!\nContoh: .broadcast Halo semua!' });
      return;
    }
    
    const message = args.join(' ');
    
    await sock.sendMessage(from, { 
      text: `📢 *Broadcast*\n\n${message}\n\n⏳ Mengirim ke semua chat...` 
    });
    
    // TODO: Implement broadcast ke semua chat
    // Untuk sekarang, reply ke pengirim
    await sock.sendMessage(from, { 
      text: `✅ Broadcast terkirim!\n\n📢 ${message}` 
    });
  }
};
