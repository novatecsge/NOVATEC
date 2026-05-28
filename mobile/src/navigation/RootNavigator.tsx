import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { UserNavigator } from './UserNavigator';
import { GuardNavigator } from './GuardNavigator';
import { AdminNavigator } from './AdminNavigator';
import { useAuthStore } from '@/store/auth.store';
import { getUserRole } from '@/utils/role';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = getUserRole(user);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? <Stack.Screen name="Auth" component={AuthNavigator} /> : null}
      {isAuthenticated && role === 'ADMIN' ? <Stack.Screen name="Admin" component={AdminNavigator} /> : null}
      {isAuthenticated && role === 'GUARD' ? <Stack.Screen name="Guard" component={GuardNavigator} /> : null}
      {isAuthenticated && role !== 'ADMIN' && role !== 'GUARD' ? <Stack.Screen name="User" component={UserNavigator} /> : null}
    </Stack.Navigator>
  );
};
