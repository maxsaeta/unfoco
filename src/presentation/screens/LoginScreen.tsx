import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SPACING, FONTS, BORDER_RADIUS, TOUCH_TARGETS, Colors } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useLoginViewModel } from './LoginViewModel';

export function LoginScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const styles = useStyles(colors);
  const { 
    state, setEmail, setPassword, toggleMode, handleSubmit,
    showForgotPasswordScreen, hideForgotPasswordScreen, handleResetPassword
  } = useLoginViewModel();

  if (state.showForgotPassword) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Ionicons name="lock-closed" size={48} color={colors.primary} />
              <Text style={styles.appName}>{t('forgotPassword.title')}</Text>
              <Text style={styles.tagline}>{t('forgotPassword.subtitle')}</Text>
            </View>

            <View style={styles.form}>
              {state.resetSent ? (
                <View style={styles.successContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success} />
                  <Text style={styles.successText}>{t('forgotPassword.success')}</Text>
                  <TouchableOpacity style={styles.submitButton} onPress={hideForgotPasswordScreen}>
                    <Text style={styles.submitButtonText}>{t('forgotPassword.backToLogin')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    value={state.email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  {state.error && (
                    <Text style={styles.error}>{state.error}</Text>
                  )}

                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleResetPassword}
                    disabled={state.loading}
                  >
                    {state.loading ? (
                      <ActivityIndicator color={colors.textPrimary} />
                    ) : (
                      <Text style={styles.submitButtonText}>{t('forgotPassword.send')}</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.toggleButton} onPress={hideForgotPasswordScreen}>
                <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                <Text style={styles.toggleText}>{t('forgotPassword.backToLogin')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>NeuroPaso</Text>
            <Text style={styles.tagline}>{t('app.tagline')}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={colors.textMuted}
              value={state.email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={styles.input}
              placeholder={t('common.password')}
              placeholderTextColor={colors.textMuted}
              value={state.password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {state.isLogin && (
              <TouchableOpacity style={styles.forgotButton} onPress={showForgotPasswordScreen}>
                <Text style={styles.forgotText}>{t('common.forgotPassword')}</Text>
              </TouchableOpacity>
            )}

            {state.error && (
              <Text style={styles.error}>{state.error}</Text>
            )}

            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={state.loading}
            >
              {state.loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {state.isLogin ? t('common.login') : t('common.register')}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleText}>
                {state.isLogin 
                  ? t('common.noAccount') 
                  : t('common.hasAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = (colors: Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  appName: {
    color: colors.textPrimary,
    fontSize: FONTS.size.xxxlarge,
    fontWeight: FONTS.weight.bold,
    marginBottom: SPACING.sm,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: FONTS.size.large,
    textAlign: 'center',
  },
  form: {
    gap: SPACING.lg,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    minHeight: TOUCH_TARGETS.recommendedSize,
    borderWidth: 1,
    borderColor: colors.border,
  },
  forgotButton: {
    alignItems: 'flex-end',
    paddingVertical: SPACING.xs,
  },
  forgotText: {
    color: colors.primary,
    fontSize: FONTS.size.medium,
  },
  error: {
    color: colors.error,
    fontSize: FONTS.size.medium,
    textAlign: 'center',
    padding: SPACING.sm,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: TOUCH_TARGETS.recommendedSize,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: FONTS.size.large,
    fontWeight: FONTS.weight.semibold,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
  },
  successContainer: {
    alignItems: 'center',
    gap: SPACING.lg,
  },
  successText: {
    color: colors.success,
    fontSize: FONTS.size.large,
    textAlign: 'center',
  },
});
