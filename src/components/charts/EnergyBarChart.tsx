import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { HourlyEnergyPoint } from '../../types';

interface EnergyBarChartProps {
  data: HourlyEnergyPoint[];
  peakHourLabel?: string;
  style?: ViewStyle;
}

export const EnergyBarChart: React.FC<EnergyBarChartProps> = ({
  data,
  peakHourLabel = 'Peak: 11:00',
  style,
}) => {
  const maxKwh = Math.max(...data.map(d => d.consumptionKwh), 8);

  return (
    <View style={[styles.container, style]}>
      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.title}>Campus Hourly Load</Text>
        <View style={styles.peakBadge}>
          <View style={styles.peakDot} />
          <Text style={styles.peakText}>{peakHourLabel}</Text>
        </View>
      </View>

      {/* Chart Bars Grid */}
      <View style={styles.chartArea}>
        {data.map((item, index) => {
          const heightPercent = Math.max((item.consumptionKwh / maxKwh) * 100, 10);
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    { height: `${heightPercent}%` },
                    item.isPeak ? styles.peakBar : styles.normalBar,
                  ]}
                />
              </View>
              <Text style={[styles.hourLabel, item.isPeak ? styles.peakHourText : null]}>
                {item.hour.split(':')[0]}h
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  peakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  peakDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginRight: 5,
  },
  peakText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 12,
    height: 80,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  normalBar: {
    backgroundColor: Colors.borderDark,
    opacity: 0.35,
  },
  peakBar: {
    backgroundColor: Colors.primary,
  },
  hourLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  peakHourText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
});
