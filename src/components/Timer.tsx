import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
}

export function Timer({ minutes, seconds, isRunning }: TimerProps) {
  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TIEMPO</Text>
      <Text style={[styles.time, isRunning && styles.timeRunning]}>
        {formatTime(minutes, seconds)}
      </Text>
      <Text style={styles.hint}>
        {isRunning ? 'Enfócate en UNA tarea' : 'Presiona para comenzar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  time: {
    color: COLORS.textPrimary,
    fontSize: 64,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timeRunning: {
    color: COLORS.warning,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.small,
    marginTop: SPACING.sm,
  },
});