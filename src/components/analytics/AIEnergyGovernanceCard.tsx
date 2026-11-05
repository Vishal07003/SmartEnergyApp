import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Sparkles, TrendingDown } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AIGovernanceMetrics } from '../../types';

interface AIEnergyGovernanceCardProps {
  governance: AIGovernanceMetrics;
}

export const AIEnergyGovernanceCard: React.FC<AIEnergyGovernanceCardProps> = ({
  governance,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ShieldCheck size={18} color={Colors.primary} />
          <Text style={styles.title}>Autonomous Energy Governance</Text>
        </View>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>AI Engine Active</Text>
        </View>
      </View>

      {/* Efficiency Index Circle Card */}
      <View style={styles.indexBanner}>
        <View style={styles.circleGauge}>
          <Text style={styles.circleNumber}>{governance.efficiencyIndex}</Text>
          <Text style={styles.circleDenom}>/100</Text>
        </View>

        <View style={styles.indexInfo}>
          <Text style={styles.indexTitle}>Efficiency Index (EEI-100)</Text>
          <Text style={styles.indexSubtitle}>{governance.efficiencyRating}</Text>
        </View>
      </View>

      {/* Grid: Smart Shedding & Complete Cut */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Sparkles size={14} color={Colors.primary} />
            <Text style={styles.metricLabel}>AI SMART SHEDDING</Text>
          </View>
          <Text style={styles.metricVal}>{(governance.smartSheddingKwh ?? 0).toLocaleString()} kWh</Text>
          <Text style={styles.metricSub}>Dynamic daylight dimming & sleep</Text>
        </View>

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <TrendingDown size={14} color={Colors.primary} />
            <Text style={styles.metricLabel}>COMPLETE LOAD CUT</Text>
          </View>
          <Text style={styles.metricVal}>{(governance.completeLoadCutKwh ?? 0).toLocaleString()} kWh</Text>
          <Text style={styles.metricSub}>Automated overnight relay cutoffs</Text>
        </View>
      </View>

      {/* AI Recommendations List */}
      <View style={styles.recsSection}>
        <Text style={styles.recsTitle}>AUTONOMOUS RECOMMENDATIONS</Text>
        {governance.recommendations.map((rec, idx) => (
          <View key={idx} style={styles.recItem}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>{rec}</Text>
          </View>
        ))}
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
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    marginLeft: 6,
  },
  activePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  indexBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  circleGauge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.surface,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  circleNumber: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  circleDenom: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: -2,
  },
  indexInfo: {
    flex: 1,
  },
  indexTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  indexSubtitle: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  metricBox: {
    width: '48.5%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  metricVal: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  metricSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  recsSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.sm,
  },
  recsTitle: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  recItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: 6,
  },
  recText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMain,
    lineHeight: 16,
    flex: 1,
  },
});

