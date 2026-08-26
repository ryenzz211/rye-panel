const fs = require("fs");
const path = require("path");
const os = require("os");
const { getTarget, downloadMedia } = require("../lib/media");
const webp = require("node-webpmux");

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
  name: "stickerwm",
  description: "Ganti nama pack stiker. Reply stiker: .stickerwm Nama Pack|Nama Author",
  execute: async (sock, msg, args, { from }) => {
    const target = getTarget(msg);
    if (!target.message?.stickerMessage) {
      return sock.sendMessage(from, { text: "⚠️ Reply stiker dengan caption .stickerwm Nama Pack|Nama Author" });
    }
    const input = args.join(" ").split("|");
    const packName = input[0]?.trim() || "rye-bot";
    const authorName = input[1]?.trim() || "by owner";

    try {
      const buffer = await downloadMedia(sock, target);
      const filePath = path.join(os.tmpdir(), `wm_${Date.now()}.webp`);
      fs.writeFileSync(filePath, buffer);
      await addExif(filePath, packName, authorName);
      const result = fs.readFileSync(filePath);
      await sock.sendMessage(from, { sticker: result });
      fs.unlink(filePath, () => {});
    } catch (err) {
      console.error("[stickerwm]", err);
      await sock.sendMessage(from, { text: "❌ Gagal mengganti nama pack." });
    }
  }
};
