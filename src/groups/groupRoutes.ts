import express from 'express';
import {
  createGroup,
  getGroup,
  joinGroup,
  checkUserInGroup,
  getGroupUsers,
  getGroupByCode,
  removeGroupMembers,
  updateGroupRoles,
  leaveGroup,
} from './groupController.js';
import { protect } from '../auth/authController.js';

const router = express.Router();

router.use(protect);

router.route('/').post(createGroup);
router.get('/code/:code', getGroupByCode);

router.get('/:id', getGroup)

router.patch('/:code/join', joinGroup);

router.patch('/:id/leave', leaveGroup); 
router.get('/:id/isMember', checkUserInGroup);
router.get('/:id/users', getGroupUsers);
router.patch('/:id/users/role', updateGroupRoles); 
router.delete('/:id/users', removeGroupMembers); 

export default router;
