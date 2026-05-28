import React from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
export const Button = ({ title, onPress, loading = false, variant = 'primary' }: { title: string; onPress: () => void; loading?: boolean; variant?: 'primary' | 'danger' | 'outline' }) => {
  const bg = variant === 'danger' ? colors.danger : variant === 'outline' ? 'transparent' : colors.accent;
  const fg = variant === 'outline' ? colors.accent : colors.white;
  return <Pressable onPress={onPress} disabled={loading} style={{ padding: 14, borderRadius: 14, alignItems: 'center', backgroundColor: bg, borderColor: colors.accent, borderWidth: variant === 'outline' ? 1 : 0, opacity: loading ? 0.7 : 1, marginVertical: 6 }}>{loading ? <ActivityIndicator color={fg} /> : <Text style={{ color: fg, fontWeight: '700' }}>{title}</Text>}</Pressable>;
};
