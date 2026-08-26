const sharp = require("sharp");

function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrapText(text, maxChars) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

module.exports = {
  name: "iqc",
  description: "Buat gambar simulasi chat WhatsApp. Contoh: .iqc Halo, besok jadi berangkat?",
  execute: async (sock, msg, args, { from }) => {
    const text = args.join(" ");
    if (!text) return sock.sendMessage(from, { text: "⚠️ Contoh: .iqc Halo, besok jadi berangkat?" });

    const lines = wrapText(text, 32).slice(0, 12);
    const lineHeight = 34;
    const bubbleWidth = 460;
    const bubblePadding = 24;
    const bubbleTextHeight = lines.length * lineHeight;
    const bubbleHeight = bubbleTextHeight + 60;
    const canvasWidth = 600;
    const canvasHeight = bubbleHeight + 180;

    const now = new Date();
    const time = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const bubbleY = 90;
    const bubbleX = canvasWidth - bubbleWidth - 30;

    const svg = `
      <svg width="${canvasWidth}" height="${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur"><feGaussianBlur stdDeviation="18"/></filter>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0b141a"/>
            <stop offset="100%" stop-color="#1a2c34"/>
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <circle cx="80" cy="60" r="120" fill="#128c7e" opacity="0.25" filter="url(#blur)"/>
        <circle cx="${canvasWidth - 60}" cy="${canvasHeight - 80}" r="140" fill="#25d366" opacity="0.2" filter="url(#blur)"/>

        <!-- Reaction bar -->
        <rect x="${bubbleX + bubbleWidth - 160}" y="${bubbleY - 46}" width="150" height="40" rx="20" fill="#233138"/>
        <text x="${bubbleX + bubbleWidth - 140}" y="${bubbleY - 20}" font-family="DejaVu Sans, Noto Emoji" font-size="22" fill="white">❤️ 😂 👍 😮 ↩️</text>

        <!-- Bubble -->
        <path d="M ${bubbleX + 16} ${bubbleY}
          h ${bubbleWidth - 32}
          a 16 16 0 0 1 16 16
          v ${bubbleHeight - 32}
          a 16 16 0 0 1 -16 16
          h ${-(bubbleWidth - 48)}
          a 16 16 0 0 1 -16 -16
          v ${-(bubbleHeight - 48)}
          a 16 16 0 0 1 16 -16
          l -18 -12 l 18 4 z"
          fill="#005c4b"/>

        ${lines.map((line, i) => `<text x="${bubbleX + bubblePadding}" y="${bubbleY + 36 + i * lineHeight}" font-family="DejaVu Sans" font-size="27" fill="#e9edef">${escapeXml(line)}</text>`).join("")}

        <text x="${bubbleX + bubbleWidth - 24}" y="${bubbleY + bubbleHeight - 16}" font-family="DejaVu Sans" font-size="18" fill="#a0c9bd" text-anchor="end">${time} <tspan fill="#53bdeb">✓✓</tspan></text>

        <!-- Context menu row (dekoratif, seperti menu long-press) -->
        <g font-family="DejaVu Sans, Noto Emoji" font-size="20" fill="#8696a0">
          <text x="30" y="${canvasHeight - 30}">↩️ Balas   ➡️ Teruskan   📋 Salin   ⭐ Bintang   📌 Sematkan   🗑️ Hapus</text>
        </g>
      </svg>`;

    try {
      const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
      await sock.sendMessage(from, { image: buffer });
    } catch (err) {
      console.error("[iqc]", err);
      await sock.sendMessage(from, { text: "❌ Gagal membuat gambar chat." });
    }
  }
};
