import React, { useState, useEffect } from 'react';
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
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Timer } from '../components/Timer';
import { SwipeableTask } from '../components/SwipeableTask';
import { AddTaskModal } from '../components/AddTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { useTimer } from '../hooks/useTimer';
import { 
  getUserTasks, 
  subscribeToUserTasks,
  createTask, 
  completeCurrentStep, 
  goToPreviousStep,
  deleteTask,
  Task, 
  TaskStep 
} from '../services/taskService';
import { logout } from '../services/authService';
import { auth } from '../config/firebase';

export function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  // Filtrar tareas activas (no completadas)
  const activeTasks = tasks.filter(task => !task.completed);
  // Filtrar tareas completadas (historial)
  const completedTasks = tasks.filter(task => task.completed);

  const currentTask = activeTasks.length > 0 ? activeTasks[currentTaskIndex] || null : null;

  const timer = useTimer({
    initialMinutes: 25,
    initialSeconds: 0,
    onComplete: () => {
      Alert.alert(
        '⏰ ¡Tiempo!', 
        'Tómate un descanso de 5 minutos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar descanso', onPress: () => {
            Alert.alert('Descanso', 'Descansa 5 minutos y vuelve a comenzar.');
          }}
        ]
      );
    },
  });

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Suscribirse a cambios en tiempo real
    const unsubscribe = subscribeToUserTasks(userId, (updatedTasks) => {
      setTasks(updatedTasks);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => unsubscribe();
  }, []);

  const handleAddTask = async (taskTitle: string, steps: { title: string; description: string }[]) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const taskSteps: TaskStep[] = steps.map((s, index) => ({
        id: Math.random().toString(36).substring(2, 15),
        title: s.title,
        description: s.description,
        completed: false
      }));

      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        userId,
        title: taskTitle,
        steps: taskSteps,
        currentStepIndex: 0,
        completed: false,
        order: tasks.length,
      };

      const taskId = await createTask(newTask);
      
      setTasks([...tasks, { ...newTask, id: taskId, createdAt: { seconds: Date.now() / 1000 } as any }]);
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Error', 'No se pudo agregar la tarea');
    }
  };

  const handleCompleteStep = async () => {
    if (!currentTask) return;

    try {
      const result = await completeCurrentStep(currentTask.id!, currentTask);
      
      // Actualizar estado local
      const updatedTasks = tasks.map(task => {
        if (task.id === currentTask.id) {
          return {
            ...task,
            steps: result.steps,
            currentStepIndex: result.currentStepIndex,
            completed: result.allCompleted
          };
        }
        return task;
      });
      setTasks(updatedTasks);
      timer.reset();

      if (result.allCompleted) {
        Alert.alert('🎉 ¡Felicidades!', `Completaste la tarea: ${currentTask.title}`);
        if (currentTaskIndex >= activeTasks.length - 1) {
          setCurrentTaskIndex(Math.max(0, activeTasks.length - 2));
        }
      }
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const handleSwipeLeft = () => {
    if (currentTaskIndex < activeTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      timer.reset();
    }
  };

  const handleSwipeRight = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
      timer.reset();
    }
  };

  const handleLongPressStart = (taskId: string, taskTitle: string) => {
    const timer = setTimeout(() => {
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
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      const newActiveTasks = updatedTasks.filter(task => !task.completed);
      if (currentTaskIndex >= newActiveTasks.length) {
        setCurrentTaskIndex(Math.max(0, newActiveTasks.length - 1));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Error', 'No se pudo eliminar la tarea');
    }
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    setTasks(updatedTasks);
    setShowEditModal(false);
    setTaskToEdit(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert('Error', 'No se pudo cerrar sesión');
    }
  };

  if (loading) {
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
              onPress={() => setShowHistory(!showHistory)} 
              style={styles.headerButton}
            >
              <Ionicons 
                name={showHistory ? "list" : "time-outline"} 
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
        {showHistory ? (
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
            />

            {/* Tarea Actual con Swipe */}
            {currentTask ? (
              <SwipeableTask
                task={currentTask}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onDelete={() => handleDeleteTask(currentTask.id!)}
                onEdit={() => handleEditTask(currentTask)}
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
                <TouchableOpacity 
                  style={[styles.mainButton, timer.isRunning && styles.mainButtonPause]}
                  onPress={timer.toggle}
                >
                  <Ionicons 
                    name={timer.isRunning ? 'pause' : 'play'} 
                    size={28} 
                    color={COLORS.textPrimary} 
                  />
                  <Text style={styles.mainButtonText}>
                    {timer.isRunning ? 'PAUSAR' : 'EMPEZAR'}
                  </Text>
                </TouchableOpacity>
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
                        index === currentTaskIndex && styles.dotActive,
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
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
      />

      {/* Modal Modificar Tarea */}
      <EditTaskModal
        visible={showEditModal}
        task={taskToEdit}
        onClose={() => {
          setShowEditModal(false);
          setTaskToEdit(null);
        }}
        onUpdate={handleUpdateTask}
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