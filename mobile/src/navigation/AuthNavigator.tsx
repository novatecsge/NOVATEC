import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@/screens/auth/LoginScreen';
const Stack = createNativeStackNavigator();
export const AuthNavigator = () => <Stack.Navigator><Stack.Screen name="Login" component={LoginScreen} options={{ title: 'SGE CECyT 9' }} /></Stack.Navigator>;
