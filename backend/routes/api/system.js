import express from 'express';
import { getSystemInfo } from '../../controllers/systemController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/info', getSystemInfo);

export default router;
