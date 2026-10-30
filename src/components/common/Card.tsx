import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | (ViewStyle | undefined | null | false)[];
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, noPadding = false }) => {
  return (
    <View style={[styles.card, noPadding ? styles.noPadding : styles.padding, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  padding: {
    padding: Spacing.base,
  },
  noPadding: {
    padding: 0,
  },
});
