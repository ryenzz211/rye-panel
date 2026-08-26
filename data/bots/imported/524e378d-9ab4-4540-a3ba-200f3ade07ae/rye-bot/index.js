process.on("uncaughtException", (err) => console.error("🛑 Uncaught Exception:", err.message));
process.on("unhandledRejection", (err) => console.error("🛑 Unhandled Rejection:", err?.message || err));

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const { handleMessage } = require("./lib/handler");
const config = require("./config");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));
let pairingRequested = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("session");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Ubuntu", "Chrome", "22.04.4"],
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered && !pairingRequested) {
    pairingRequested = true;
    setTimeout(async () => {
      try {
        const nomor = config.BOT_NUMBER && config.BOT_NUMBER !== "ISI_NOMOR_BOT_DISINI" ? config.BOT_NUMBER : (await question("📱 Masukkan nomor WhatsApp BOT: ")).trim();
        const code = await sock.requestPairingCode(nomor);
        console.log(`\n🔑 Kode pairing: ${code}\n`);
      } catch (err) {
        console.error("❌ Gagal minta pairing code:", err.message);
      }
    }, 3000);
  }

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`❌ Koneksi terputus (${statusCode})`);
      if (statusCode !== DisconnectReason.loggedOut) {
        pairingRequested = false;
        startBot();
      } else {
        console.log("🚪 Logout. Hapus folder session lalu ulangi.");
      }
    } else if (connection === "open") {
      console.log("✅ Bot terhubung!\n");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    await handleMessage(sock, msg);
  });
}

console.log("🚀 Menjalankan rye-bot...\n");
startBot();
