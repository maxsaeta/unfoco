import { darkColors } from './darkColors';
import { lightColors } from './lightColors';

export type Colors = typeof darkColors;

// Re-exportar COLORS como fallback (tema oscuro) para compatibilidad
export const COLORS = darkColors;

export { darkColors, lightColors };

// M3 Spacing Scale (8dp grid)
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// M3 Typography Scale
export const FONTS = {
  regular: 'System',
  bold: 'System',
  size: {
    // M3 Display
    displayLarge: 57,
    displayMedium: 45,
    displaySmall: 36,
    // M3 Headline
    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,
    // M3 Title
    titleLarge: 22,
    titleMedium: 16,
    titleSmall: 14,
    // M3 Body
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,
    // M3 Label
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
    // Legacy (mantener compatibilidad)
    xsmall: 10,
    xs: 12,
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
    xxlarge: 32,
    xxxlarge: 48,
  },
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// M3 Shape Scale
export const BORDER_RADIUS = {
  none: 0,
  extraSmall: 4,   // Chips, small elements
  small: 8,        // Cards, buttons
  medium: 12,      // Dialogs, sheets
  large: 16,       // Bottom sheets
  extraLarge: 28,  // FABs, modals
  full: 9999,      // Pills
  // Legacy
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
};

// M3 Elevation (tonal, no shadows)
export const ELEVATION = {
  level0: 'transparent',
  level1: 'rgba(0, 0, 0, 0.05)',   // surfaceContainerLowest
  level2: 'rgba(0, 0, 0, 0.08)',   // surfaceContainerLow
  level3: 'rgba(0, 0, 0, 0.11)',   // surfaceContainer
  level4: 'rgba(0, 0, 0, 0.12)',   // surfaceContainerHigh
  level5: 'rgba(0, 0, 0, 0.14)',   // surfaceContainerHighest
};

// Legacy shadows (for compatibility)
export const SHADOWS = {
  sm: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};

// M3 Touch Targets (≥48dp)
export const TOUCH_TARGETS = {
  minSize: 44,      // Android minimum
  recommendedSize: 48,  // M3 recommended
};

// M3 Duration Tokens
export const DURATION = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
  extraLong1: 700,
  extraLong2: 800,
  extraLong3: 900,
  extraLong4: 1000,
};

// M3 Easing Tokens
export const EASING = {
  emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  standardDecelerate: 'cubic-bezier(0, 0, 0, 1)',
  standardAccelerate: 'cubic-bezier(0.3, 0, 1, 1)',
};
