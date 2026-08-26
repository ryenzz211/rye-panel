import express from 'express';
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser,
  changePassword,
  resetPassword
} from '../../controllers/userController.js';
import { apiAuth } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(apiAuth);

router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/change-password', changePassword);
router.post('/:id/reset-password', resetPassword);

export default router;
