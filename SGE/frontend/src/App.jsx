import React from 'react';
import AppRouter from './router/AppRouter';
import { useAuthInit } from './hooks/useAuthInit';
import { useSocketInit } from './hooks/useSocketInit';

export default function App() {
  useAuthInit();
  useSocketInit();

  return <AppRouter />;
}