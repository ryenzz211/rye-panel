import { updateBot } from './backend/services/botService.js';

const BOT_ID = 'rye-bot-builtin';
// Ganti dengan nomor owner yang diinginkan
const OWNER_NUMBER = '6285161111396';

console.log('🔧 Updating owner number...');

try {
  await updateBot(BOT_ID, { owner_number: OWNER_NUMBER });
  console.log(`✅ Owner updated to: ${OWNER_NUMBER}`);
} catch (error) {
  console.error('❌ Failed:', error.message);
}
