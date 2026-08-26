const config = require("../config");
const { frame } = require("../lib/frame");

module.exports = {
  name: "menu",
  description: "Daftar fitur bot",
  execute: async (sock, msg, args, { from, sender, commands, owner }) => {
    const list = [];
    for (const cmd of commands.values()) {
      if (cmd.ownerOnly && !owner) continue;
      list.push(`${config.PREFIX}${cmd.name} — ${cmd.description}`);
    }

    let text = `╭─「 ${config.BOT_NAME.toUpperCase()} 」\n│\n`;
    text += `│ 👋 Hai, @${sender.split("@")[0]}!\n`;
    text += `│ ✨ Selamat datang di ${config.BOT_NAME}\n│\n`;
    text += `│ ╭─「 FITUR 」\n`;
    list.forEach(l => { text += `│ │ ${l}\n`; });
    text += `│ ╰──────────────\n`;
    text += `╰─────────────────\n\nby @rynnzx1`;

    await sock.sendMessage(from, { text, mentions: [sender] });
  }
};
