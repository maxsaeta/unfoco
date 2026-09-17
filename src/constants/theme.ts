export const COLORS = {
  // Colores principales - Calma y enfoque
  background: '#1a1a2e',      // Azul oscuro profundo
  surface: '#16213e',          // Azul medio
  surfaceLight: '#1e2a4a',    // Azul claro para hover/press
  primary: '#0f3460',          // Azul fuerte
  accent: '#e94560',           // Rojo coral (urgencia suave)
  
  // Texto
  textPrimary: '#ffffff',      // Blanco puro
  textSecondary: '#a0a0a0',    // Gris suave
  textMuted: '#606060',        // Gris apagado
  textInverse: '#1a1a2e',      // Texto oscuro sobre claro
  
  // Estados
  success: '#4ade80',          // Verde para completar
  successLight: '#22c55e',     // Verde hover
  warning: '#fbbf24',          // Amarillo para tiempo
  warningLight: '#f59e0b',     // Amarillo hover
  error: '#ef4444',            // Rojo para errores
  errorLight: '#dc2626',       // Rojo hover
  info: '#3b82f6',             // Azul informativo
  
  // Bordes y sombras
  border: '#2a3a5c',
  borderLight: '#3a4a6c',
  shadow: 'rgba(0, 0, 0, 0.3)',
  
  // Gradientes
  gradientStart: '#1a1a2e',
  gradientEnd: '#16213e',
  gradientAccent: ['#e94560', '#ff6b6b'],
  gradientSuccess: ['#4ade80', '#22c55e'],
};

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

export const FONTS = {
  regular: 'System',
  bold: 'System',
  size: {
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

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const TOUCH_TARGETS = {
  minSize: 44,
  recommendedSize: 48,
};