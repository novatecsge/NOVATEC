import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '@/theme/colors';
export const Input = ({ label, ...props }: TextInputProps & { label: string }) => <View style={{ marginBottom: 12 }}><Text style={{ fontWeight: '700', marginBottom: 6, color: colors.text }}>{label}</Text><TextInput placeholderTextColor={colors.muted} {...props} style={[{ backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 13, color: colors.text }, props.style]} /></View>;
