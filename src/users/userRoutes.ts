import express from 'express';
import {
  getMe,
  getUser,
  updateUser,
  getUserGroups,
  getUserPreferences,
  updateMyPreferences,
  getUserByUsername,
} from './userController.js';
import { signup, login, protect, updatePassword, handleRefreshToken } from '../auth/authController.js';
import { logout } from '../auth/authController.js';

const router = express.Router();

router.get('/refresh-token', handleRefreshToken);
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout',logout);

router.use(protect);

router
  .route('/me')
  .get(getMe, getUser)
  .patch(getMe, updateUser)

router.patch('/me/password', getMe, updatePassword);

router.route('/me/groups').get(getMe, getUserGroups);

router
  .route('/me/preferences')
  .get(getMe, getUserPreferences)
  .patch(getMe, updateMyPreferences);

router.route('/username/:username').get(getUserByUsername);

export default router;
