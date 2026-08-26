const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

module.exports = {
  name: "ytmp3",
  description: "Download audio YouTube. Contoh: .ytmp3 <link>",
  execute: async (sock, msg, args, { from }) => {
    const url = args[0];
    if (!url || !url.includes("youtu")) return sock.sendMessage(from, { text: "⚠️ Contoh: .ytmp3 https://youtu.be/xxxxx" });

    await sock.sendMessage(from, { text: "⏳ Mengunduh audio..." });
    const outputPath = path.join(os.tmpdir(), `ytmp3_${Date.now()}.mp3`);
    exec(`yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`, { maxBuffer: 1024*1024*20 }, async (err) => {
      if (err) { console.error("[ytmp3]", err); return sock.sendMessage(from, { text: "❌ Gagal download." }); }
      const buffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { audio: buffer, mimetype: "audio/mp4" });
      fs.unlinkSync(outputPath);
    });
  }
};
