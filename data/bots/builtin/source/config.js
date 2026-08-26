// Config file for RyeBot
// Values are read from environment variables (set by panel)

export default {
  botName: process.env.BOT_NAME || 'RyeBot',
  prefix: process.env.BOT_PREFIX || '.',
  phoneNumber: process.env.PHONE_NUMBER || null,
  ownerNumber: process.env.OWNER_NUMBER || null,
  sessionPath: './session',
  commandsPath: './commands',
  eventsPath: './events',
  autoRestart: true,
  logLevel: 'info'
};
