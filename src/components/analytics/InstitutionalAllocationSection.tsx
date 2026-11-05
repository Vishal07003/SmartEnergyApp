import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { ZoneEnergyAllocation } from '../../types';

interface InstitutionalAllocationSectionProps {
  allocations: ZoneEnergyAllocation[];
}

export const InstitutionalAllocationSection: React.FC<InstitutionalAllocationSectionProps> = ({
  allocations,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Institutional Load Allocation</Text>
        <Text style={styles.subtitle}>Aggregated campus sub-zones</Text>
      </View>

      {/* Multi-Segment Stacked Progress Bar */}
      <View style={styles.segmentedBar}>
        {(allocations || []).map((item, idx) => {
          const colors = ['#087F5B', '#17324D', '#E8A23A', '#94A3B8'];
          const segmentColor = colors[idx % colors.length];
          return (
            <View
              key={item.id}
              style={[
                styles.barSegment,
                {
                  width: `${item.percentage ?? 0}%`,
                  backgroundColor: segmentColor,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Item Breakdown List */}
      <View style={styles.list}>
        {(allocations || []).map((item, idx) => {
          const colors = ['#087F5B', '#17324D', '#E8A23A', '#94A3B8'];
          const segmentColor = colors[idx % colors.length];

          return (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.leftCol}>
                <View style={[styles.colorSquare, { backgroundColor: segmentColor }]} />
                <View>
                  <View style={styles.titleBadgeRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {item.isHighest && (
                      <View style={styles.highestBadge}>
                        <Text style={styles.highestBadgeText}>Highest</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text style={styles.kwhText}>
                  {(item.consumptionKwh ?? 0).toLocaleString()} kWh
                </Text>
                <Text style={styles.percentText}>
                  {(item.percentage ?? 0).toFixed(1)}%
                </Text>
              </View>
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
    marginBottom: Spacing.base,
  },
  header: {
    marginBottom: Spacing.md,
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
  segmentedBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceSubtle,
    marginBottom: Spacing.md,
  },
  barSegment: {
    height: '100%',
  },
  list: {
    paddingTop: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  colorSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  highestBadge: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginLeft: 6,
  },
  highestBadgeText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.warning,
    fontWeight: Typography.weights.bold,
  },
  itemCategory: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  kwhText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  percentText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 1,
  },
});

