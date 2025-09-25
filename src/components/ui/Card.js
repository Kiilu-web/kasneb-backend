import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../config/theme';

const Card = ({ 
  children, 
  style, 
  padding = 20, 
  margin = 16, 
  borderRadius = 16,
  shadow = 'md',
  backgroundColor = theme.colors.white,
  ...props 
}) => {
  return (
    <View 
      style={[
        styles.card,
        {
          padding,
          margin,
          borderRadius,
          backgroundColor,
          ...theme.shadows[shadow],
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base card styles are applied via props
  },
});

export default Card;
