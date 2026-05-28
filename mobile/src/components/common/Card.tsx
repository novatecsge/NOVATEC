import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { colors } from '@/theme/colors';
export const Card = ({ children }: { children: ReactNode }) => <View style={{ backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border }}>{children}</View>;
