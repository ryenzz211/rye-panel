import { updateBot } from './backend/services/botService.js';

const botId = '6198ebea-bb17-4f35-8a42-4e47d46befee';

// Update nomor WhatsApp di panel
await updateBot(botId, { 
  phone_number: '6285161111396' // Sesuai dengan yang di config.js bot
});

console.log('✅ Nomor WhatsApp updated!');
