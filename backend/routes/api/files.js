import express from 'express';
import multer from 'multer';
import { list, read, write, mkdir, del, rename, upload } from '../../controllers/fileController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

// Multer config for file upload
const storage = multer.memoryStorage();
const uploadMulter = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

router.use(apiAuth);

// File operations
router.get('/:botId', list);
router.get('/:botId/read', read);
router.post('/:botId/write', write);
router.post('/:botId/mkdir', mkdir);
router.delete('/:botId', del);
router.put('/:botId/rename', rename);
router.post('/:botId/upload', uploadMulter.single('file'), upload);

export default router;
