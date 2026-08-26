const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { getTarget, downloadMedia } = require("../lib/media");
const webp = require("node-webpmux");
const config = require("../config");

async function addExif(webpPath, packName, authorName) {
  const img = new webp.Image();
  await img.load(webpPath);
  const json = { "sticker-pack-id": "rye-bot-" + Date.now(), "sticker-pack-name": packName, "sticker-pack-publisher": authorName, "emojis": ["✨"] };
  const exifAttr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), "utf-8");
  exifAttr.writeUIntLE(jsonBuffer.length, 14, 4);
  img.exif = Buffer.concat([exifAttr, jsonBuffer]);
  await img.save(webpPath);
}

module.exports = {
  name: "sticker",
  description: "Ubah gambar/video jadi stiker. Reply atau kirim langsung",
  execute: async (sock, msg, args, { from }) => {
    const target = getTarget(msg);
    const isVideo = !!target.message?.videoMessage;
    const isImage = !!target.message?.imageMessage;
    if (!isVideo && !isImage) {
      return sock.sendMessage(from, { text: "⚠️ Reply gambar/video atau kirim langsung dengan caption .sticker" });
    }

    try {
      const buffer = await downloadMedia(sock, target);
      const inputPath = path.join(os.tmpdir(), `stk_in_${Date.now()}${isVideo ? ".mp4" : ".jpg"}`);
      const outputPath = path.join(os.tmpdir(), `stk_out_${Date.now()}.webp`);
      fs.writeFileSync(inputPath, buffer);

      const cmd = isVideo
        ? `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0" -t 6 -c:v libwebp -loop 0 -an "${outputPath}"`
        : `ffmpeg -y -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0" "${outputPath}"`;

      exec(cmd, async (err) => {
        if (err) { console.error("[sticker]", err); return sock.sendMessage(from, { text: "❌ Gagal membuat stiker." }); }
        await addExif(outputPath, config.STICKER_PACK, config.STICKER_AUTHOR);
        const stickerBuffer = fs.readFileSync(outputPath);
        await sock.sendMessage(from, { sticker: stickerBuffer });
        fs.unlink(inputPath, () => {});
        fs.unlink(outputPath, () => {});
      });
    } catch (err) {
      console.error("[sticker]", err);
      await sock.sendMessage(from, { text: "❌ Gagal memproses media." });
    }
  }
};
