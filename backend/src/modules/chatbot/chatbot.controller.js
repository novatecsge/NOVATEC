const { successResponse } = require('../../shared/responses/apiResponse');
const chatbotService = require('./chatbot.service');

const ask = async (req, res, next) => {
  try {
    const result = await chatbotService.answerQuestion({ message: req.body?.message });
    return successResponse(res, 'Respuesta generada correctamente', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { ask };
