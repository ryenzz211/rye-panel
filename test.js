console.log('[Test] Starting...');

try {
  console.log('[Test] Loading dotenv...');
  await import('dotenv');
  console.log('[Test] Dotenv loaded');
  
  console.log('[Test] Loading database...');
  const db = await import('./backend/database/index.js');
  console.log('[Test] Database loaded');
  
  console.log('[Test] Running migrate...');
  await db.migrate();
  console.log('[Test] Migrate done');
  
  console.log('[Test] Loading app...');
  const app = await import('./backend/app.js');
  console.log('[Test] App loaded');
  
  console.log('[Test] ALL DONE!');
  console.log('[Test] Ready to start: npm start');
} catch (error) {
  console.error('[Test] ERROR:', error.message);
  console.error(error.stack);
}
