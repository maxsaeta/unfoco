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
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme, ThemeMode } from '../context/ThemeContext';
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
  const { colors, themeMode, setThemeMode } = useTheme();
  const styles = useStyles(colors);

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
              <Ionicons name="close" size={24} color={colors.textSecondary} />
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

          {/* Theme Mode */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Apariencia</Text>
            <Text style={styles.sectionSubtitle}>Selecciona el tema de la aplicación</Text>
            <View style={styles.optionsRow}>
              {([
                { mode: 'system' as ThemeMode, label: 'Sistema', icon: 'phone-portrait-outline' },
                { mode: 'light' as ThemeMode, label: 'Claro', icon: 'sunny-outline' },
                { mode: 'dark' as ThemeMode, label: 'Oscuro', icon: 'moon-outline' },
              ]).map((option) => (
                <TouchableOpacity
                  key={option.mode}
                  style={[
                    styles.option,
                    themeMode === option.mode && styles.optionActive,
                  ]}
                  onPress={() => setThemeMode(option.mode)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={themeMode === option.mode ? colors.textPrimary : colors.textSecondary}
                  />
                  <Text style={[
                    styles.optionText,
                    themeMode === option.mode && styles.optionTextActive,
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.preview}>
            <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
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

const useStyles = (colors: Colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
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
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
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
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.transparent,
    minHeight: TOUCH_TARGETS.minSize,
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.medium,
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    backgroundColor: colors.background,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
  },
  previewText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.small,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
});
