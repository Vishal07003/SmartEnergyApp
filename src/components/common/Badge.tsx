import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, BorderRadius } from '../../constants/theme';
import { OccupancyState } from '../../types';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info', style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, textStyles[variant]]}>{label}</Text>
    </View>
  );
};

export const OccupancyBadge: React.FC<{ state: OccupancyState; style?: ViewStyle }> = ({ state, style }) => {
  const getBadgeConfig = () => {
    switch (state) {
      case 'ACTIVE':
        return { label: 'Active', variant: 'success' as BadgeVariant };
      case 'IDLE_TRANSITION':
        return { label: 'Idle Transition', variant: 'warning' as BadgeVariant };
      case 'EMPTY':
      default:
        return { label: 'Empty', variant: 'neutral' as BadgeVariant };
    }
  };

  const { label, variant } = getBadgeConfig();
  return <Badge label={label} variant={variant} style={style} />;
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  success: {
    backgroundColor: Colors.successLight,
  },
  warning: {
    backgroundColor: Colors.warningLight,
  },
  danger: {
    backgroundColor: Colors.dangerLight,
  },
  info: {
    backgroundColor: Colors.infoLight,
  },
  neutral: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

const textStyles = StyleSheet.create<{ [key in BadgeVariant]: TextStyle }>({
  success: {
    color: Colors.success,
  },
  warning: {
    color: Colors.warning,
  },
  danger: {
    color: Colors.danger,
  },
  info: {
    color: Colors.navy,
  },
  neutral: {
    color: Colors.textMuted,
  },
});

