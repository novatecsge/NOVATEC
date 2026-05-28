import api, { unwrap } from './api';

export const chatbotService = {
  async ask(message) {
    const response = await api.post('/chatbot/ask', { message });
    return unwrap(response);
  }
};
