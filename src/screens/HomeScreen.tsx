import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { TaskCard } from '../components/TaskCard';
import { Timer } from '../components/Timer';
import { ActionButton } from '../components/ActionButton';
import { AddTaskModal } from '../components/AddTaskModal';
import { useTimer } from '../hooks/useTimer';
import { getUserTasks, createTask, completeTask, deleteTask, Task } from '../services/taskService';
import { logout } from '../services/authService';
import { auth } from '../config/firebase';

export function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentTask = tasks[currentTaskIndex] || null;

  const timer = useTimer({
    initialMinutes: 25,
    initialSeconds: 0,
    onComplete: () => {
      Alert.alert(
        '¡Tiempo!', 
        'Tómate un descanso de 5 minutos.',
        [{ text: 'Continuar' }]
      );
    },
  });

  // Cargar tareas de Firebase
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;
      
      const userTasks = await getUserTasks(userId);
      setTasks(userTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (title: string, step: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const newTask: Omit<Task, 'id' | 'createdAt'> = {
        userId,
        title,
        step,
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

  const handleCompleteTask = async () => {
    if (!currentTask) return;

    try {
      await completeTask(currentTask.id!);
      
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex(currentTaskIndex + 1);
        timer.reset();
      } else {
        Alert.alert('¡Felicidades!', 'Completaste todas las tareas del día.');
      }
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleSkipTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      timer.reset();
    }
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
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoDot} />
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Timer */}
        <Timer 
          minutes={timer.minutes} 
          seconds={timer.seconds}
          isRunning={timer.isRunning}
        />

        {/* Tarea Actual */}
        {currentTask ? (
          <TaskCard 
            title={currentTask.title}
            subtitle={currentTask.step}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sin tareas</Text>
            <Text style={styles.emptySubtitle}>Toca + para agregar tu primera tarea</Text>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actions}>
          {currentTask && (
            <ActionButton
              title={timer.isRunning ? 'PAUSAR' : 'EMPEZAR'}
              onPress={timer.toggle}
              variant="primary"
            />
          )}
          
          <View style={styles.secondaryActions}>
            {currentTask && (
              <>
                <ActionButton
                  title="Completada ✓"
                  onPress={handleCompleteTask}
                  variant="secondary"
                />
                <ActionButton
                  title="Saltar →"
                  onPress={handleSkipTask}
                  variant="secondary"
                />
              </>
            )}
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contador de tareas */}
        <View style={styles.footer}>
          {tasks.length > 0 && (
            <View style={styles.taskCounter}>
              {tasks.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    index === currentTaskIndex && styles.dotActive,
                    index < currentTaskIndex && styles.dotCompleted,
                  ]} 
                />
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Modal Agregar Tarea */}
      <AddTaskModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTask}
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
    paddingVertical: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
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
  logoutText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  actions: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.lg,
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
  dotCompleted: {
    backgroundColor: COLORS.success,
  },
});