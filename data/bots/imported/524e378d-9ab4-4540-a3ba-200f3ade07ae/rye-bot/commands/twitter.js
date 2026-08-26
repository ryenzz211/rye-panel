const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { smartTranscode } = require("../lib/transcode");

module.exports = {
  name: "twitter",
  description: "Download video Twitter/X. Contoh: .twitter <link>",
  execute: async (sock, msg, args, { from }) => {
    const url = args[0];
    if (!url || (!url.includes("twitter.com") && !url.includes("x.com"))) {
      return sock.sendMessage(from, { text: "⚠️ Contoh: .twitter https://x.com/user/status/xxxxx" });
    }

    await sock.sendMessage(from, { text: "⏳ Mengunduh video..." });
    const rawPath = path.join(os.tmpdir(), `tw_raw_${Date.now()}.mp4`);
    const finalPath = path.join(os.tmpdir(), `tw_final_${Date.now()}.mp4`);

    exec(`yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${rawPath}" "${url}"`, { maxBuffer: 1024*1024*50 }, async (err) => {
      if (err) { console.error("[twitter]", err); return sock.sendMessage(from, { text: "❌ Gagal download." }); }
      try {
        await smartTranscode(rawPath, finalPath);
        const buffer = fs.readFileSync(finalPath);
        await sock.sendMessage(from, { video: buffer });
      } catch (e) {
        console.error("[twitter:transcode]", e);
        await sock.sendMessage(from, { text: "❌ Gagal memproses video." });
      } finally {
        fs.unlink(rawPath, () => {});
        fs.unlink(finalPath, () => {});
      }
    });
  }
};
