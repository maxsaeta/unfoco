import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONTS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface TaskCardProps {
  title: string;
  subtitle?: string;
  isActive?: boolean;
}

export function TaskCard({ title, subtitle, isActive = true }: TaskCardProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <Text style={styles.label}>TU TAREA AHORA</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  cardActive: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});
