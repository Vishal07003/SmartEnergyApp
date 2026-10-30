import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Zap } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface DeviceCampusLoadBannerProps {
  liveWatts: number;
  totalDevices: number;
  onlineCount: number;
  warningCount: number;
  offlineCount: number;
}

export const DeviceCampusLoadBanner: React.FC<DeviceCampusLoadBannerProps> = ({
  liveWatts,
  totalDevices,
  onlineCount,
  warningCount,
  offlineCount,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>CAMPUS DEMAND</Text>
          <View style={styles.powerRow}>
            <Zap size={18} color="#34D399" />
            <Text style={styles.powerValue}>{liveWatts.toLocaleString()}</Text>
            <Text style={styles.powerUnit}>W</Text>
          </View>
        </View>

        <View style={styles.sheddingBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.sheddingText}>Pulse Active</Text>
        </View>
      </View>

      {/* Counter Strip */}
      <View style={styles.counterRow}>
        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>ONLINE</Text>
          <Text style={[styles.counterValue, styles.onlineText]}>{onlineCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>WARNING</Text>
          <Text style={[styles.counterValue, styles.warningText]}>{warningCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>OFFLINE</Text>
          <Text style={[styles.counterValue, styles.offlineText]}>{offlineCount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>NODES</Text>
          <Text style={styles.counterValue}>{totalDevices}</Text>
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
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  powerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  powerValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
    marginLeft: 3,
  },
  powerUnit: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
    marginLeft: 3,
  },
  sheddingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  livePulse: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#34D399',
    marginRight: 5,
  },
  sheddingText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: '#34D399',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 23, 38, 0.7)',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  counterItem: {
    alignItems: 'center',
    flex: 1,
  },
  counterLabel: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    fontWeight: Typography.weights.semibold,
    letterSpacing: 0.5,
  },
  counterValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginTop: 1,
  },
  onlineText: {
    color: '#34D399',
  },
  warningText: {
    color: '#FBBF24',
  },
  offlineText: {
    color: '#F87171',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
