import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_ID = 'rye-bot-builtin';
const WORKSPACE = './data/bots/builtin';

console.log('📦 Installing RyeBot (Built-in)...');

try {
  // Import database
  const db = await import('../backend/database/index.js');
  const { getBot, createBot } = db;
  
  // Check if already installed
  const existing = await getBot(BOT_ID);
  
  if (existing) {
    console.log('✅ RyeBot already installed!');
    console.log('📝 Bot ID:', existing.id);
    process.exit(0);
  }
  
  // Create bot in database
  const bot = await createBot({
    id: BOT_ID,
    name: 'RyeBot',
    display_name: 'RyeBot',
    type: 'builtin',
    entry_file: 'index.js',
    session_path: './session',
    command_path: './commands',
    event_path: './events',
    config_file: 'config.js',
    prefix: '.',
    phone_number: null,
    pair_mode: 1,
    auto_restart: 1,
    workspace_path: WORKSPACE
  });
  
  console.log('✅ RyeBot installed successfully!');
  console.log('📝 Bot ID:', bot.id);
  console.log('📁 Workspace:', bot.workspace_path);
  console.log('');
  console.log('📌 To start the bot:');
  console.log('  1. Go to http://127.0.0.1:3000/bots');
  console.log('  2. Click "Start" on RyeBot');
  console.log('  3. Enter pairing code in WhatsApp');
  
} catch (error) {
  console.error('❌ Installation failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
