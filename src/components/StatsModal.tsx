import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { getWeeklyStats, getTotalStats, DailyStats } from '../services/statsService';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function StatsModal({ visible, onClose }: StatsModalProps) {
  const [weeklyStats, setWeeklyStats] = useState<DailyStats[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalPomodoros: 0,
    totalTasks: 0,
    totalMinutes: 0,
    streak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    setLoading(true);
    const [weekly, total] = await Promise.all([getWeeklyStats(), getTotalStats()]);
    setWeeklyStats(weekly);
    setTotalStats(total);
    setLoading(false);
  };

  const getMaxPomodoros = () => {
    return Math.max(...weeklyStats.map(s => s.pomodorosCompleted), 1);
  };

  const formatHours = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}min`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}min`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Mis Estadísticas</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Summary Cards */}
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Ionicons name="flame" size={28} color={COLORS.accent} />
                  <Text style={styles.summaryValue}>{totalStats.streak}</Text>
                  <Text style={styles.summaryLabel}>Racha días</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="timer" size={28} color={COLORS.warning} />
                  <Text style={styles.summaryValue}>{totalStats.totalPomodoros}</Text>
                  <Text style={styles.summaryLabel}>Pomodoros</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                  <Text style={styles.summaryValue}>{totalStats.totalTasks}</Text>
                  <Text style={styles.summaryLabel}>Tareas</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="time" size={28} color={COLORS.primary} />
                  <Text style={styles.summaryValue}>{formatHours(totalStats.totalMinutes)}</Text>
                  <Text style={styles.summaryLabel}>Enfoque total</Text>
                </View>
              </View>

              {/* Weekly Chart */}
              <View style={styles.chartSection}>
                <Text style={styles.sectionTitle}>Esta semana</Text>
                <View style={styles.chart}>
                  {weeklyStats.map((day, index) => {
                    const dayDate = new Date(day.date);
                    const dayName = DAY_NAMES[dayDate.getDay()];
                    const barHeight = (day.pomodorosCompleted / getMaxPomodoros()) * 100;
                    const isToday = day.date === new Date().toISOString().split('T')[0];

                    return (
                      <View key={day.date} style={styles.chartColumn}>
                        <Text style={styles.chartValue}>
                          {day.pomodorosCompleted > 0 ? day.pomodorosCompleted : ''}
                        </Text>
                        <View style={styles.chartBarContainer}>
                          <View 
                            style={[
                              styles.chartBar, 
                              { height: `${Math.max(barHeight, 4)}%` },
                              isToday && styles.chartBarToday,
                            ]} 
                          />
                        </View>
                        <Text style={[styles.chartDay, isToday && styles.chartDayToday]}>
                          {dayName}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Today's Detail */}
              <View style={styles.todaySection}>
                <Text style={styles.sectionTitle}>Hoy</Text>
                <View style={styles.todayStats}>
                  <View style={styles.todayRow}>
                    <Ionicons name="timer-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.todayLabel}>Pomodoros completados</Text>
                    <Text style={styles.todayValue}>
                      {weeklyStats[weeklyStats.length - 1]?.pomodorosCompleted || 0}
                    </Text>
                  </View>
                  <View style={styles.todayRow}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.todayLabel}>Tareas completadas</Text>
                    <Text style={styles.todayValue}>
                      {weeklyStats[weeklyStats.length - 1]?.tasksCompleted || 0}
                    </Text>
                  </View>
                  <View style={styles.todayRow}>
                    <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
                    <Text style={styles.todayLabel}>Tiempo enfocado</Text>
                    <Text style={styles.todayValue}>
                      {formatHours(weeklyStats[weeklyStats.length - 1]?.totalFocusMinutes || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  loader: {
    paddingVertical: SPACING.xxl,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  summaryValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  chartSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chartValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  chartBarContainer: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  chartBar: {
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarToday: {
    backgroundColor: COLORS.success,
  },
  chartDay: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  chartDayToday: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  todaySection: {
    marginBottom: SPACING.md,
  },
  todayStats: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  todayLabel: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  todayValue: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
});
