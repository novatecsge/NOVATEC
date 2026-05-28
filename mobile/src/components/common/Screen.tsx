import React, { ReactNode } from 'react';
import { SafeAreaView, ScrollView, ViewStyle } from 'react-native';
import { colors } from '@/theme/colors';
export const Screen = ({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: ViewStyle }) => {
  const content = <>{children}</>;
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>{scroll ? <ScrollView contentContainerStyle={[{ padding: 16 }, style]}>{content}</ScrollView> : content}</SafeAreaView>;
};
