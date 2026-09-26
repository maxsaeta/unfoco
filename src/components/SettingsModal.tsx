import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { useLanguage, Language } from '../i18n';
import { useSubscription } from '../context/SubscriptionContext';
import { FREE_WORK_MINUTES, FREE_BREAK_MINUTES } from '../constants/business';
import { TimerSettings, getTimerSettings, saveTimerSettings } from '../services/settingsService';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (settings: TimerSettings) => void;
  onRequirePremium: () => void;
}

const WORK_OPTIONS = [15, 20, 25, 30];
const BREAK_OPTIONS = [3, 5, 10];

export function SettingsModal({ visible, onClose, onSave, onRequirePremium }: SettingsModalProps) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const { colors, themeMode, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { isPremium } = useSubscription();
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

  const handleManageSubscription = () => {
    const packageName = Platform.OS === 'android' ? 'com.unfoco.app' : 'com.unfoco.app';
    const url = Platform.OS === 'android'
      ? `market://details?id=${packageName}`
      : 'https://apps.apple.com/account/subscriptions';
    Linking.openURL(url).catch(() => {
      // Fallback for Android if market:// doesn't work
      if (Platform.OS === 'android') {
        Linking.openURL('https://play.google.com/store/account/subscriptions');
      }
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Work Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.workDuration')}</Text>
              <View style={styles.optionsRow}>
                {WORK_OPTIONS.map((minutes) => {
                  const locked = !isPremium && minutes !== FREE_WORK_MINUTES;
                  return (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.option,
                        !locked && workMinutes === minutes && styles.optionActive,
                      ]}
                      onPress={() => {
                        if (locked) {
                          onRequirePremium();
                          return;
                        }
                        setWorkMinutes(minutes);
                      }}
                    >
                      {locked && (
                        <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                      )}
                      <Text style={[
                        styles.optionText,
                        !locked && workMinutes === minutes && styles.optionTextActive,
                      ]}>
                        {minutes} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Break Duration */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.breakDuration')}</Text>
              <View style={styles.optionsRow}>
                {BREAK_OPTIONS.map((minutes) => {
                  const locked = !isPremium && minutes !== FREE_BREAK_MINUTES;
                  return (
                    <TouchableOpacity
                      key={minutes}
                      style={[
                        styles.option,
                        !locked && breakMinutes === minutes && styles.optionActive,
                      ]}
                      onPress={() => {
                        if (locked) {
                          onRequirePremium();
                          return;
                        }
                        setBreakMinutes(minutes);
                      }}
                    >
                      {locked && (
                        <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
                      )}
                      <Text style={[
                        styles.optionText,
                        !locked && breakMinutes === minutes && styles.optionTextActive,
                      ]}>
                        {minutes} min
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.preview}>
              <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.previewText}>
                {t('settings.preview', { work: workMinutes, break: breakMinutes })}
              </Text>
            </View>

            {/* Theme Mode */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
              <View style={styles.optionsRow}>
                {([
                  { mode: 'system' as ThemeMode, label: t('settings.system'), icon: 'phone-portrait-outline' },
                  { mode: 'light' as ThemeMode, label: t('settings.light'), icon: 'sunny-outline' },
                  { mode: 'dark' as ThemeMode, label: t('settings.dark'), icon: 'moon-outline' },
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
                      size={18}
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

            {/* Language */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
              <View style={styles.optionsRow}>
                {([
                  { lang: 'es' as Language, label: t('settings.spanish'), icon: 'globe-outline' },
                  { lang: 'en' as Language, label: t('settings.english'), icon: 'globe-outline' },
                ]).map((option) => (
                  <TouchableOpacity
                    key={option.lang}
                    style={[
                      styles.option,
                      language === option.lang && styles.optionActive,
                    ]}
                    onPress={() => setLanguage(option.lang)}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={18}
                      color={language === option.lang ? colors.textPrimary : colors.textSecondary}
                    />
                    <Text style={[
                      styles.optionText,
                      language === option.lang && styles.optionTextActive,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Subscription Management */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('settings.subscription')}</Text>
              <TouchableOpacity style={styles.subscriptionRow} onPress={handleManageSubscription}>
                <View style={styles.subscriptionIcon}>
                  <Ionicons name="card-outline" size={20} color={colors.accent} />
                </View>
                <View style={styles.subscriptionContent}>
                  <Text style={styles.subscriptionTitle}>{t('settings.manageSubscription')}</Text>
                  <Text style={styles.subscriptionSubtitle}>
                    {isPremium ? t('settings.activePremium') : t('settings.freePlan')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t('common.save')}</Text>
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
    padding: SPACING.md,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.bold,
  },
  closeButton: {
    padding: SPACING.xs,
    minWidth: TOUCH_TARGETS.minSize,
    minHeight: TOUCH_TARGETS.minSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.small,
    fontWeight: FONTS.weight.semibold,
    marginBottom: SPACING.xs,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.transparent,
    minHeight: 40,
  },
  optionActive: {
    borderColor: colors.accent,
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.xs,
    fontWeight: FONTS.weight.medium,
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    backgroundColor: colors.background,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
  },
  previewText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.xs,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minHeight: 44,
  },
  saveButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  subscriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: colors.background,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  subscriptionContent: {
    flex: 1,
  },
  subscriptionTitle: {
    color: colors.textPrimary,
    fontSize: FONTS.size.medium,
    fontWeight: FONTS.weight.semibold,
  },
  subscriptionSubtitle: {
    color: colors.textSecondary,
    fontSize: FONTS.size.xs,
    marginTop: 2,
  },
});
