import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface TaskCardProps {
  title: string;
  subtitle?: string;
  isActive?: boolean;
}

export function TaskCard({ title, subtitle, isActive = true }: TaskCardProps) {
  return (
    <View style={[styles.card, isActive && styles.cardActive]}>
      <Text style={styles.label}>TU TAREA AHORA</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    marginHorizontal: SPACING.md,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  cardActive: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    letterSpacing: 2,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
    marginTop: SPACING.md,
    textAlign: 'center',
  },
});