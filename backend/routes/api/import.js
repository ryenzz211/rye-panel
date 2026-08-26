import express from 'express';
import multer from 'multer';
import { upload, scan, confirm, getStructure } from '../../controllers/importController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

// Multer config - perbesar limit ke 200MB
const storage = multer.memoryStorage();
const uploadMulter = multer({
  storage,
  limits: { 
    fileSize: 200 * 1024 * 1024 // 200MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file ZIP yang diizinkan'));
    }
  }
});

// Routes
router.use(apiAuth);

router.post('/upload', uploadMulter.single('zip'), upload);
router.post('/scan', scan);
router.post('/confirm', confirm);
router.get('/structure/:tempId', getStructure);

export default router;
