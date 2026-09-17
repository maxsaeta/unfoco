import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { useAuth } from './src/hooks/useAuth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/i18n';

function AppContent() {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading) {
    return (
      <SafeAreaProvider>
        <View style={[styles.loading, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <LoginScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <HomeScreen />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
