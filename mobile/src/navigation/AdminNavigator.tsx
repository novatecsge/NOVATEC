import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminDashboardScreen } from '@/screens/admin/AdminDashboardScreen';
import { ParkingMapScreen } from '@/screens/shared/ParkingMapScreen';
import { AdminReservationsScreen } from '@/screens/admin/AdminReservationsScreen';
import { IncidentsAdminScreen } from '@/screens/admin/IncidentsAdminScreen';
import { ReportsScreen } from '@/screens/admin/ReportsScreen';
import { AdminUsersScreen } from '@/screens/admin/AdminUsersScreen';
import { NotificationsScreen } from '@/screens/shared/NotificationsScreen';
import { LogoutHeaderButton } from '@/components/common/LogoutHeaderButton';
import { getRoleTheme } from '@/theme/roleTheme';
const Tab = createBottomTabNavigator();
const iconByRoute: Record<string, any> = { Dashboard:'analytics', Mapa:'map', Reservas:'calendar', Incidentes:'warning', Usuarios:'people', Avisos:'notifications', Reportes:'document-text' };
const theme = getRoleTheme('ADMIN');
export const AdminNavigator = () => <Tab.Navigator screenOptions={({ route }) => ({ headerShown: true, headerRight: () => <LogoutHeaderButton />, headerTintColor: theme.accent, tabBarActiveTintColor: theme.accent, tabBarInactiveTintColor: '#64748b', tabBarStyle: { borderTopColor: theme.soft }, tabBarIcon: ({ color, size }) => <Ionicons name={iconByRoute[route.name] || 'ellipse'} size={size} color={color} /> })}>
  <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
  <Tab.Screen name="Mapa" component={ParkingMapScreen} />
  <Tab.Screen name="Reservas" component={AdminReservationsScreen} />
  <Tab.Screen name="Incidentes" component={IncidentsAdminScreen} />
  <Tab.Screen name="Usuarios" component={AdminUsersScreen} />
  <Tab.Screen name="Avisos" component={NotificationsScreen} />
  <Tab.Screen name="Reportes" component={ReportsScreen} />
</Tab.Navigator>;
