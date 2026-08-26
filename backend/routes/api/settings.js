import express from 'express';
import { getSettings, updateSettings, getSetting } from '../../controllers/settingsController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/', getSettings);
router.put('/', updateSettings);
router.get('/:key', getSetting);

export default router;
