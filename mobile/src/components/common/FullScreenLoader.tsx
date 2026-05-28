import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
export const FullScreenLoader = ({ label = 'Cargando...' }: { label?: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
    <ActivityIndicator size="large" color={colors.white} />
    <Text style={{ marginTop: 12, color: colors.white }}>{label}</Text>
  </View>
);
