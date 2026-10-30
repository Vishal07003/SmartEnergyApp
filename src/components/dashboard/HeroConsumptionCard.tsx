import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      {/* Top Row: Label & Comparison Badge */}
      <View style={styles.topRow}>
        <Text style={styles.badgeLabel}>TODAY'S ELECTRICITY CONSUMPTION</Text>
        <View style={[styles.trendBadge, isSaving ? styles.savingBadge : styles.spikeBadge]}>
          <Text style={[styles.trendText, isSaving ? styles.savingText : styles.spikeText]}>
            {isSaving ? '▼ ' : '▲ '}
            {Math.abs(vsYesterdayPercent)}% vs Yesterday
          </Text>
        </View>
      </View>

      {/* Main Figures Row: Big kWh & Live Power Accent Tile */}
      <View style={styles.metricsRow}>
        <View style={styles.kwhContainer}>
          <Text style={styles.kwhValue}>{consumptionKwh.toFixed(1)}</Text>
          <Text style={styles.kwhUnit}>kWh</Text>
        </View>

        <View style={styles.livePowerTile}>
          <Text style={styles.livePowerLabel}>LIVE CAMPUS LOAD</Text>
          <Text style={styles.livePowerValue}>⚡ +{liveWatts.toLocaleString()} W</Text>
        </View>
      </View>

      {/* Budget & Target Progress Bar */}
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
          <Text style={styles.budgetText}>Target Budget: {targetBudgetKwh} kWh</Text>
          <Text style={styles.budgetText}>
            {((consumptionKwh / targetBudgetKwh) * 100).toFixed(1)}% Used
          </Text>
        </View>
      </View>

      {/* Footer Status Pill */}
      <View style={styles.footerStrip}>
        <View style={styles.liveDot} />
        <Text style={styles.footerText}>TELEMETRY ACTIVE • NORMAL PROFILE</Text>
        <Text style={styles.footerRightText}>Load Coeff: 0.92</Text>
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
  livePowerTile: {
    backgroundColor: 'rgba(23, 50, 77, 0.7)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
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
  livePowerValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
  },
  progressContainer: {
    marginTop: Spacing.sm,
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
  footerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 23, 38, 0.7)',
    marginTop: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  footerText: {
    fontSize: Typography.sizes.xxs,
    color: '#E2E8F0',
    fontWeight: Typography.weights.semibold,
    flex: 1,
  },
  footerRightText: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
  },
});

