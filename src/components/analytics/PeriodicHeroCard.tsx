import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap, Leaf } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface PeriodicHeroCardProps {
  totalKwh: number;
  deltaPercent: number;
  liveWatts: number;
  carbonOffsetKg: number;
  targetBudgetKwh: number;
  periodLabel: string;
}

export const PeriodicHeroCard: React.FC<PeriodicHeroCardProps> = ({
  totalKwh,
  deltaPercent,
  liveWatts,
  carbonOffsetKg,
  targetBudgetKwh,
  periodLabel,
}) => {
  const isSaving = deltaPercent <= 0;

  return (
    <View style={styles.card}>
      {/* Top Row: Total Label & Comparison Badge */}
      <View style={styles.topRow}>
        <Text style={styles.badgeLabel}>TOTAL PERIODIC CONSUMPTION</Text>
        <View style={[styles.trendBadge, isSaving ? styles.savingBadge : styles.spikeBadge]}>
          <Text style={[styles.trendText, isSaving ? styles.savingText : styles.spikeText]}>
            {isSaving ? '▼ ' : '▲ '}
            {Math.abs(deltaPercent)}% vs Previous
          </Text>
        </View>
      </View>

      {/* Main Consumption Figures */}
      <View style={styles.metricsRow}>
        <View style={styles.kwhContainer}>
          <Text style={styles.kwhValue}>
            {totalKwh >= 1000 ? totalKwh.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : totalKwh.toFixed(1)}
          </Text>
          <Text style={styles.kwhUnit}>kWh</Text>
        </View>

        <View style={styles.budgetPill}>
          <Text style={styles.budgetPillLabel}>Target</Text>
          <Text style={styles.budgetPillValue}>{targetBudgetKwh.toLocaleString()} kWh</Text>
        </View>
      </View>

      {/* Progress Bar towards Target Budget */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((totalKwh / targetBudgetKwh) * 100, 100)}%` },
            ]}
          />
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetText}>{periodLabel}</Text>
          <Text style={styles.budgetText}>
            {((totalKwh / targetBudgetKwh) * 100).toFixed(1)}% of Budget Cap
          </Text>
        </View>
      </View>

      {/* Dual Split Sub-metrics: Live Demand & Carbon Offset */}
      <View style={styles.subGrid}>
        <View style={styles.subTile}>
          <View style={styles.subTileHeader}>
            <Zap size={14} color="#34D399" />
            <Text style={styles.subTileLabel}>LIVE ESP32 DEMAND</Text>
          </View>
          <Text style={styles.subTileValue}>{liveWatts.toLocaleString()} W</Text>
        </View>

        <View style={styles.subDivider} />

        <View style={styles.subTile}>
          <View style={styles.subTileHeader}>
            <Leaf size={14} color="#34D399" />
            <Text style={styles.subTileLabel}>CARBON OFFSET</Text>
          </View>
          <Text style={styles.subTileValue}>
            {carbonOffsetKg >= 1000 ? (carbonOffsetKg / 1000).toFixed(1) + ' t' : carbonOffsetKg.toFixed(0) + ' kg'} CO₂
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  trendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  savingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  spikeBadge: {
    backgroundColor: 'rgba(217, 83, 79, 0.2)',
  },
  trendText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
  },
  savingText: {
    color: '#34D399',
  },
  spikeText: {
    color: '#F87171',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginVertical: Spacing.xs,
  },
  kwhContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kwhValue: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    letterSpacing: -1,
  },
  kwhUnit: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: '#94A3B8',
    marginLeft: Spacing.xs,
  },
  budgetPill: {
    backgroundColor: 'rgba(23, 50, 77, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-end',
  },
  budgetPillLabel: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    fontWeight: Typography.weights.semibold,
  },
  budgetPillValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  progressContainer: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.emeraldAccent,
    borderRadius: 2,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  budgetText: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
  },
  subGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 23, 38, 0.75)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  subTile: {
    flex: 1,
  },
  subTileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  subTileLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: '#94A3B8',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  subTileValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginTop: 2,
  },
  subDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: Spacing.sm,
  },
});

