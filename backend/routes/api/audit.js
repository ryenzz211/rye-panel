import express from 'express';
import { 
  getAuditLogs, 
  clearAuditLogs, 
  deleteAllLogs, 
  deleteLog 
} from '../../controllers/auditController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/', getAuditLogs);
router.delete('/clear', clearAuditLogs);
router.delete('/all', deleteAllLogs);
router.delete('/:id', deleteLog);

export default router;
