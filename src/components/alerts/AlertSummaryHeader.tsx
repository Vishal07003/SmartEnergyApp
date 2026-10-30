import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AlertSummaryCounts } from '../../types';

interface AlertSummaryHeaderProps {
  counts: AlertSummaryCounts;
}

export const AlertSummaryHeader: React.FC<AlertSummaryHeaderProps> = ({ counts }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>AI ANOMALY DETECTION ENGINE</Text>
          <Text style={styles.mainCount}>{counts.totalActive} Active Interventions</Text>
        </View>
        <View style={styles.livePulseBadge}>
          <View style={styles.pulseDot} />
          <Text style={styles.pulseText}>Heuristics Live</Text>
        </View>
      </View>

      {/* 4-Item Severity Breakdown Strip */}
      <View style={styles.breakdownStrip}>
        <View style={styles.item}>
          <Text style={styles.itemLabel}>CRITICAL</Text>
          <Text style={[styles.itemVal, styles.criticalVal]}>{counts.critical}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>WARNING</Text>
          <Text style={[styles.itemVal, styles.warningVal]}>{counts.warning}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>INFO</Text>
          <Text style={[styles.itemVal, styles.infoVal]}>{counts.info}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={styles.itemLabel}>RESOLVED</Text>
          <Text style={[styles.itemVal, styles.resolvedVal]}>{counts.resolved}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  mainCount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  pulseText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: '#34D399',
  },
  breakdownStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 23, 38, 0.75)',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  itemLabel: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  itemVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  criticalVal: {
    color: '#F87171',
  },
  warningVal: {
    color: '#FBBF24',
  },
  infoVal: {
    color: '#93C5FD',
  },
  resolvedVal: {
    color: '#34D399',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
});

