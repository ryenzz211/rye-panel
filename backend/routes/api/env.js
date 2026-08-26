import express from 'express';
import { 
  getEnvVars, 
  setEnvVars, 
  setVar, 
  delVar, 
  importVars, 
  exportVars 
} from '../../controllers/envController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

router.use(apiAuth);

router.get('/:botId', getEnvVars);
router.put('/:botId', setEnvVars);
router.post('/:botId/var', setVar);
router.delete('/:botId/var', delVar);
router.post('/:botId/import', importVars);
router.get('/:botId/export', exportVars);

export default router;
