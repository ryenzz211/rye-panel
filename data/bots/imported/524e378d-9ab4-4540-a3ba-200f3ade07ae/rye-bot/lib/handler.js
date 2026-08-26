const fs = require("fs");
const path = require("path");
const config = require("../config");

function loadCommands() {
  const commands = new Map();
  const dir = path.join(__dirname, "..", "commands");
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js")) continue;
    try {
      const cmd = require(path.join(dir, file));
      if (cmd.name) commands.set(cmd.name, cmd);
    } catch (e) {
      console.error(`[LOAD] Error loading ${file}:`, e.message);
    }
  }
  return commands;
}

const commands = loadCommands();

function isOwner(jid) {
  const number = jid.split("@")[0].split(":")[0];
  return config.OWNER_NUMBERS.includes(number);
}

async function handleMessage(sock, msg) {
  try {
    const from = msg.key?.remoteJid;
    if (!from) return;
    const sender = msg.key?.participant || msg.key?.remoteJid;
    if (!sender) return;

    const text =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption ||
      msg.message?.videoMessage?.caption ||
      "";

    if (!text.startsWith(config.PREFIX)) return;

    const args = text.slice(config.PREFIX.length).trim().split(/\s+/);
    const cmdName = args.shift().toLowerCase();
    const command = commands.get(cmdName);
    if (!command) return;

    const owner = isOwner(sender);
    if (command.ownerOnly && !owner) {
      return sock.sendMessage(from, { text: "🚫 Fitur ini khusus owner." });
    }

    try {
      await command.execute(sock, msg, args, { sender, from, owner, commands });
    } catch (e) {
      console.error(`[CMD:${cmdName}]`, e);
      await sock.sendMessage(from, { text: "❌ Terjadi kesalahan saat menjalankan fitur ini." });
    }
  } catch (e) {
    console.error("[handleMessage]", e.message);
  }
}

module.exports = { handleMessage, commands };
