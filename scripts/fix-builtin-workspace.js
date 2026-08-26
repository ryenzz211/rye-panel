import { updateBot } from '../backend/services/botService.js';

const BOT_ID = 'rye-bot-builtin';

console.log('🔧 Fixing built-in bot workspace...');

try {
  await updateBot(BOT_ID, {
    workspace_path: './data/bots/builtin/source',
    entry_file: 'index.js'
  });
  
  console.log('✅ Workspace updated to: ./data/bots/builtin/source');
  console.log('✅ Entry file: index.js');
} catch (error) {
  console.error('❌ Failed:', error.message);
  process.exit(1);
}
