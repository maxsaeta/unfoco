import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { TimerMode } from '../hooks/useTimer';

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: TimerMode;
}

export function Timer({ minutes, seconds, isRunning, mode }: TimerProps) {
  const formatTime = (min: number, sec: number) => {
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isBreak = mode === 'break';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, isBreak && styles.labelBreak]}>
        {isBreak ? 'DESCANSO' : 'TIEMPO'}
      </Text>
      <Text style={[
        styles.time, 
        isRunning && styles.timeRunning,
        isBreak && styles.timeBreak,
      ]}>
        {formatTime(minutes, seconds)}
      </Text>
      <Text style={styles.hint}>
        {isBreak 
          ? 'Relájate, vuelve cuando estés listo' 
          : isRunning 
            ? 'Enfócate en UNA tarea' 
            : 'Presiona para comenzar'}
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
  labelBreak: {
    color: COLORS.success,
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
  timeBreak: {
    color: COLORS.success,
  },
  hint: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.small,
    marginTop: SPACING.sm,
  },
});