import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { ChartBarData } from '../../types';

interface LoadDynamicsChartProps {
  data: ChartBarData[];
  peakPeriodLabel: string;
}

export const LoadDynamicsChart: React.FC<LoadDynamicsChartProps> = ({
  data,
  peakPeriodLabel,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const maxVal = Math.max(
    ...data.map(d => Math.max(d.actualKwh, d.baselineTargetKwh)),
    10
  );

  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;

  return (
    <View style={styles.container}>
      {/* Chart Title and Legend */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Periodic Load Dynamics</Text>
          <Text style={styles.subtitle}>Baseline target vs actual logged kWh</Text>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Actual</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
            <Text style={styles.legendText}>Baseline</Text>
          </View>
        </View>
      </View>

      {/* Selected Item Tooltip Header */}
      {selectedItem ? (
        <View style={styles.tooltipCard}>
          <Text style={styles.tooltipLabel}>
            {selectedItem.label}: <Text style={styles.tooltipVal}>{selectedItem.actualKwh.toLocaleString()} kWh</Text>
          </Text>
          <Text style={styles.tooltipSub}>
            Target: {selectedItem.baselineTargetKwh.toLocaleString()} kWh (
            {((selectedItem.actualKwh / selectedItem.baselineTargetKwh) * 100).toFixed(0)}% of plan)
          </Text>
        </View>
      ) : null}

      {/* Bars Chart View */}
      <View style={styles.chartArea}>
        {data.map((item, idx) => {
          const isSelected = selectedIndex === idx;
          const actualHeight = Math.max((item.actualKwh / maxVal) * 110, 8);
          const baselineHeight = Math.max((item.baselineTargetKwh / maxVal) * 110, 8);

          return (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.8}
              onPress={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
              style={styles.barColumn}
            >
              {/* Dual Bar Track: Baseline Ghost Bar + Actual Front Bar */}
              <View style={styles.barPair}>
                {/* Baseline bar (thin grey back bar) */}
                <View
                  style={[
                    styles.baselineBar,
                    { height: baselineHeight },
                  ]}
                />
                {/* Actual bar */}
                <View
                  style={[
                    styles.actualBar,
                    { height: actualHeight },
                    item.isPeak ? styles.peakBar : null,
                    isSelected ? styles.selectedBar : null,
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.barLabel,
                  isSelected || item.isPeak ? styles.activeLabel : null,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Peak Window Footer */}
      <View style={styles.peakFooter}>
        <View style={styles.peakDot} />
        <Text style={styles.peakText} numberOfLines={1}>
          {peakPeriodLabel}
        </Text>
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
    marginBottom: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  tooltipCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    fontWeight: Typography.weights.semibold,
  },
  tooltipVal: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  tooltipSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: Spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barPair: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    height: 110,
  },
  baselineBar: {
    width: 4,
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginRight: 2,
  },
  actualBar: {
    width: 14,
    backgroundColor: Colors.navy,
    borderRadius: 5,
  },
  peakBar: {
    backgroundColor: Colors.primary,
  },
  selectedBar: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.navyDark,
    borderWidth: 1,
  },
  barLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    fontWeight: Typography.weights.medium,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  peakFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  peakDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  peakText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMain,
    fontWeight: Typography.weights.semibold,
  },
});

