import { StyleSheet } from 'react-native';
import { colors } from './colors';
export const commonStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginBottom: 16 },
  card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  label: { fontSize: 12, color: colors.muted, fontWeight: '700', textTransform: 'uppercase' },
  value: { fontSize: 16, color: colors.text, fontWeight: '700' },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, color: colors.text },
  primaryButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: colors.white, fontWeight: '800', fontSize: 15 },
  secondaryButton: { backgroundColor: colors.accentSoft, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  secondaryButtonText: { color: colors.accent, fontWeight: '800' }
});
