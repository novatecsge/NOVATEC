import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserHomeScreen } from '@/screens/user/UserHomeScreen';
import { VehiclesScreen } from '@/screens/user/VehiclesScreen';
import { QrScreen } from '@/screens/user/QrScreen';
import { ParkingMapScreen } from '@/screens/shared/ParkingMapScreen';
import { ReservationsScreen } from '@/screens/user/ReservationsScreen';
import { NotificationsScreen } from '@/screens/shared/NotificationsScreen';
import { IncidentsScreen } from '@/screens/user/IncidentsScreen';
import { ProfileScreen } from '@/screens/user/ProfileScreen';
import { LogoutHeaderButton } from '@/components/common/LogoutHeaderButton';
import { getRoleTheme } from '@/theme/roleTheme';
const Tab = createBottomTabNavigator();
const iconByRoute: Record<string, any> = { Inicio:'home', Vehículos:'car', QR:'qr-code', Mapa:'map', Reservas:'calendar', Incidentes:'warning', Avisos:'notifications', Perfil:'person' };
const theme = getRoleTheme('USER');
export const UserNavigator = () => <Tab.Navigator screenOptions={({ route }) => ({ headerShown: true, headerRight: () => <LogoutHeaderButton />, headerTintColor: theme.accent, tabBarActiveTintColor: theme.accent, tabBarInactiveTintColor: '#64748b', tabBarStyle: { borderTopColor: theme.soft }, tabBarIcon: ({ color, size }) => <Ionicons name={iconByRoute[route.name] || 'ellipse'} size={size} color={color} /> })}>
  <Tab.Screen name="Inicio" component={UserHomeScreen} />
  <Tab.Screen name="Vehículos" component={VehiclesScreen} />
  <Tab.Screen name="QR" component={QrScreen} />
  <Tab.Screen name="Mapa" component={ParkingMapScreen} />
  <Tab.Screen name="Reservas" component={ReservationsScreen} />
  <Tab.Screen name="Incidentes" component={IncidentsScreen} />
  <Tab.Screen name="Avisos" component={NotificationsScreen} />
  <Tab.Screen name="Perfil" component={ProfileScreen} />
</Tab.Navigator>;
