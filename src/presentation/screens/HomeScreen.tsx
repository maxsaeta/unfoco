import React, { useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../../constants/theme';
import { Timer } from '../../components/Timer';
import { SwipeableTask } from '../../components/SwipeableTask';
import { AddTaskModal } from '../../components/AddTaskModal';
import { EditTaskModal } from '../../components/EditTaskModal';
import { SettingsModal } from '../../components/SettingsModal';
import { StatsModal } from '../../components/StatsModal';
import { PrivacyPolicyModal } from '../../components/PrivacyPolicyModal';
import { DeleteAccountModal } from '../../components/DeleteAccountModal';
import { ReportAIModal } from '../../components/ReportAIModal';
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
    setTaskToEdit,
    handleAddTask,
    handleStartTask,
    handleCompleteStep,
    handleDeleteTask,
    handleSettingsSave,
    handleLogout,
  } = useHomeViewModel();

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoDot} />
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => setShowStatsModal(true)} 
              style={styles.headerButton}
            >
              <Ionicons name="stats-chart" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowSettingsModal(true)} 
              style={styles.headerButton}
            >
              <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setShowHistory(!state.showHistory)} 
              style={styles.headerButton}
            >
              <Ionicons 
                name={state.showHistory ? "list" : "time-outline"} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
              <Ionicons name="log-out-outline" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Vista de Historial */}
        {state.showHistory ? (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Historial de Tareas</Text>
            {completedTasks.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.textMuted} />
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
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
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
                <Ionicons name="clipboard-outline" size={64} color={COLORS.textMuted} />
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
                      color={COLORS.textPrimary} 
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
                      <Ionicons name="play-skip-forward" size={20} color={COLORS.textPrimary} />
                      <Text style={styles.skipBreakText}>Saltar descanso</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={styles.secondaryActions}>
                {/* Botón Completar paso */}
                {currentTask && (
                  <TouchableOpacity style={styles.iconButtonComplete} onPress={handleCompleteStep}>
                    <Ionicons name="checkmark-circle" size={28} color={COLORS.success} />
                  </TouchableOpacity>
                )}

                {/* Botón Agregar */}
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
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
                <Ionicons name="sparkles" size={14} color={COLORS.textMuted} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.accent,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerButton: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  historyTitle: {
    color: COLORS.textPrimary,
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
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
  },
  historyList: {
    gap: SPACING.md,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
    marginBottom: 2,
  },
  historyItemSteps: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  historyItemDuration: {
    color: COLORS.accent,
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semibold,
    marginTop: 4,
  },
  historyItemDates: {
    marginTop: 4,
    gap: 2,
  },
  historyItemDate: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.xsmall,
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  mainButtonPause: {
    backgroundColor: COLORS.warning,
  },
  mainButtonBreak: {
    backgroundColor: COLORS.success,
  },
  mainButtonText: {
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  addButton: {
    width: TOUCH_TARGETS.recommendedSize,
    height: TOUCH_TARGETS.recommendedSize,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.accent,
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
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: TOUCH_TARGETS.minSize,
  },
  skipBreakText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
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
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
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
    color: COLORS.textMuted,
    fontSize: FONTS.size.small,
  },
  footerLinkDanger: {
    color: COLORS.error,
  },
  aiDisclosure: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  aiDisclosureText: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.xsmall,
  },
  reportLink: {
    color: COLORS.accent,
    fontSize: FONTS.size.xsmall,
    textDecorationLine: 'underline',
  },
});
