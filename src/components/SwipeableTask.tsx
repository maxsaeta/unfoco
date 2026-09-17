import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { Task } from '../domain/types';

interface SwipeableTaskProps {
  task: Task;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;

export function SwipeableTask({ task, onSwipeLeft, onSwipeRight, onDelete, onEdit }: SwipeableTaskProps) {
  const [translateX] = useState(new Animated.Value(0));
  const [showMenu, setShowMenu] = useState(false);
  const lastTap = useRef<number>(0);
  const taskRef = useRef(task);
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, onDelete, onEdit });
  
  taskRef.current = task;
  callbacksRef.current = { onSwipeLeft, onSwipeRight, onDelete, onEdit };

  const currentStep = task.steps.find(step => !step.completed) || task.steps[task.steps.length - 1];
  const completedSteps = task.steps.filter(step => step.completed).length;

  const handleDoubleTap = (): boolean => {
    const now = Date.now();
    if (lastTap.current && (now - lastTap.current) < 300) {
      setShowMenu(true);
    }
    lastTap.current = now;
    return false;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            callbacksRef.current.onSwipeLeft();
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            callbacksRef.current.onSwipeRight();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const opacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, SCREEN_WIDTH],
    outputRange: [0.3, 0.8, 1, 0.8, 0.3],
    extrapolate: 'clamp',
  });

  const handleDelete = () => {
    setShowMenu(false);
    Alert.alert(
      'Eliminar tarea',
      `¿Estás seguro de que quieres eliminar "${task.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => callbacksRef.current.onDelete()
        }
      ]
    );
  };

  const handleEdit = () => {
    setShowMenu(false);
    callbacksRef.current.onEdit();
  };

  return (
    <>
      <Animated.View 
        style={[
          styles.container,
          { 
            transform: [{ translateX }],
            opacity 
          }
        ]}
        {...panResponder.panHandlers}
        onStartShouldSetResponder={handleDoubleTap}
      >
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskProgress}>
            Paso {completedSteps + 1} de {task.steps.length}
          </Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepNumber}>{completedSteps + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            {currentStep.description ? (
              <Text style={styles.stepDescription}>{currentStep.description}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.progressBar}>
          {task.steps.map((step, index) => (
            <View 
              key={index}
              style={[
                styles.progressDot,
                step.completed && styles.progressDotCompleted,
                !step.completed && index === completedSteps && styles.progressDotActive,
              ]} 
            />
          ))}
        </View>

        <View style={styles.swipeIndicator}>
          <Ionicons name="chevron-back" size={16} color={COLORS.textMuted} />
          <Text style={styles.swipeText}>Doble clic para opciones</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </View>
      </Animated.View>

      {/* Menú de opciones */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>{task.title}</Text>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
              <Ionicons name="create-outline" size={24} color={COLORS.accent} />
              <Text style={styles.menuItemText}>Modificar tarea</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
              <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>Eliminar tarea</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuCancelButton} 
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  taskHeader: {
    alignItems: 'center',
  },
  taskTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  taskProgress: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  stepIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textMuted,
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
  progressDotActive: {
    backgroundColor: COLORS.accent,
    width: 24,
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  swipeText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.xl,
    width: '80%',
    maxWidth: 300,
  },
  menuTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.md,
  },
  menuItemDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  menuItemText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '500',
  },
  menuItemTextDanger: {
    color: COLORS.error,
  },
  menuCancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  menuCancelText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.medium,
  },
});
