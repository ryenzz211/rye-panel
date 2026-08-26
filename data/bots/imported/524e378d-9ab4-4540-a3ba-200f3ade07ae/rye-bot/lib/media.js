const { downloadMediaMessage } = require("@whiskeysockets/baileys");

function getTarget(msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo;
  if (ctx?.quotedMessage) {
    return {
      message: ctx.quotedMessage,
      key: { remoteJid: msg.key.remoteJid, id: ctx.stanzaId, participant: ctx.participant, fromMe: false },
    };
  }
  return msg;
}

async function downloadMedia(sock, target) {
  return downloadMediaMessage(target, "buffer", {}, { reuploadRequest: sock.updateMediaMessage });
}

module.exports = { getTarget, downloadMedia };
