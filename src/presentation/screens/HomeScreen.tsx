import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../../constants/theme';
import { Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n';
import { Timer } from '../../components/Timer';
import { SwipeableTask } from '../../components/SwipeableTask';
import { AddTaskModal } from '../../components/AddTaskModal';
import { EditTaskModal } from '../../components/EditTaskModal';
import { SettingsModal } from '../../components/SettingsModal';
import { StatsModal } from '../../components/StatsModal';
import { PrivacyPolicyModal } from '../../components/PrivacyPolicyModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { ReportAIModal } from '../../components/ReportAIModal';
import { DailyBrainDump } from '../../components/DailyBrainDump';
import { ShutdownRitual } from '../../components/ShutdownRitual';
import { MoodTracker } from '../../components/MoodTracker';
import { useTimer } from '../../hooks/useTimer';
import { useHomeViewModel } from './HomeViewModel';
import { registerForPushNotifications } from '../../services/notificationService';
import { container } from '../../di/container';
import { auth } from '../../config/firebase';

const isWeb = Platform.OS === 'web';

export function HomeScreen() {
  const {
    state,
    activeTasks,
    completedTasks,
    currentTask,
    setCurrentTaskIndex,
    setShowAddModal,
    setShowEditModal,
    setShowHistory,
    setShowSettingsModal,
    setShowStatsModal,
    setShowPrivacyModal,
    setShowDeleteAccountModal,
    setShowReportAIModal,
    setShowBrainDump,
    setShowShutdownRitual,
    setShowMoodTracker,
    setTaskToEdit,
    handleAddTask,
    handleStartTask,
    handleCompleteStep,
    handleDeleteTask,
    handleSettingsSave,
    handleLogout,
    refreshDailyPriorities,
  } = useHomeViewModel();

  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(colors);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const [showStateSummary, setShowStateSummary] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStateSummary(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const showCelebration = (type: 'step' | 'task') => {
    const message = type === 'task' 
      ? t('celebration.taskComplete') 
      : t('celebration.stepComplete');
    
    setCelebrationMessage(message);
    celebrationOpacity.setValue(0);
    
    Animated.sequence([
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCelebrationMessage(null);
    });
  };

  const handleCompleteStepWithCelebration = async () => {
    const result = await handleCompleteStep();
    if (result) {
      showCelebration(result);
    }
  };

  const timer = useTimer({
    workMinutes: state.timerSettings.workMinutes,
    breakMinutes: state.timerSettings.breakMinutes,
    onWorkComplete: () => {
      const userId = auth.currentUser?.uid;
      if (userId) {
        container.incrementPomodoroUseCase.execute(userId, state.timerSettings.workMinutes);
      }
      Alert.alert(
        '⏰ ¡Pomodoro completado!', 
        `Tómate un descanso de ${state.timerSettings.breakMinutes} minutos. El timer arrancará automáticamente.`,
      );
    },
    onBreakComplete: () => {
      Alert.alert(
        '💪 ¡Descanso terminado!', 
        '¿Listo para otro Pomodoro?',
      );
    },
  });

  React.useEffect(() => {
    registerForPushNotifications();
  }, []);

  const handleSwipeLeft = () => {
    if (state.currentTaskIndex < activeTasks.length - 1) {
      setCurrentTaskIndex(state.currentTaskIndex + 1);
      timer.reset();
    }
  };

  const handleSwipeRight = () => {
    if (state.currentTaskIndex > 0) {
      setCurrentTaskIndex(state.currentTaskIndex - 1);
      timer.reset();
    }
  };

  const handleLongPressStart = (taskId: string, taskTitle: string) => {
    longPressTimerRef.current = setTimeout(() => {
      Alert.alert(
        'Eliminar tarea',
        `¿Estás seguro de que quieres eliminar "${taskTitle}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Eliminar', 
            style: 'destructive',
            onPress: () => handleDeleteTask(taskId)
          }
        ]
      );
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const onEditTask = (task: any) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const onUpdateTask = () => {
    setShowEditModal(false);
    setTaskToEdit(null);
  };

  const formatDuration = (start?: Date, end?: Date): string => {
    if (!start || !end) return '';
    
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    
    if (diffHours > 0) {
      return `${diffHours}h ${remainingMins}min`;
    }
    return `${diffMins} min`;
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (state.loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Saludo según hora del día
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 18) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  // Resumen de progreso
  const getProgressSummary = () => {
    if (activeTasks.length === 0) return null;
    
    const totalSteps = activeTasks.reduce((sum, task) => sum + task.steps.length, 0);
    const completedSteps = activeTasks.reduce((sum, task) => sum + task.steps.filter(s => s.completed).length, 0);
    
    return { totalTasks: activeTasks.length, totalSteps, completedSteps };
  };

  const progressSummary = getProgressSummary();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header fijo fuera del ScrollView */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NeuroPaso</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowMoodTracker(true)} 
            style={styles.headerButton}
          >
            <Ionicons name="heart-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowBrainDump(true)} 
            style={styles.headerButton}
          >
            <Ionicons name="bulb-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowStatsModal(true)} 
            style={styles.headerButton}
          >
            <Ionicons name="stats-chart" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowSettingsModal(true)} 
            style={styles.headerButton}
          >
            <Ionicons name="settings-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowHistory(!state.showHistory)} 
            style={styles.headerButton}
          >
            <Ionicons 
              name={state.showHistory ? "list" : "time-outline"} 
              size={24} 
              color={colors.textPrimary} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="log-out-outline" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Resumen de Estado - Restate State */}
        {showStateSummary && progressSummary && progressSummary.completedSteps > 0 && (
          <View style={styles.stateSummary}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <View style={styles.stateSummaryContent}>
              <Ionicons name="time" size={20} color={colors.info} />
              <Text style={styles.stateSummaryText}>
                {t('stateSummary.inProgress', { 
                  tasks: progressSummary.totalTasks, 
                  steps: progressSummary.completedSteps,
                  total: progressSummary.totalSteps 
                })}
              </Text>
            </View>
          </View>
        )}

        {/* Vista de Historial */}
        {state.showHistory ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Historial de Tareas</Text>
            {completedTasks.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyHistoryText}>No hay tareas completadas aún</Text>
              </View>
            ) : (
              <View style={styles.historyList}>
                {completedTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.historyItem}
                    onLongPress={() => handleLongPressStart(task.id!, task.title)}
                    onPressOut={handleLongPressEnd}
                    delayLongPress={3000}
                  >
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <View style={styles.historyItemContent}>
                      <Text style={styles.historyItemTitle}>{task.title}</Text>
                      <Text style={styles.historyItemSteps}>{task.steps.length} pasos completados</Text>
                      {task.startedAt && task.completedAt && (
                        <Text style={styles.historyItemDuration}>
                          Duración: {formatDuration(task.startedAt, task.completedAt)}
                        </Text>
                      )}
                      <View style={styles.historyItemDates}>
                        {task.startedAt && (
                          <Text style={styles.historyItemDate}>
                            Inicio: {formatDate(task.startedAt)}
                          </Text>
                        )}
                        {task.completedAt && (
                          <Text style={styles.historyItemDate}>
                            Fin: {formatDate(task.completedAt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Timer */}
            <Timer 
              minutes={timer.minutes} 
              seconds={timer.seconds}
              isRunning={timer.isRunning}
              mode={timer.mode}
            />

            {/* Tarea Actual con Swipe */}
            {currentTask ? (
              <SwipeableTask
                task={currentTask}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onDelete={() => handleDeleteTask(currentTask.id!)}
                onEdit={() => onEditTask(currentTask)}
                onPrevious={handleSwipeRight}
                onNext={handleSwipeLeft}
                canGoPrevious={state.currentTaskIndex > 0}
                canGoNext={state.currentTaskIndex < activeTasks.length - 1}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="clipboard-outline" size={64} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>Sin tareas</Text>
                <Text style={styles.emptySubtitle}>Toca + para agregar tu primera tarea</Text>
              </View>
            )}

            {/* Acciones */}
            <View style={styles.actions}>
              {currentTask && (
                <>
                  <TouchableOpacity 
                    style={[
                      styles.mainButton, 
                      timer.isRunning && styles.mainButtonPause,
                      timer.mode === 'break' && styles.mainButtonBreak,
                    ]}
                    onPress={() => {
                      // Mark task as started when user presses play for the first time
                      if (!timer.isRunning && timer.mode === 'work' && !currentTask.startedAt) {
                        handleStartTask(currentTask.id!);
                      }
                      timer.toggle();
                    }}
                  >
                    <Ionicons 
                      name={timer.isRunning ? 'pause' : 'play'} 
                      size={28} 
                      color={colors.textPrimary} 
                    />
                    <Text style={styles.mainButtonText}>
                      {timer.mode === 'break' 
                        ? (timer.isRunning ? 'PAUSAR DESCANSO' : 'INICIAR DESCANSO')
                        : (timer.isRunning ? 'PAUSAR' : 'EMPEZAR')}
                    </Text>
                  </TouchableOpacity>

                  {timer.mode === 'break' && !timer.isRunning && (
                    <TouchableOpacity 
                      style={styles.skipBreakButton}
                      onPress={timer.skipBreak}
                    >
                      <Ionicons name="play-skip-forward" size={20} color={colors.textPrimary} />
                      <Text style={styles.skipBreakText}>Saltar descanso</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.secondaryActions}>
                {/* Botón Completar paso */}
                {currentTask && (
                  <TouchableOpacity style={styles.iconButtonComplete} onPress={handleCompleteStepWithCelebration}>
                    <Ionicons name="checkmark-circle" size={28} color={colors.success} />
                  </TouchableOpacity>
                )}

                {/* Botón Agregar */}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Actions - Brain Dump, Shutdown, Mood */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowBrainDump(true)}
              >
                <Ionicons name="bulb" size={20} color={colors.warning} />
                <Text style={styles.quickActionText}>Prioridades</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowMoodTracker(true)}
              >
                <Ionicons name="heart" size={20} color={colors.error} />
                <Text style={styles.quickActionText}>Ánimo</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.quickAction}
                onPress={() => setShowShutdownRitual(true)}
              >
                <Ionicons name="moon" size={20} color={colors.info} />
                <Text style={styles.quickActionText}>Cerrar Día</Text>
              </TouchableOpacity>
            </View>

            {/* Contador de tareas */}
            <View style={styles.footer}>
              {activeTasks.length > 0 && (
                <View style={styles.taskCounter}>
                  {activeTasks.map((_, index) => (
                    <View 
                      key={index}
                      style={[
                        styles.dot,
                        index === state.currentTaskIndex && styles.dotActive,
                      ]} 
                    />
                  ))}
                </View>
              )}

              {/* Footer Links */}
              <View style={styles.footerLinks}>
                <TouchableOpacity 
                  style={styles.footerLink}
                  onPress={() => setShowPrivacyModal(true)}
                >
                  <Text style={styles.footerLinkText}>Política de Privacidad</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.footerLink}
                  onPress={() => setShowDeleteAccountModal(true)}
                >
                  <Text style={[styles.footerLinkText, styles.footerLinkDanger]}>Eliminar Cuenta</Text>
                </TouchableOpacity>
              </View>

              {/* AI Disclosure */}
              <View style={styles.aiDisclosure}>
                <Ionicons name="sparkles" size={14} color={colors.textMuted} />
                <Text style={styles.aiDisclosureText}>
                  Utiliza IA generativa para crear pasos de tareas
                </Text>
                <TouchableOpacity onPress={() => setShowReportAIModal(true)}>
                  <Text style={styles.reportLink}>Reportar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Celebration Overlay */}
      {celebrationMessage && (
        <Animated.View 
          style={[
            styles.celebrationContainer,
            { opacity: celebrationOpacity }
          ]}
          pointerEvents="none"
        >
          <View style={styles.celebrationContent}>
            <Ionicons 
              name="trophy" 
              size={48} 
              color={colors.warning} 
            />
            <Text style={styles.celebrationText}>{celebrationMessage}</Text>
          </View>
        </Animated.View>
      )}

      {/* Modal Agregar Tarea */}
      <AddTaskModal
        visible={state.showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />

      {/* Modal Modificar Tarea */}
      <EditTaskModal
        visible={state.showEditModal}
        task={state.taskToEdit}
        onClose={() => {
          setShowEditModal(false);
          setTaskToEdit(null);
        }}
        onUpdate={onUpdateTask}
      />

      {/* Modal Configuración */}
      <SettingsModal
        visible={state.showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={handleSettingsSave}
      />

      {/* Modal Estadísticas */}
      <StatsModal
        visible={state.showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />

      {/* Modal Política de Privacidad */}
      <PrivacyPolicyModal
        visible={state.showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Modal Eliminar Cuenta */}
      <DeleteAccountModal
        visible={state.showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
      />

      {/* Modal Reportar IA */}
      <ReportAIModal
        visible={state.showReportAIModal}
        onClose={() => setShowReportAIModal(false)}
      />

      {/* Modal Brain Dump - Prioridades del Día */}
      <DailyBrainDump
        visible={state.showBrainDump}
        onClose={() => {
          setShowBrainDump(false);
          refreshDailyPriorities();
        }}
        tasks={activeTasks}
      />

      {/* Modal Shutdown Ritual - Cerrar el Día */}
      <ShutdownRitual
        visible={state.showShutdownRitual}
        onClose={() => setShowShutdownRitual(false)}
        tasks={activeTasks}
      />

      {/* Modal Mood Tracker - Ánimo */}
      <MoodTracker
        visible={state.showMoodTracker}
        onClose={() => setShowMoodTracker(false)}
      />
    </SafeAreaView>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: SPACING.md,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
    marginBottom: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'center',
  },
  headerButton: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateSummary: {
    backgroundColor: colors.tintedInfo,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  greeting: {
    color: colors.info,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
    marginBottom: SPACING.xs,
  },
  stateSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stateSummaryText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.small,
    flex: 1,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  historyTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
    marginBottom: SPACING.lg,
  },
  emptyHistory: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  emptyHistoryText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
    marginBottom: 2,
  },
  historyItemSteps: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
  },
  historyItemDuration: {
    color: colors.accent,
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semibold,
    marginTop: 4,
  },
  historyItemDates: {
    marginTop: 4,
    gap: 2,
  },
  historyItemDate: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  mainButtonPause: {
    backgroundColor: colors.warning,
  },
  mainButtonBreak: {
    backgroundColor: colors.success,
  },
  mainButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  iconButtonComplete: {
    width: TOUCH_TARGETS.recommendedSize,
    height: TOUCH_TARGETS.recommendedSize,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  addButton: {
    width: TOUCH_TARGETS.recommendedSize,
    height: TOUCH_TARGETS.recommendedSize,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBreakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: TOUCH_TARGETS.minSize,
  },
  skipBreakText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    marginHorizontal: SPACING.lg,
  },
  quickAction: {
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    minWidth: 70,
  },
  quickActionText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.xsmall,
    fontWeight: FONTS.weight.medium,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  taskCounter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: 28,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.md,
  },
  footerLink: {
    paddingVertical: SPACING.sm,
  },
  footerLinkText: {
    color: colors.textMuted,
    fontSize: FONTS.size.small,
  },
  footerLinkDanger: {
    color: colors.error,
  },
  aiDisclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  aiDisclosureText: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
  },
  reportLink: {
    color: colors.accent,
    fontSize: FONTS.size.xsmall,
    textDecorationLine: 'underline',
  },
  celebrationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  celebrationContent: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  celebrationText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
  },
});
