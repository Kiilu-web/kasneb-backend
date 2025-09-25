import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../../config/theme';

const Container = ({ 
  children, 
  style,
  padding = 0,
  margin = 0,
  backgroundColor = 'transparent',
  flex = 0,
  ...props 
}) => {
  return (
    <View 
      style={[
        {
          padding,
          margin,
          backgroundColor: theme.colors[backgroundColor] || backgroundColor,
          flex,
        },
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export default Container;
