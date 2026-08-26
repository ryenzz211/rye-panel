module.exports = {
  name: 'tts',
  aliases: ['texttospeech'],
  category: 'tools',
  description: 'Text to speech',
  permission: 'user',
  
  async execute(ctx) {
    const { from, sock, args } = ctx;
    
    if (args.length === 0) {
      await sock.sendMessage(from, { 
        text: '❌ Masukkan teks!\nContoh: .tts Halo semua' 
      });
      return;
    }
    
    const text = args.join(' ');
    
    // TODO: Implement TTS
    await sock.sendMessage(from, { 
      text: `🔊 TTS: ${text}\n\n(Fitur TTS akan segera hadir)` 
    });
  }
};
