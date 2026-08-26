import express from 'express';
import { 
  listBackups, 
  createBackup, 
  restoreBackup, 
  deleteBackup, 
  downloadBackup 
} from '../../controllers/backupController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/', listBackups);
router.post('/', createBackup);
router.post('/:backupId/restore', restoreBackup);
router.delete('/:backupId', deleteBackup);
router.get('/:backupId/download', downloadBackup);

export default router;
