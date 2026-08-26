process.on("uncaughtException", (err) => console.error("🛑 Uncaught Exception:", err.message));
process.on("unhandledRejection", (err) => console.error("🛑 Unhandled Rejection:", err?.message || err));

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const path = require("path");

// ============ CONFIG ============
const BOT_NAME = process.env.BOT_NAME || 'RyeBot';
const PREFIX = process.env.BOT_PREFIX || '.';
const BOT_NUMBER = process.env.PHONE_NUMBER || null;

console.log(`🚀 ${BOT_NAME} Starting...`);
console.log(`📁 Prefix: ${PREFIX}`);
console.log(`📱 Bot Phone: ${BOT_NUMBER || 'Not set'}`);

// ============ OWNERS FILE ============
const OWNERS_FILE = path.join(__dirname, 'data/owners.json');

// Pastikan folder data ada
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function loadOwners() {
  try {
    if (fs.existsSync(OWNERS_FILE)) {
      const data = fs.readFileSync(OWNERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[Owners] Failed to load:', e.message);
  }
  return [];
}

function isOwner(jid) {
  if (!jid) return false;
  
  let number = jid.split('@')[0];
  number = number.split(':')[0];
  number = number.trim();
  const senderClean = number.replace(/\D/g, '');
  
  const owners = loadOwners();
  
  // Jika belum ada owner, semua user diizinkan (otomatis owner pertama)
  if (owners.length === 0) {
    console.log(`[Auth] ℹ️ No owners yet - first user will be owner`);
    return true;
  }
  
  // Cek apakah sender ada di daftar owner
  const isMatch = owners.some(o => o.replace(/\D/g, '') === senderClean);
  
  if (isMatch) {
    console.log(`[Auth] ✅ Owner: ${number}`);
  } else {
    console.log(`[Auth] ⛔ Non-owner: ${number}`);
  }
  
  return isMatch;
}

// ============ COMMAND LOADER ============
const commands = new Map();

function loadCommands() {
  const cmdPath = path.join(__dirname, 'commands');
  if (!fs.existsSync(cmdPath)) return;
  
  const categories = fs.readdirSync(cmdPath);
  for (const category of categories) {
    const categoryPath = path.join(cmdPath, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);
      for (const file of files) {
        if (!file.endsWith('.js')) continue;
        try {
          const cmd = require(`./commands/${category}/${file}`);
          if (cmd.name) {
            commands.set(cmd.name, cmd);
            if (cmd.aliases) {
              for (const alias of cmd.aliases) {
                commands.set(alias, cmd);
              }
            }
            console.log(`✅ Loaded: ${cmd.name}`);
          }
        } catch (e) {
          console.error(`❌ Failed: ${file}`, e.message);
        }
      }
    }
  }
}

// ============ MESSAGE HANDLER ============
async function handleMessage(sock, msg) {
  try {
    const from = msg.key?.remoteJid;
    if (!from) return;
    
    const sender = msg.key?.participant || msg.key?.remoteJid;
    if (!sender) return;

    const text = msg.message?.conversation ||
                 msg.message?.extendedTextMessage?.text ||
                 msg.message?.imageMessage?.caption ||
                 "";

    console.log(`[MSG] From: ${sender}, Text: ${text.substring(0,30)}...`);

    if (!text.startsWith(PREFIX)) return;

    // Cek owner
    if (!isOwner(sender)) {
      console.log(`⛔ Non-owner blocked: ${sender}`);
      await sock.sendMessage(from, { text: '❌ Anda bukan owner bot ini.' });
      return;
    }

    const args = text.slice(PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = commands.get(cmdName);
    if (!command) {
      await sock.sendMessage(from, { text: `❌ Command "${cmdName}" tidak ditemukan.` });
      return;
    }

    console.log(`📩 ${cmdName} from ${sender}`);

    try {
      const ctx = {
        from,
        message: msg,
        args,
        sender: sender,
        sock,
        isOwner: true
      };
      await command.execute(ctx);
    } catch (e) {
      console.error(`❌ ${cmdName}:`, e);
      await sock.sendMessage(from, { text: "❌ Terjadi kesalahan." });
    }
  } catch (e) {
    console.error("[handleMessage]", e.message);
  }
}

// ============ START BOT ============
let pairingRequested = false;

async function startBot() {
  console.log('📱 Initializing WhatsApp...');
  
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
        const nomor = BOT_NUMBER;
        if (!nomor) {
          console.log('⚠️ No phone number set!');
          return;
        }
        console.log(`🔑 Requesting pairing code for ${nomor}...`);
        const code = await sock.requestPairingCode(nomor);
        console.log(`\n🔑 ===== PAIRING CODE =====`);
        console.log(`📱 ${code}`);
        console.log(`===========================\n`);
        console.log('📱 Masukkan kode ini di WhatsApp:');
        console.log('   Buka WhatsApp → Perangkat Tertaut → Tautkan dengan Kode');
        console.log(`   Kode: ${code}`);
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
        setTimeout(startBot, 5000);
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

  console.log('🤖 Bot ready!');
  console.log(`📌 Prefix: ${PREFIX}`);
  console.log(`📝 Commands: ${commands.size}`);
}

loadCommands();
startBot();

process.on('SIGINT', () => {
  console.log('🛑 Shutting down...');
  process.exit(0);
});
