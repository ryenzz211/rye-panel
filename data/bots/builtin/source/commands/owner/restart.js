module.exports = {
  name: 'restart',
  aliases: ['reboot'],
  category: 'owner',
  description: 'Restart bot',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock, isOwner } = ctx;
    
    if (!isOwner) {
      await sock.sendMessage(from, { text: '❌ Hanya owner!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '🔄 Restarting bot...' });
    
    // Restart process
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
};
