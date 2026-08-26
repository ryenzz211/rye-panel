import { updateBot } from './backend/services/botService.js';

const botId = '6198ebea-bb17-4f35-8a42-4e47d46befee';

// Set workspace path yang benar (relatif dari root project)
await updateBot(botId, { 
  workspace_path: 'data/bots/imported/524e378d-9ab4-4540-a3ba-200f3ade07ae'
});

console.log('✅ Workspace path fixed!');
