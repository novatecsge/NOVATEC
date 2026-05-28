import React from 'react';
import AppRouter from './router/AppRouter';
import { useAuthInit } from './hooks/useAuthInit';
import { useSocketInit } from './hooks/useSocketInit';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

export default function App() {
  useAuthInit();
  useSocketInit();

  return (
    <>
      <AppRouter />
      <ChatbotWidget />
    </>
  );
}