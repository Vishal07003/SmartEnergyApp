import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
      {/* Top Row: Campus Active Watts & Smart Shedding Badge */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.label}>ACTIVE CAMPUS LOAD</Text>
          <View style={styles.powerRow}>
            <Text style={styles.powerValue}>⚡ {liveWatts.toLocaleString()}</Text>
            <Text style={styles.powerUnit}>W</Text>
          </View>
        </View>

        <View style={styles.sheddingBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.sheddingText}>Smart Pulse Shedding Active</Text>
        </View>
      </View>

      {/* Bottom Counter Strip */}
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
          <Text style={styles.counterLabel}>TOTAL NODES</Text>
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
  powerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  powerValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
  },
  powerUnit: {
    fontSize: Typography.sizes.sm,
    color: '#94A3B8',
    marginLeft: 4,
  },
  sheddingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
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
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  counterItem: {
    alignItems: 'center',
    flex: 1,
  },
  counterLabel: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  counterValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
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
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

