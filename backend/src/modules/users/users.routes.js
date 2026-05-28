const express = require('express');
const usersController = require('./users.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const validateRequest = require('../../middlewares/validate.middleware');
const { updateProfileDto, updateUserStatusDto } = require('./users.dto');
const ROLES = require('../../shared/constants/roles');

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', usersController.getMyProfile);
router.put('/profile', updateProfileDto, validateRequest, usersController.updateMyProfile);

router.get('/', roleMiddleware(ROLES.ADMIN), usersController.getAllUsers);
router.patch(
  '/:id/status',
  roleMiddleware(ROLES.ADMIN),
  updateUserStatusDto,
  validateRequest,
  usersController.updateUserStatus
);

module.exports = router;