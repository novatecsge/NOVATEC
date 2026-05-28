import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
export const ListState = ({ loading, empty, error }: { loading?: boolean; empty?: boolean; error?: string | null }) => {
  if (loading) return <View style={{ padding: 20 }}><ActivityIndicator color={colors.accent} /></View>;
  if (error) return <Text style={{ color: colors.danger, marginVertical: 10 }}>{error}</Text>;
  if (empty) return <Text style={{ color: colors.muted, marginVertical: 10 }}>No hay información para mostrar.</Text>;
  return null;
};
