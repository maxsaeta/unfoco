import React, { useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { Timer } from '../../components/Timer';
import { SwipeableTask } from '../../components/SwipeableTask';
import { AddTaskModal } from '../../components/AddTaskModal';
import { EditTaskModal } from '../../components/EditTaskModal';
import { SettingsModal } from '../../components/SettingsModal';
import { StatsModal } from '../../components/StatsModal';
import { useTimer } from '../../hooks/useTimer';
import { useHomeViewModel } from './HomeViewModel';
import { registerForPushNotifications } from '../../services/notificationService';
import { container } from '../../di/container';
import { auth } from '../../config/firebase';

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
    setTaskToEdit,
    handleAddTask,
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

  if (state.loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
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
                    onPress={timer.toggle}
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
            </View>
          </>
        )}
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  historyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  historyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
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
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyItemSteps: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  actions: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  mainButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 50,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  mainButtonPause: {
    backgroundColor: COLORS.warning,
  },
  mainButtonBreak: {
    backgroundColor: COLORS.success,
  },
  mainButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
  },
  iconButtonComplete: {
    width: 56,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  addButton: {
    width: 56,
    height: 44,
    borderRadius: 12,
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
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  skipBreakText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  dotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
});
