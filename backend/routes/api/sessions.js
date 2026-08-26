import express from 'express';
import { getSession, deleteSession, checkSession, updateSession } from '../../controllers/sessionController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/:botId', getSession);
router.get('/:botId/check', checkSession);
router.delete('/:botId', deleteSession);
router.post('/:botId/update', updateSession);

export default router;
