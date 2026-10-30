import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface HeroConsumptionCardProps {
  consumptionKwh: number;
  liveWatts: number;
  vsYesterdayPercent: number;
  targetBudgetKwh: number;
}

export const HeroConsumptionCard: React.FC<HeroConsumptionCardProps> = ({
  consumptionKwh,
  liveWatts,
  vsYesterdayPercent,
  targetBudgetKwh,
}) => {
  const isSaving = vsYesterdayPercent <= 0;

  return (
    <View style={styles.card}>
      {/* Top Row: Metric Label & Trend Badge */}
      <View style={styles.topRow}>
        <Text style={styles.badgeLabel}>TODAY'S CONSUMPTION</Text>
        <View style={[styles.trendBadge, isSaving ? styles.savingBadge : styles.spikeBadge]}>
          <Text style={[styles.trendText, isSaving ? styles.savingText : styles.spikeText]}>
            {isSaving ? '▼ ' : '▲ '}{Math.abs(vsYesterdayPercent)}% vs Yesterday
          </Text>
        </View>
      </View>

      {/* Main Figures */}
      <View style={styles.metricsRow}>
        <View style={styles.kwhContainer}>
          <Text style={styles.kwhValue}>{consumptionKwh.toFixed(1)}</Text>
          <Text style={styles.kwhUnit}>kWh</Text>
        </View>

        <View style={styles.livePowerTile}>
          <Text style={styles.livePowerLabel}>LIVE DEMAND</Text>
          <View style={styles.livePowerValueRow}>
            <Zap size={13} color="#34D399" />
            <Text style={styles.livePowerValue}>+{liveWatts.toLocaleString()} W</Text>
          </View>
        </View>
      </View>

      {/* Target Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min((consumptionKwh / targetBudgetKwh) * 100, 100)}%` },
            ]}
          />
        </View>
        <View style={styles.budgetRow}>
          <Text style={styles.budgetText}>Target: {targetBudgetKwh} kWh</Text>
          <Text style={styles.budgetText}>
            {((consumptionKwh / targetBudgetKwh) * 100).toFixed(0)}% Used
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
    marginBottom: Spacing.md,
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
    paddingVertical: 2,
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
  livePowerTile: {
    backgroundColor: 'rgba(23, 50, 77, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'flex-end',
  },
  livePowerLabel: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  livePowerValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePowerValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
    marginLeft: 3,
  },
  progressContainer: {
    marginTop: Spacing.xs,
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
});
