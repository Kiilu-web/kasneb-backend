// KASNEB MATERIALS Enhanced Theme Configuration
export const theme = {
  colors: {
    // Primary Colors - Professional Blue
    primary: '#2563eb', // Modern Blue
    primaryLight: '#3b82f6', // Light Blue
    primaryDark: '#1d4ed8', // Dark Blue
    primaryGradient: ['#2563eb', '#1d4ed8'], // Gradient
    
    // Secondary Colors - Success Green
    secondary: '#059669', // Emerald Green
    secondaryLight: '#10b981', // Light Green
    secondaryDark: '#047857', // Dark Green
    
    // Accent Colors - Warm Orange
    accent: '#ea580c', // Orange
    accentLight: '#fb923c', // Light Orange
    accentDark: '#c2410c', // Dark Orange
    
    // Neutral Colors - Modern Grays
    white: '#ffffff',
    lightGray: '#f8fafc',
    gray: '#e2e8f0',
    mediumGray: '#94a3b8',
    darkGray: '#475569',
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
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Text Colors
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textLight: '#94a3b8',
    textInverse: '#ffffff',
    textMuted: '#64748b',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 9999,
  },
  
  typography: {
    // Headers with better font weights and spacing
    h1: {
      fontSize: 32,
      fontWeight: '800',
      lineHeight: 40,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 22,
    },
    
    // Body text with improved readability
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
    
    // UI Text
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500',
      lineHeight: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
    },
    
    // Special text styles
    price: {
      fontSize: 18,
      fontWeight: '700',
      lineHeight: 24,
    },
    priceLarge: {
      fontSize: 24,
      fontWeight: '800',
      lineHeight: 32,
    },
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
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
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  // Container styles for consistent layouts
  containers: {
    screen: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 16,
      marginVertical: 8,
      ...theme.shadows.md,
    },
    section: {
      marginVertical: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  },
  
  // Button styles
  buttons: {
    primary: {
      backgroundColor: '#2563eb',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondary: {
      backgroundColor: '#f1f5f9',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    outline: {
      backgroundColor: 'transparent',
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: '#2563eb',
    },
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
    },
    large: {
      paddingVertical: 20,
      paddingHorizontal: 32,
      borderRadius: 16,
    },
  },
  
  // Input styles
  inputs: {
    default: {
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: '#ffffff',
    },
    focused: {
      borderColor: '#2563eb',
      borderWidth: 2,
    },
    error: {
      borderColor: '#ef4444',
      borderWidth: 2,
    },
  },
};

export default theme;
