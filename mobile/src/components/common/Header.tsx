import React from 'react';
import { Text, View } from 'react-native';
import { colors } from '@/theme/colors';
export const Header = ({ title, subtitle }: { title: string; subtitle?: string }) => <View style={{ marginBottom: 16 }}><Text style={{ fontSize: 26, fontWeight: '900', color: colors.text }}>{title}</Text>{subtitle ? <Text style={{ color: colors.muted, marginTop: 4 }}>{subtitle}</Text> : null}</View>;
