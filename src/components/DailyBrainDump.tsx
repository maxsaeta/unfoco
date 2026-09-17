import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { Task } from '../domain/types';
import { container } from '../di/container';
import { auth } from '../config/firebase';

interface DailyBrainDumpProps {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
}

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const PRIORITY_CONFIG = [
  { slot: 0, emoji: '🎯' },
  { slot: 1, emoji: '✨' },
  { slot: 2, emoji: '🔥' },
];

export function DailyBrainDump({ visible, onClose, tasks }: DailyBrainDumpProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(colors);

  const [selectedIds, setSelectedIds] = useState<[string | null, string | null, string | null]>([null, null, null]);
  const [completed, setCompleted] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const priorityLabels = [
    t('priorities.theThing'),
    t('priorities.wouldBeNice'),
    t('priorities.ifOnFire'),
  ];

  const prioritySubtitles = [
    t('priorities.theThingSubtitle'),
    t('priorities.wouldBeNiceSubtitle'),
    t('priorities.ifOnFireSubtitle'),
  ];

  useEffect(() => {
    if (visible) {
      loadPriorities();
    }
  }, [visible]);

  const loadPriorities = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    const existing = await container.getDailyPrioritiesUseCase.execute(userId, getTodayKey());
    if (existing) {
      setSelectedIds(existing.taskIds);
      setCompleted(existing.completedPriorities);
    } else {
      setSelectedIds([null, null, null]);
      setCompleted([false, false, false]);
    }
    setLoading(false);
    setSaved(false);
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    await container.saveDailyPrioritiesUseCase.execute(userId, {
      date: getTodayKey(),
      taskIds: selectedIds,
      completedPriorities: completed,
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectTaskForSlot = (slot: number, taskId: string) => {
    const newIds: [string | null, string | null, string | null] = [...selectedIds];

    for (let i = 0; i < 3; i++) {
      if (i !== slot && newIds[i] === taskId) {
        newIds[i] = null;
      }
    }

    if (newIds[slot] === taskId) {
      newIds[slot] = null;
    } else {
      newIds[slot] = taskId;
    }

    setSelectedIds(newIds);
  };

  const toggleComplete = (index: number) => {
    const newCompleted = [...completed] as [boolean, boolean, boolean];
    newCompleted[index] = !newCompleted[index];
    setCompleted(newCompleted);
  };

  const getTaskTitle = (taskId: string | null): string => {
    if (!taskId) return '';
    const task = tasks.find(t => t.id === taskId);
    return task?.title || '';
  };

  const isTaskSelected = (taskId: string): number | null => {
    for (let i = 0; i < 3; i++) {
      if (selectedIds[i] === taskId) return i;
    }
    return null;
  };

  const getTasksForSlot = (slot: number): Task[] => {
    return tasks.filter(task => {
      const selectedSlot = isTaskSelected(task.id!);
      return selectedSlot === null || selectedSlot === slot;
    });
  };

  const renderSlot = (slotIndex: number) => {
    const config = PRIORITY_CONFIG[slotIndex];
    const label = priorityLabels[slotIndex];
    const subtitle = prioritySubtitles[slotIndex];
    const availableTasks = getTasksForSlot(slotIndex);
    const selectedTaskId = selectedIds[slotIndex];

    return (
      <View key={slotIndex} style={styles.slotSection}>
        <View style={styles.slotHeader}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              completed[slotIndex] && styles.checkboxCompleted,
            ]}
            onPress={() => toggleComplete(slotIndex)}
          >
            {completed[slotIndex] && (
              <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
          <Text style={styles.slotEmoji}>{config.emoji}</Text>
          <View style={styles.slotTexts}>
            <Text style={styles.slotLabel}>{label}</Text>
            <Text style={styles.slotSubtitle}>{subtitle}</Text>
          </View>
        </View>

        {selectedTaskId ? (
          <View style={styles.selectedTask}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.selectedTaskText}>{getTaskTitle(selectedTaskId)}</Text>
            <TouchableOpacity 
              onPress={() => selectTaskForSlot(slotIndex, selectedTaskId)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.taskListContainer}>
            {availableTasks.length === 0 ? (
              <Text style={styles.noTasks}>No hay tareas disponibles</Text>
            ) : (
              availableTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => selectTaskForSlot(slotIndex, task.id!)}
                >
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <Ionicons name="add-circle" size={22} color={colors.accent} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('priorities.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>{t('priorities.subtitle')}</Text>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            {renderSlot(0)}
            {renderSlot(1)}
            {renderSlot(2)}
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, saved && styles.saveButtonSaved]}
            onPress={handleSave}
            disabled={loading}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'save-outline'}
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.saveButtonText}>
              {saved ? t('priorities.saved') : loading ? t('common.loading') : t('priorities.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xlarge,
    fontWeight: FONTS.weight.bold,
  },
  closeButton: {
    padding: SPACING.sm,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.sm,
  },
  slotSection: {
    marginBottom: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  slotEmoji: {
    fontSize: 20,
  },
  slotTexts: {
    flex: 1,
  },
  slotLabel: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  slotSubtitle: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
  },
  selectedTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  selectedTaskText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.small,
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  taskListContainer: {
    gap: SPACING.xs,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    minHeight: 44,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.small,
    flex: 1,
    marginRight: SPACING.sm,
  },
  noTasks: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.accent,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  saveButtonSaved: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
});
