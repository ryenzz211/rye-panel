const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { smartTranscode } = require("../lib/transcode");

module.exports = {
  name: "ytmp4",
  description: "Download video YouTube. Contoh: .ytmp4 <link>",
  execute: async (sock, msg, args, { from }) => {
    const url = args[0];
    if (!url || !url.includes("youtu")) return sock.sendMessage(from, { text: "⚠️ Contoh: .ytmp4 https://youtu.be/xxxxx" });

    await sock.sendMessage(from, { text: "⏳ Mengunduh video..." });
    const rawPath = path.join(os.tmpdir(), `ytmp4raw_${Date.now()}.mp4`);
    const finalPath = path.join(os.tmpdir(), `ytmp4_${Date.now()}.mp4`);

    exec(`yt-dlp -f "bv*[height<=720]+ba/b[height<=720]" --merge-output-format mp4 -o "${rawPath}" "${url}"`, { maxBuffer: 1024*1024*20 }, async (err) => {
      if (err) { console.error("[ytmp4]", err); return sock.sendMessage(from, { text: "❌ Gagal download." }); }
      try {
        await smartTranscode(rawPath, finalPath);
        const buffer = fs.readFileSync(finalPath);
        await sock.sendMessage(from, { video: buffer });
      } catch (e) {
        console.error("[ytmp4:transcode]", e);
        await sock.sendMessage(from, { text: "❌ Gagal memproses video." });
      } finally {
        fs.unlink(rawPath, () => {});
        fs.unlink(finalPath, () => {});
      }
    });
  }
};
