import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';
import theme from '../../config/theme';

const Text = ({ 
  children, 
  variant = 'body',
  color = 'textPrimary',
  style,
  ...props 
}) => {
  const getTextStyle = () => {
    const variantStyle = theme.typography[variant] || theme.typography.body;
    const colorValue = theme.colors[color] || color;
    
    return [
      variantStyle,
      { color: colorValue },
      style
    ];
  };

  return (
    <RNText style={getTextStyle()} {...props}>
      {children}
    </RNText>
  );
};

export default Text;
