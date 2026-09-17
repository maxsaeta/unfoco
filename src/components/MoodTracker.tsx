import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { MoodLevel, MoodEntry } from '../domain/types';
import { container } from '../di/container';
import { auth } from '../config/firebase';

interface MoodTrackerProps {
  visible: boolean;
  onClose: () => void;
}

const MOOD_OPTIONS: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
  { level: 'great', emoji: '🤩', label: 'Genial', color: '#4ade80' },
  { level: 'good', emoji: '😊', label: 'Bien', color: '#22c55e' },
  { level: 'okay', emoji: '😐', label: 'Regular', color: '#fbbf24' },
  { level: 'low', emoji: '😔', label: 'Bajo', color: '#f97316' },
  { level: 'bad', emoji: '😢', label: 'Mal', color: '#ef4444' },
];

const getTodayKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export function MoodTracker({ visible, onClose }: MoodTrackerProps) {
  const { colors } = useTheme();
  const styles = useStyles(colors);

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      loadMoodData();
    }
  }, [visible]);

  const loadMoodData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    const todayMood = await container.getMoodHistoryUseCase.execute(userId, 1);
    if (todayMood.length > 0 && todayMood[0].date === getTodayKey()) {
      setSelectedMood(todayMood[0].mood);
    } else {
      setSelectedMood(null);
    }

    const historyData = await container.getMoodHistoryUseCase.execute(userId, 7);
    setHistory(historyData);
    setLoading(false);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedMood) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    setLoading(true);
    await container.saveMoodUseCase.execute(userId, {
      date: getTodayKey(),
      mood: selectedMood,
      timestamp: new Date(),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getMoodEmoji = (mood: MoodLevel): string => {
    return MOOD_OPTIONS.find(m => m.level === mood)?.emoji || '😐';
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>💚 ¿Cómo te sientes?</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            No hay días malos, solo días diferentes. Tu cerebro funciona distinto y está bien.
          </Text>

          <View style={styles.moodOptions}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.level}
                style={[
                  styles.moodButton,
                  selectedMood === option.level && styles.moodButtonSelected,
                  selectedMood === option.level && { borderColor: option.color },
                ]}
                onPress={() => setSelectedMood(option.level)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  selectedMood === option.level && { color: option.color },
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedMood && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={16} color={colors.warning} />
              <Text style={styles.tipText}>
                {selectedMood === 'great' || selectedMood === 'good'
                  ? '¡Aprovecha esta energía para LA cosa importante!'
                  : selectedMood === 'okay'
                  ? 'Está bien. Haz lo que puedas y descansa.'
                  : 'Hoy es día de mantenimiento: come, hidrátate, descansa. No fuerces.'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.saveButton,
              selectedMood && styles.saveButtonActive,
              saved && styles.saveButtonSaved,
            ]}
            onPress={handleSave}
            disabled={!selectedMood || loading}
          >
            <Ionicons
              name={saved ? 'checkmark-circle' : 'heart'}
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.saveButtonText}>
              {saved ? 'Guardado!' : loading ? 'Guardando...' : 'Registrar ánimo'}
            </Text>
          </TouchableOpacity>

          {history.length > 1 && (
            <View style={styles.historySection}>
              <Text style={styles.historyTitle}>Últimos días</Text>
              <View style={styles.historyRow}>
                {history.slice(0, 7).reverse().map((entry) => (
                  <View key={entry.date} style={styles.historyItem}>
                    <Text style={styles.historyEmoji}>{getMoodEmoji(entry.mood)}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(entry.date).toLocaleDateString('es-ES', { weekday: 'short' })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    padding: SPACING.lg,
    maxHeight: '85%',
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
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  moodButtonSelected: {
    backgroundColor: colors.surfaceLight,
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: SPACING.xs,
  },
  moodLabel: {
    color: colors.textSecondary,
    fontSize: FONTS.size.xsmall,
    fontWeight: FONTS.weight.medium,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.lg,
  },
  tipText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
    lineHeight: 18,
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
  saveButtonActive: {
    backgroundColor: colors.accent,
  },
  saveButtonSaved: {
    backgroundColor: colors.success,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  historySection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyTitle: {
    color: colors.textMuted,
    fontSize: FONTS.size.xsmall,
    marginBottom: SPACING.sm,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyItem: {
    alignItems: 'center',
    gap: 2,
  },
  historyEmoji: {
    fontSize: 20,
  },
  historyDate: {
    color: colors.textMuted,
    fontSize: 10,
  },
});
