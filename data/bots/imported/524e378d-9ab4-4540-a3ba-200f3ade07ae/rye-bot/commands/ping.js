const { frame } = require("../lib/frame");
module.exports = {
  name: "ping",
  description: "Cek bot masih aktif",
  execute: async (sock, msg, args, { from }) => {
    const sentAt = msg.messageTimestamp ? Number(msg.messageTimestamp) * 1000 : Date.now();
    const latency = Date.now() - sentAt;
    const text = frame("🏓 PONG", [`Latency: ${latency}ms`]) + `\n\nby @rynnzx1`;
    await sock.sendMessage(from, { text });
  }
};
