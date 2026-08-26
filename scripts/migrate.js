import { migrate } from '../backend/database/index.js';

console.log('[Migration] Starting database migration...');

try {
  await migrate();
  console.log('[Migration] Database migrated successfully.');
  process.exit(0);
} catch (error) {
  console.error('[Migration] Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
