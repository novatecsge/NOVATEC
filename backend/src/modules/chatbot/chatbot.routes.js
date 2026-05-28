const express = require('express');
const { body } = require('express-validator');
const chatbotController = require('./chatbot.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const validateRequest = require('../../middlewares/validate.middleware');

const router = express.Router();

router.use(authMiddleware);
router.post('/ask', [body('message').trim().isLength({ min: 1, max: 500 }).withMessage('Escribe una pregunta de máximo 500 caracteres')], validateRequest, chatbotController.ask);

module.exports = router;
