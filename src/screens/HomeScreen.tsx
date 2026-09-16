import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { TaskCard } from '../components/TaskCard';
import { Timer } from '../components/Timer';
import { ActionButton } from '../components/ActionButton';
import { useTimer } from '../hooks/useTimer';

// Ejemplo de tareas (luego vendrá de Firestore)
const DEMO_TASKS = [
  { id: '1', title: 'Organizar el garaje', step: 'Buscar 3 cajas viejas' },
  { id: '2', title: 'Enviar email al cliente', step: 'Abrir borrador existente' },
  { id: '3', title: 'Hacer ejercicio', step: 'Poner música, estirar 2 min' },
];

export function HomeScreen() {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const currentTask = DEMO_TASKS[currentTaskIndex];

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

  const handleCompleteTask = () => {
    if (currentTaskIndex < DEMO_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      timer.reset();
    } else {
      Alert.alert('¡Felicidades!', 'Completaste todas las tareas del día.');
    }
  };

  const handleSkipTask = () => {
    if (currentTaskIndex < DEMO_TASKS.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      timer.reset();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <View style={styles.logoDot} />
          </View>
        </View>

        {/* Timer */}
        <Timer 
          minutes={timer.minutes} 
          seconds={timer.seconds}
          isRunning={timer.isRunning}
        />

        {/* Tarea Actual */}
        <TaskCard 
          title={currentTask.title}
          subtitle={currentTask.step}
        />

        {/* Acciones */}
        <View style={styles.actions}>
          <ActionButton
            title={timer.isRunning ? 'PAUSAR' : 'EMPEZAR'}
            onPress={timer.toggle}
            variant="primary"
          />
          
          <View style={styles.secondaryActions}>
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
          </View>
        </View>

        {/* Contador de tareas */}
        <View style={styles.footer}>
          <View style={styles.taskCounter}>
            {DEMO_TASKS.map((_, index) => (
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
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
  },
  header: {
    alignItems: 'center',
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
  actions: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
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