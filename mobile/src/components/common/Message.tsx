import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme/colors';
export const Message = ({ type = 'info', text }: { type?: 'info' | 'success' | 'error' | 'warning'; text?: string | null }) => {
  if (!text) return null;
  const bg = type === 'error' ? '#fee2e2' : type === 'success' ? '#dcfce7' : type === 'warning' ? '#fef3c7' : colors.accentSoft;
  const fg = type === 'error' ? colors.danger : type === 'success' ? colors.success : type === 'warning' ? '#92400e' : colors.accent;
  return <View style={{ backgroundColor: bg, borderRadius: 12, padding: 12, marginVertical: 8 }}><Text style={{ color: fg, fontWeight: '700' }}>{text}</Text></View>;
};
