import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONTS } from '../constants/theme';
import { TimerSettings, getTimerSettings, saveTimerSettings } from '../services/settingsService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
}

const WORK_OPTIONS = [15, 20, 25, 30];
const BREAK_OPTIONS = [3, 5, 10];

export function SettingsModal({ visible, onClose, onSave }: SettingsModalProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    const settings = await getTimerSettings();
    setWorkMinutes(settings.workMinutes);
    setBreakMinutes(settings.breakMinutes);
  };

  const handleSave = async () => {
    const settings: TimerSettings = { workMinutes, breakMinutes };
    await saveTimerSettings(settings);
    onSave(settings);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Configurar Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Work Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiempo de trabajo</Text>
            <Text style={styles.sectionSubtitle}>Selecciona cuánto quieres concentrarte</Text>
            <View style={styles.optionsRow}>
              {WORK_OPTIONS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.option,
                    workMinutes === minutes && styles.optionActive,
                  ]}
                  onPress={() => setWorkMinutes(minutes)}
                >
                  <Text style={[
                    styles.optionText,
                    workMinutes === minutes && styles.optionTextActive,
                  ]}>
                    {minutes} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Break Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tiempo de descanso</Text>
            <Text style={styles.sectionSubtitle}>Tiempo para relajarte entre pomodoros</Text>
            <View style={styles.optionsRow}>
              {BREAK_OPTIONS.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.option,
                    breakMinutes === minutes && styles.optionActive,
                  ]}
                  onPress={() => setBreakMinutes(minutes)}
                >
                  <Text style={[
                    styles.optionText,
                    breakMinutes === minutes && styles.optionTextActive,
                  ]}>
                    {minutes} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Ionicons name="time-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.previewText}>
              Ciclo: {workMinutes} min trabajo + {breakMinutes} min descanso
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    marginBottom: SPACING.md,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.textPrimary,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  previewText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.size.small,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: '600',
  },
});
