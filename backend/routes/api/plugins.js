import express from 'express';
import { 
  listPlugins, 
  installPlugin, 
  uninstallPlugin, 
  togglePlugin,
  loadPlugins,
  getManifest
} from '../../controllers/pluginController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(apiAuth);
router.use((req, res, next) => {
  if (req.session.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin.'
    });
  }
  next();
});

router.get('/', listPlugins);
router.post('/', installPlugin);
router.delete('/:pluginId', uninstallPlugin);
router.post('/:pluginId/toggle', togglePlugin);
router.post('/load', loadPlugins);
router.get('/:pluginId/manifest', getManifest);

export default router;
