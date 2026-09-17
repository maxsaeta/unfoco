import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SPACING, FONTS, BORDER_RADIUS } from '../constants/theme';
import { TimerMode } from '../hooks/useTimer';
import { formatDuration } from '../shared/utils';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface TimerProps {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: TimerMode;
}

export function Timer({ minutes, seconds, isRunning, mode }: TimerProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const isBreak = mode === 'break';

  return (
    <View style={styles.container}>
      <View style={[styles.labelContainer, isBreak && styles.labelContainerBreak]}>
        <Text style={[styles.label, isBreak && styles.labelBreak]}>
          {isBreak ? 'DESCANSO' : 'ENFOQUE'}
        </Text>
      </View>
      
      <View style={[styles.timeContainer, isRunning && styles.timeContainerRunning]}>
        <Text 
          style={[
            styles.time, 
            isRunning && styles.timeRunning,
            isBreak && styles.timeBreak,
          ]}
          accessibilityLabel={`Tiempo restante: ${minutes} minutos ${seconds} segundos`}
          accessibilityRole="text"
        >
          {formatDuration(minutes, seconds)}
        </Text>
      </View>

      <View style={styles.hintContainer}>
        <Text style={styles.hint}>
          {isBreak 
            ? 'Relájate, vuelve cuando estés listo' 
            : isRunning 
              ? 'Enfócate en UNA tarea' 
              : 'Presiona para comenzar'}
        </Text>
      </View>

      {isRunning && (
        <View style={styles.pulseContainer}>
          <View style={[styles.pulse, isBreak && styles.pulseBreak]} />
        </View>
      )}
    </View>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  labelContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
  },
  labelContainerBreak: {
    backgroundColor: colors.success,
  },
  label: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.semibold,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  labelBreak: {
    color: colors.textInverse,
  },
  timeContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
  },
  timeContainerRunning: {
    backgroundColor: colors.surfaceLight,
  },
  time: {
    color: colors.textPrimary,
    fontSize: 72,
    fontWeight: FONTS.weight.light,
    fontVariant: ['tabular-nums'],
  },
  timeRunning: {
    color: colors.warning,
  },
  timeBreak: {
    color: colors.success,
  },
  hintContainer: {
    minHeight: 20,
  },
  hint: {
    color: colors.textMuted,
    fontSize: FONTS.size.small,
    textAlign: 'center',
  },
  pulseContainer: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.xl,
  },
  pulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.warning,
  },
  pulseBreak: {
    backgroundColor: colors.success,
  },
});
