import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/presentation/screens/HomeScreen';
import { LoginScreen } from './src/presentation/screens/LoginScreen';
import { useAuth } from './src/hooks/useAuth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider } from './src/i18n';
import * as Font from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

function AppContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { user, loading } = useAuth();
  const { colors, isDark } = useTheme();

  if (loading || !fontsLoaded) {
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
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        const fontObj = Ionicons.font;
        console.log('Loading font:', JSON.stringify(fontObj));
        await Font.loadAsync(fontObj);
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading failed:', e);
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent fontsLoaded={fontsLoaded} />
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