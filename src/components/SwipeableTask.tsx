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
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { Task } from '../domain/types';

interface SwipeableTaskProps {
  task: Task;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 80;
const isWeb = Platform.OS === 'web';

export function SwipeableTask({ 
  task, 
  onSwipeLeft, 
  onSwipeRight, 
  onDelete, 
  onEdit,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false
}: SwipeableTaskProps) {
  const [translateX] = useState(new Animated.Value(0));
  const [showMenu, setShowMenu] = useState(false);
  const lastTap = useRef<number>(0);
  const taskRef = useRef(task);
  const callbacksRef = useRef({ onSwipeLeft, onSwipeRight, onDelete, onEdit });
  
  const { colors } = useTheme();
  const styles = useStyles(colors);

  taskRef.current = task;
  callbacksRef.current = { onSwipeLeft, onSwipeRight, onDelete, onEdit };

  const currentStep = task.steps.find(step => !step.completed) || task.steps[task.steps.length - 1];
  const completedSteps = task.steps.filter(step => step.completed).length;

  const handleWebPointerDown = () => {
    const now = Date.now();
    if (lastTap.current && (now - lastTap.current) < 300) {
      setShowMenu(true);
    }
    lastTap.current = now;
  };

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

  const taskContent = (
    <>
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskProgress}>
          Paso {completedSteps + 1} de {task.steps.length}
        </Text>
      </View>

      <ScrollView style={styles.stepScroll} nestedScrollEnabled={true}>
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
      </ScrollView>

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
        <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        <Text style={styles.swipeText}>Doble clic para opciones</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </>
  );

  return (
    <>
      <View style={styles.containerWithArrows}>
        {/* Left Arrow - Navigation */}
        {isWeb && (
          <TouchableOpacity 
            style={[styles.navArrow, styles.navArrowLeft, !canGoPrevious && styles.navArrowDisabled]}
            onPress={onPrevious}
            disabled={!canGoPrevious}
          >
            <Ionicons 
              name="chevron-back-circle" 
              size={40} 
              color={canGoPrevious ? colors.accent : colors.textMuted} 
            />
          </TouchableOpacity>
        )}

        {/* Task Card */}
        <Animated.View 
          style={[
            styles.taskContainer,
            { 
              transform: [{ translateX }],
              opacity 
            }
          ]}
          {...(!isWeb ? panResponder.panHandlers : {})}
          onStartShouldSetResponder={!isWeb ? handleDoubleTap : undefined}
        >
        {isWeb ? (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={handleWebPointerDown}
          >
            {taskContent}
          </TouchableOpacity>
        ) : (
          taskContent
        )}
        </Animated.View>

        {/* Right Arrow - Navigation */}
        {isWeb && (
          <TouchableOpacity 
            style={[styles.navArrow, styles.navArrowRight, !canGoNext && styles.navArrowDisabled]}
            onPress={onNext}
            disabled={!canGoNext}
          >
            <Ionicons 
              name="chevron-forward-circle" 
              size={40} 
              color={canGoNext ? colors.accent : colors.textMuted} 
            />
          </TouchableOpacity>
        )}
      </View>

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
              <Ionicons name="create-outline" size={24} color={colors.accent} />
              <Text style={styles.menuItemText}>Modificar tarea</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, styles.menuItemDanger]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={colors.error} />
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

const useStyles = (colors: Colors) => StyleSheet.create({
  containerWithArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isWeb ? SPACING.md : SPACING.lg,
  },
  navArrow: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowLeft: {
    marginRight: SPACING.sm,
  },
  navArrowRight: {
    marginLeft: SPACING.sm,
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  taskContainer: {
    flex: 1,
    gap: SPACING.md,
  },
  taskHeader: {
    alignItems: 'center',
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  taskProgress: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
  },
  stepScroll: {
    maxHeight: 200,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
    marginBottom: SPACING.xs,
  },
  stepDescription: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
    lineHeight: 20,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.textMuted,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
  },
  progressDotActive: {
    backgroundColor: colors.accent,
    width: 28,
  },
  swipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  swipeText: {
    color: colors.textMuted,
    fontSize: FONTS.size.xs,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '85%',
    maxWidth: 320,
  },
  menuTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.background,
    marginBottom: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  menuItemDanger: {
    backgroundColor: colors.tintedError,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.medium,
  },
  menuItemTextDanger: {
    color: colors.error,
  },
  menuCancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.minSize,
  },
  menuCancelText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
  },
});
