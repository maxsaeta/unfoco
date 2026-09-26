import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS } from '../constants/theme';
import { Colors } from '../constants/theme';
import { PREMIUM_PRODUCT_ID } from '../constants/business';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { useSubscription } from '../context/SubscriptionContext';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

interface Benefit {
  icon: string;
  label: string;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isPremium, purchase, restore } = useSubscription();
  const [busy, setBusy] = useState<'purchase' | 'restore' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styles = useStyles(colors);

  const benefits: Benefit[] = [
    { icon: 'infinite', label: t('premium.benefits.unlimitedTasks') },
    { icon: 'sparkles', label: t('premium.benefits.aiSteps') },
    { icon: 'stats-chart', label: t('premium.benefits.fullStats') },
    { icon: 'timer', label: t('premium.benefits.customTimer') },
  ];

  const handlePurchase = async () => {
    if (busy) return;
    setBusy('purchase');
    setError(null);
    const ok = await purchase(PREMIUM_PRODUCT_ID);
    setBusy(null);
    if (!ok) {
      setError(t('premium.purchaseError'));
    } else {
      onClose();
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy('restore');
    setError(null);
    const ok = await restore();
    setBusy(null);
    if (!ok) {
      setError(t('premium.restoreError'));
    } else {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('premium.title')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {isPremium ? (
            <View style={styles.premiumState}>
              <Ionicons name="diamond" size={64} color={colors.warning} />
              <Text style={styles.premiumTitle}>{t('premium.alreadyPremium')}</Text>
              <Text style={styles.premiumSubtitle}>{t('premium.alreadyPremiumSubtitle')}</Text>
              <TouchableOpacity style={styles.doneButton} onPress={onClose}>
                <Text style={styles.doneButtonText}>{t('common.done')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.subtitle}>{t('premium.benefitTitle')}</Text>

              <View style={styles.benefitsList}>
                {benefits.map((benefit) => (
                  <View key={benefit.icon} style={styles.benefitItem}>
                    <Ionicons name={benefit.icon as any} size={22} color={colors.accent} />
                    <Text style={styles.benefitLabel}>{benefit.label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.price}>{t('premium.price')}</Text>
                <Text style={styles.period}>{t('premium.period')}</Text>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity
                style={[styles.subscribeButton, busy !== null && styles.buttonDisabled]}
                onPress={handlePurchase}
                disabled={busy !== null}
              >
                {busy === 'purchase' ? (
                  <ActivityIndicator color={colors.textPrimary} size="small" />
                ) : (
                  <Ionicons name="diamond" size={20} color={colors.textPrimary} />
                )}
                <Text style={styles.subscribeButtonText}>{t('premium.subscribe')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={handleRestore}
                disabled={busy !== null}
              >
                {busy === 'restore' ? (
                  <ActivityIndicator color={colors.accent} size="small" />
                ) : (
                  <Text style={styles.restoreButtonText}>{t('premium.restore')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeTextButton} onPress={onClose}>
                <Text style={styles.closeText}>{t('premium.close')}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function useStyles(colors: Colors) {
  return StyleSheet.create({
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
      fontSize: FONTS.size.xlarge,
      fontWeight: FONTS.weight.bold,
    },
    closeButton: {
      padding: SPACING.xs,
      minWidth: TOUCH_TARGETS.minSize,
      minHeight: TOUCH_TARGETS.minSize,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: FONTS.size.medium,
      marginBottom: SPACING.lg,
    },
    benefitsList: {
      gap: SPACING.md,
      marginBottom: SPACING.lg,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.md,
      backgroundColor: colors.background,
      borderRadius: BORDER_RADIUS.md,
      padding: SPACING.md,
    },
    benefitLabel: {
      color: colors.textPrimary,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
      flex: 1,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.md,
    },
    price: {
      color: colors.textPrimary,
      fontSize: FONTS.size.xxlarge,
      fontWeight: FONTS.weight.bold,
    },
    period: {
      color: colors.textSecondary,
      fontSize: FONTS.size.medium,
    },
    error: {
      color: colors.error,
      fontSize: FONTS.size.small,
      textAlign: 'center',
      marginBottom: SPACING.md,
    },
    subscribeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.sm,
      backgroundColor: colors.accent,
      borderRadius: BORDER_RADIUS.full,
      paddingVertical: SPACING.md,
      minHeight: TOUCH_TARGETS.recommendedSize,
    },
    subscribeButtonText: {
      color: colors.textPrimary,
      fontSize: FONTS.size.large,
      fontWeight: FONTS.weight.bold,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    restoreButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: SPACING.md,
      marginTop: SPACING.xs,
      minHeight: TOUCH_TARGETS.minSize,
    },
    restoreButtonText: {
      color: colors.accent,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
    },
    closeTextButton: {
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      minHeight: TOUCH_TARGETS.minSize,
    },
    closeText: {
      color: colors.textSecondary,
      fontSize: FONTS.size.small,
    },
    premiumState: {
      alignItems: 'center',
      gap: SPACING.md,
      paddingVertical: SPACING.xl,
    },
    premiumTitle: {
      color: colors.textPrimary,
      fontSize: FONTS.size.large,
      fontWeight: FONTS.weight.bold,
    },
    premiumSubtitle: {
      color: colors.textSecondary,
      fontSize: FONTS.size.medium,
      textAlign: 'center',
    },
    doneButton: {
      backgroundColor: colors.accent,
      borderRadius: BORDER_RADIUS.full,
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.xl,
      marginTop: SPACING.md,
      minHeight: TOUCH_TARGETS.minSize,
    },
    doneButtonText: {
      color: colors.textPrimary,
      fontSize: FONTS.size.medium,
      fontWeight: FONTS.weight.semibold,
    },
  });
}