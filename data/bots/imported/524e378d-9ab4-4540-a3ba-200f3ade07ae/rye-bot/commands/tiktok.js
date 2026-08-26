module.exports = {
  name: "tiktok",
  description: "Download video TikTok. Contoh: .tiktok <link>",
  execute: async (sock, msg, args, { from }) => {
    const url = args[0];
    if (!url || !url.includes("tiktok")) return sock.sendMessage(from, { text: "⚠️ Contoh: .tiktok https://vt.tiktok.com/xxxxx" });

    await sock.sendMessage(from, { text: "⏳ Memproses..." });
    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.code !== 0 || !data.data?.play) return sock.sendMessage(from, { text: "❌ Gagal ambil video." });

      const videoUrl = data.data.play.startsWith("http") ? data.data.play : "https://www.tikwm.com" + data.data.play;
      const videoRes = await fetch(videoUrl, { headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 10) Chrome/120.0 Mobile Safari/537.36", "Referer": "https://www.tikwm.com/" } });
      const buffer = Buffer.from(await videoRes.arrayBuffer());
      await sock.sendMessage(from, { video: buffer, caption: data.data.title || "" });
    } catch (err) {
      console.error("[tiktok]", err);
      await sock.sendMessage(from, { text: "❌ Gagal download." });
    }
  }
};
