import { updateBot } from './backend/services/botService.js';

const botId = '6198ebea-bb17-4f35-8a42-4e47d46befee';

// Update entry file ke path yang benar
await updateBot(botId, { 
  entry_file: 'rye-bot/index.js'
});

console.log('✅ Bot updated! Entry file: rye-bot/index.js');
