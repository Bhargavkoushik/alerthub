import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} from '../controllers/authController.js';
import {
  validateRegistration,
  validateLogin
} from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

// Protected routes (require authentication)
router.use(authenticate); // All routes below this require authentication

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/logout', logout);

export default router;