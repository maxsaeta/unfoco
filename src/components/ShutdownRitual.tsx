import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { Task, ShutdownChecklist } from '../domain/types';
import { container } from '../di/container';
import { auth } from '../config/firebase';

interface ShutdownRitualProps {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
}

export function ShutdownRitual({ visible, onClose, tasks }: ShutdownRitualProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(colors);

  const CHECKLIST_ITEMS: { key: keyof ShutdownChecklist; label: string; icon: 'pencil' | 'calendar' | 'trash' | 'megaphone'; duration: string }[] = [
    { key: 'tomorrowThing', label: t('shutdown.writeTomorrow'), icon: 'pencil', duration: t('shutdown.timeWrite') },
    { key: 'calendarChecked', label: t('shutdown.checkCalendar'), icon: 'calendar', duration: t('shutdown.timeCheck') },
    { key: 'deskCleared', label: t('shutdown.clearDesk'), icon: 'trash', duration: t('shutdown.timeClear') },
    { key: 'shutdownSaid', label: t('shutdown.sayDone'), icon: 'megaphone', duration: t('shutdown.timeSay') },
  ];

  const [checklist, setChecklist] = useState<ShutdownChecklist>({
    tomorrowThing: '',
    calendarChecked: false,
    deskCleared: false,
    shutdownSaid: false,
  });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  useEffect(() => {
    if (visible) {
      loadChecklist();
    }
  }, [visible]);

  const loadChecklist = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    const existing = await container.getShutdownChecklistUseCase.execute(userId);
    if (existing) {
      setChecklist(existing);
    }
    setLoading(false);
    setCompleted(false);
  };

  const handleSave = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    await container.saveShutdownChecklistUseCase.execute(userId, checklist);
    setLoading(false);
    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      onClose();
    }, 2000);
  };

  const toggleCheck = (key: 'calendarChecked' | 'deskCleared' | 'shutdownSaid') => {
    setChecklist((prev: ShutdownChecklist) => ({ ...prev, [key]: !prev[key] }));
  };

  const selectTask = (task: Task) => {
    setChecklist((prev: ShutdownChecklist) => ({ ...prev, tomorrowThing: task.title }));
    setShowTaskSelector(false);
  };

  const allDone = checklist.tomorrowThing.trim() !== '' &&
    checklist.calendarChecked &&
    checklist.deskCleared &&
    checklist.shutdownSaid;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('shutdown.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {t('shutdown.subtitle')}
          </Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={true}>
            <View style={styles.checklist}>
              {CHECKLIST_ITEMS.map((item) => (
                <View key={item.key} style={styles.checkItem}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      (item.key === 'tomorrowThing'
                        ? checklist.tomorrowThing.trim() !== ''
                        : checklist[item.key as 'calendarChecked' | 'deskCleared' | 'shutdownSaid']) && styles.checkboxCompleted,
                    ]}
                    onPress={() => {
                      if (item.key === 'tomorrowThing') return;
                      toggleCheck(item.key as 'calendarChecked' | 'deskCleared' | 'shutdownSaid');
                    }}
                  >
                    {(item.key === 'tomorrowThing'
                      ? checklist.tomorrowThing.trim() !== ''
                      : checklist[item.key as 'calendarChecked' | 'deskCleared' | 'shutdownSaid']) && (
                      <Ionicons name="checkmark" size={16} color={colors.textPrimary} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.checkContent}>
                    <View style={styles.checkHeader}>
                      <Ionicons name={item.icon} size={16} color={colors.accent} />
                      <Text style={styles.checkLabel}>{item.label}</Text>
                    </View>
                    <Text style={styles.checkDuration}>~{item.duration}</Text>
                    {item.key === 'tomorrowThing' && (
                      <>
                        {checklist.tomorrowThing ? (
                          <View style={styles.selectedTask}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                            <Text style={styles.selectedTaskText}>{checklist.tomorrowThing}</Text>
                            <TouchableOpacity 
                              onPress={() => setChecklist((prev: ShutdownChecklist) => ({ ...prev, tomorrowThing: '' }))}
                              style={styles.removeButton}
                            >
                              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity 
                            style={styles.selectButton}
                            onPress={() => setShowTaskSelector(true)}
                          >
                            <Ionicons name="list-outline" size={16} color={colors.accent} />
                            <Text style={styles.selectButtonText}>{t('shutdown.writeTomorrowPlaceholder')}</Text>
                          </TouchableOpacity>
                        )}
                      </>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.saveButton,
              allDone && styles.saveButtonReady,
              completed && styles.saveButtonCompleted,
            ]}
            onPress={handleSave}
            disabled={loading || completed}
          >
            <Ionicons
              name={completed ? 'checkmark-circle' : allDone ? 'moon' : 'time'}
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.saveButtonText}>
              {completed
                ? t('shutdown.saved')
                : loading
                ? t('common.loading')
                : allDone
                ? t('shutdown.save')
                : t('shutdown.complete')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal selector de tareas */}
      <Modal visible={showTaskSelector} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.selectorContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('shutdown.writeTomorrow')}</Text>
              <TouchableOpacity onPress={() => setShowTaskSelector(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.taskList} showsVerticalScrollIndicator={true}>
              {tasks.length === 0 ? (
                <Text style={styles.noTasks}>No hay tareas pendientes</Text>
              ) : (
                tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskItem}
                    onPress={() => selectTask(task)}
                  >
                    <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                    <Ionicons name="add-circle" size={22} color={colors.accent} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    padding: SPACING.lg,
    maxHeight: '85%',
    minHeight: '50%',
  },
  selectorContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
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
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    flex: 1,
  },
  checklist: {
    gap: SPACING.md,
  },
  checkItem: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkContent: {
    flex: 1,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  checkLabel: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.medium,
  },
  checkDuration: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  selectButtonText: {
    color: colors.textMuted,
    fontSize: FONTS.size.small,
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
  taskList: {
    marginTop: SPACING.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    minHeight: TOUCH_TARGETS.minSize,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.small,
    flex: 1,
    marginRight: SPACING.sm,
  },
  noTasks: {
    color: colors.textMuted,
    fontSize: FONTS.size.small,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  saveButtonReady: {
    backgroundColor: colors.accent,
  },
  saveButtonCompleted: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
});
