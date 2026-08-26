const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { smartTranscode } = require("../lib/transcode");

function downloadOne(url, index) {
  return new Promise((resolve, reject) => {
    const rawPath = path.join(os.tmpdir(), `twm_raw_${Date.now()}_${index}.mp4`);
    const finalPath = path.join(os.tmpdir(), `twm_final_${Date.now()}_${index}.mp4`);
    exec(`yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${rawPath}" "${url}"`, { maxBuffer: 1024*1024*50 }, async (err) => {
      if (err) return reject(err);
      try {
        await smartTranscode(rawPath, finalPath);
        resolve(fs.readFileSync(finalPath));
      } catch (e) { reject(e); }
      finally { fs.unlink(rawPath, () => {}); fs.unlink(finalPath, () => {}); }
    });
  });
}

module.exports = {
  name: "twittermass",
  description: "Download beberapa video Twitter/X sekaligus. .twittermass url1 url2 ...",
  execute: async (sock, msg, args, { from }) => {
    const urls = args.filter(a => a.includes("twitter.com") || a.includes("x.com"));
    if (!urls.length) return sock.sendMessage(from, { text: "⚠️ Contoh: .twittermass url1 url2 url3" });

    await sock.sendMessage(from, { text: `⏳ Mengunduh ${urls.length} video...` });
    for (let i = 0; i < urls.length; i++) {
      try {
        const buffer = await downloadOne(urls[i], i);
        await sock.sendMessage(from, { video: buffer });
      } catch (err) {
        console.error(`[twittermass:${i}]`, err);
        await sock.sendMessage(from, { text: `❌ Gagal download link ke-${i + 1}.` });
      }
    }
  }
};
