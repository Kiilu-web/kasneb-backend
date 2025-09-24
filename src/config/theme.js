// KASNEB MATERIALS Theme Configuration
export const theme = {
  colors: {
    // Primary Colors
    primary: '#1e3a8a', // Deep Blue
    primaryLight: '#3b82f6', // Blue
    primaryDark: '#1e40af', // Darker Blue
    
    // Secondary Colors
    secondary: '#059669', // Emerald Green
    secondaryLight: '#10b981', // Light Green
    secondaryDark: '#047857', // Dark Green
    
    // Accent Colors
    accent: '#f59e0b', // Amber
    accentLight: '#fbbf24', // Light Amber
    accentDark: '#d97706', // Dark Amber
    
    // Neutral Colors
    white: '#ffffff',
    lightGray: '#f8fafc',
    gray: '#e2e8f0',
    darkGray: '#64748b',
    black: '#0f172a',
    
    // Status Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Background Colors
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    
    // Text Colors
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    textInverse: '#ffffff',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 36,
      fontWeight: '900',
      lineHeight: 44,
    },
    h2: {
      fontSize: 28,
      fontWeight: '800',
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '700',
      lineHeight: 28,
    },
    body: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 26,
    },
    bodySmall: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    caption: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 18,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

export default theme;
