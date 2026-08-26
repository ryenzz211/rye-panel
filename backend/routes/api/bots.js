import express from 'express';
import { 
  listBots,
  getBuiltin,
  getBot,
  createBot,
  updateBot,
  deleteBot,
  startBot,
  stopBot,
  restartBot
} from '../../controllers/botController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

// CRUD
router.get('/', listBots);
router.get('/builtin', getBuiltin);
router.post('/', createBot);
router.get('/:id', getBot);
router.put('/:id', updateBot);
router.delete('/:id', deleteBot);

// Actions
router.post('/:id/start', startBot);
router.post('/:id/stop', stopBot);
router.post('/:id/restart', restartBot);

export default router;
