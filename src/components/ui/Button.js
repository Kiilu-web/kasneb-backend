import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import theme from '../../config/theme';

const Button = ({ 
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  children,
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = theme.buttons[variant] || theme.buttons.primary;
    const sizeStyle = theme.buttons[size] || {};
    
    return [
      baseStyle,
      sizeStyle,
      disabled && styles.disabled,
      style
    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      color: variant === 'primary' ? theme.colors.white : theme.colors.textPrimary,
      ...theme.typography.button,
    };
    
    return [
      baseTextStyle,
      disabled && styles.disabledText,
      textStyle
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary} 
          size="small" 
        />
      ) : (
        children || <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.6,
  },
});

export default Button;
