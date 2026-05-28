import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAuthBootstrap } from './src/hooks/useAuthBootstrap';
import { useSocketBootstrap } from './src/hooks/useSocketBootstrap';
import { FullScreenLoader } from './src/components/common/FullScreenLoader';
import { useAuthStore } from './src/store/auth.store';

export default function App() {
  useAuthBootstrap();
  useSocketBootstrap();
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (isBootstrapping) return <FullScreenLoader label="Iniciando SGE..." />;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}
