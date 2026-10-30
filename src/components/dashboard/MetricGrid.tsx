import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface MetricGridProps {
  activeRooms: number;
  totalRooms: number;
  emptyRooms: number;
  connectedDevices: number;
  deviceUptimePercent: number;
  activeAnomalies: number;
}

export const MetricGrid: React.FC<MetricGridProps> = ({
  activeRooms,
  totalRooms,
  emptyRooms,
  connectedDevices,
  deviceUptimePercent,
  activeAnomalies,
}) => {
  return (
    <View style={styles.grid}>
      {/* Tile 1: Active Rooms */}
      <View style={styles.tile}>
        <Text style={styles.label}>ACTIVE ROOMS</Text>
        <View style={styles.valueRow}>
          <Text style={styles.primaryValue}>{activeRooms}</Text>
          <Text style={styles.denomValue}> / {totalRooms}</Text>
        </View>
        <View style={styles.indicatorRow}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.subtext}>In Session</Text>
        </View>
      </View>

      {/* Tile 2: Empty Rooms */}
      <View style={styles.tile}>
        <Text style={styles.label}>EMPTY ROOMS</Text>
        <View style={styles.valueRow}>
          <Text style={styles.primaryValue}>{emptyRooms}</Text>
          <Text style={styles.denomValue}> Rooms</Text>
        </View>
        <View style={styles.indicatorRow}>
          <View style={[styles.dot, { backgroundColor: Colors.textMuted }]} />
          <Text style={styles.subtext}>Secured</Text>
        </View>
      </View>

      {/* Tile 3: Connected IoT Devices */}
      <View style={styles.tile}>
        <Text style={styles.label}>CONNECTED IOT</Text>
        <View style={styles.valueRow}>
          <Text style={styles.primaryValue}>{connectedDevices}</Text>
        </View>
        <View style={styles.indicatorRow}>
          <Text style={styles.greenSubtext}>{deviceUptimePercent}% UP</Text>
        </View>
      </View>

      {/* Tile 4: AI Anomalies */}
      <View style={styles.tile}>
        <Text style={styles.label}>AI ANOMALIES</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.primaryValue, activeAnomalies > 0 ? styles.dangerValue : null]}>
            {activeAnomalies}
          </Text>
          <Text style={styles.denomValue}> Active</Text>
        </View>
        <View style={styles.indicatorRow}>
          <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
          <Text style={styles.dangerSubtext}>Requires Action</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.base,
  },
  tile: {
    width: '48.5%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  primaryValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  dangerValue: {
    color: Colors.danger,
  },
  denomValue: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  subtext: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  greenSubtext: {
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  dangerSubtext: {
    fontSize: Typography.sizes.xxs,
    color: Colors.danger,
    fontWeight: Typography.weights.semibold,
  },
});

