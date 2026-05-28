import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GuardScannerScreen } from '@/screens/guard/GuardScannerScreen';
import { ParkingMapScreen } from '@/screens/shared/ParkingMapScreen';
import { NotificationsScreen } from '@/screens/shared/NotificationsScreen';
import { LogoutHeaderButton } from '@/components/common/LogoutHeaderButton';
import { getRoleTheme } from '@/theme/roleTheme';
const Tab = createBottomTabNavigator();
const theme = getRoleTheme('GUARD');
export const GuardNavigator = () => <Tab.Navigator screenOptions={({ route }) => ({ headerShown: true, headerRight: () => <LogoutHeaderButton />, headerTintColor: theme.accent, tabBarActiveTintColor: theme.accent, tabBarInactiveTintColor: '#64748b', tabBarStyle: { borderTopColor: theme.soft }, tabBarIcon: ({ color, size }) => <Ionicons name={route.name === 'Escáner' ? 'scan' : route.name === 'Mapa' ? 'map' : 'notifications'} size={size} color={color} /> })}>
  <Tab.Screen name="Escáner" component={GuardScannerScreen} />
  <Tab.Screen name="Mapa" component={ParkingMapScreen} />
  <Tab.Screen name="Avisos" component={NotificationsScreen} />
</Tab.Navigator>;
