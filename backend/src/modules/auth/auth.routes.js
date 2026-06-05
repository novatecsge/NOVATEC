const express = require('express');
const authController = require('./auth.controller');
const validateRequest = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const loginRateLimitMiddleware = require('../../middlewares/loginRateLimit.middleware');
const {
  registerDto,
  loginDto,
  refreshDto,
  requestPasswordResetDto,
  resetPasswordDto
} = require('./auth.dto');

const router = express.Router();

router.post('/register', registerDto, validateRequest, authController.register);
router.post('/login', loginRateLimitMiddleware, loginDto, validateRequest, authController.login);
router.post('/refresh', refreshDto, validateRequest, authController.refresh);
router.post('/password/forgot', requestPasswordResetDto, validateRequest, authController.requestPasswordReset);
router.post('/password/reset', resetPasswordDto, validateRequest, authController.resetPassword);
router.get('/me', authMiddleware, authController.me);
router.patch('/password', authMiddleware, authController.changePassword);

module.exports = router;