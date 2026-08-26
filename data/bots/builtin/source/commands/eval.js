module.exports = {
  name: 'eval',
  aliases: ['e'],
  category: 'owner',
  description: 'Execute JavaScript code',
  
  async execute(ctx) {
    const { from, sock, args } = ctx;
    if (args.length === 0) {
      await sock.sendMessage(from, { text: '❌ Masukkan kode!' });
      return;
    }
    try {
      const code = args.join(' ');
      const result = await eval(code);
      await sock.sendMessage(from, { text: `✅ Result:\n${String(result)}` });
    } catch (error) {
      await sock.sendMessage(from, { text: `❌ Error:\n${error.message}` });
    }
  }
};
