import { updateBot } from './backend/services/botService.js';

const BOT_ID = 'rye-bot-builtin';

console.log('🔧 Removing owner restriction...');

try {
  await updateBot(BOT_ID, { owner_number: null });
  console.log('✅ Owner restriction removed! All users can use bot.');
} catch (error) {
  console.error('❌ Failed:', error.message);
}
