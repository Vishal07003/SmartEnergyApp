import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { OccupancyBadge } from '../common/Badge';
import { Room } from '../../types';

interface RoomOverviewCardProps {
  room: Room;
  onPress: (room: Room) => void;
  onToggleMasterRelay: (roomId: string, newState: boolean) => void;
  style?: ViewStyle;
}

export const RoomOverviewCard: React.FC<RoomOverviewCardProps> = ({
  room,
  onPress,
  onToggleMasterRelay,
  style,
}) => {
  const isPoweredOn = room.electrical.livePowerWatts > 50;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(room)}
      style={[styles.card, style]}
    >
      {/* Top Header: Room Name, Occupancy Badge & Quick Switch */}
      <View style={styles.topRow}>
        <View style={styles.nameContainer}>
          <View style={styles.dotIndicator} />
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
        </View>

        <View style={styles.badgeSwitchRow}>
          <OccupancyBadge state={room.occupancy.state} />
          <View style={styles.switchWrapper}>
            <Switch
              value={isPoweredOn}
              onValueChange={val => onToggleMasterRelay(room.id, val)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={isPoweredOn ? Colors.primary : Colors.textSubtle}
            />
          </View>
        </View>
      </View>

      {/* Sensor & Telemetry Strip */}
      <View style={styles.telemetryRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TEMP</Text>
          <Text style={styles.metricValue}>{room.sensors.temperature}°C</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>HUMIDITY</Text>
          <Text style={styles.metricValue}>{room.sensors.humidity}%</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>DEVICES</Text>
          <Text style={styles.metricValue}>
            {room.electrical.activeApplianceCount} Active
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>POWER</Text>
          <Text style={[styles.metricValue, styles.powerHighlight]}>
            {room.electrical.livePowerWatts} W
          </Text>
        </View>
      </View>

      {/* Sensor Status Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.subtext}>
          PIR: {room.sensors.motionDetected ? 'Movement Active' : 'No Motion Detected'}
        </Text>
        <Text style={styles.detailLink}>Details ›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  roomName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    flex: 1,
  },
  badgeSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchWrapper: {
    marginLeft: Spacing.sm,
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  powerHighlight: {
    color: Colors.primary,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: Colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  subtext: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  detailLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});

