module.exports = {
  name: 'shutdown',
  aliases: ['stop', 'exit'],
  category: 'owner',
  description: 'Matikan bot',
  permission: 'owner',
  
  async execute(ctx) {
    const { from, sock, isOwner } = ctx;
    
    if (!isOwner) {
      await sock.sendMessage(from, { text: '❌ Hanya owner!' });
      return;
    }
    
    await sock.sendMessage(from, { text: '🛑 Shutting down bot...' });
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  }
};
