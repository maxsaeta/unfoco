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
import { useLoginViewModel } from './LoginViewModel';

export function LoginScreen() {
  const { colors } = useTheme();
  const styles = useStyles(colors);
  const { state, setEmail, setPassword, toggleMode, handleSubmit } = useLoginViewModel();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <View style={styles.logoDot} />
            </View>
            <Text style={styles.appName}>UnPaso</Text>
            <Text style={styles.tagline}>Un paso a la vez</Text>
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
              placeholder="Contraseña"
              placeholderTextColor={colors.textMuted}
              value={state.password}
              onChangeText={setPassword}
              secureTextEntry
            />

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
                  {state.isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <Text style={styles.toggleText}>
                {state.isLogin 
                  ? '¿No tienes cuenta? Regístrate' 
                  : '¿Ya tienes cuenta? Inicia sesión'}
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
  logo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  logoDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
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
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: TOUCH_TARGETS.minSize,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: FONTS.size.medium,
  },
});
