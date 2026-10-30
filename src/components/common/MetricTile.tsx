import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from './Card';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  subValueColor?: string;
  style?: ViewStyle;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  unit,
  subValue,
  subValueColor,
  style,
}) => {
  return (
    <Card style={[styles.card, style ?? {}]}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {subValue && (
        <Text
          style={[
            styles.subValue,
            subValueColor ? { color: subValueColor } : null,
          ]}
          numberOfLines={1}
        >
          {subValue}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    flex: 1,
    minWidth: 140,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  unit: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
  subValue: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
