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

interface DetailedRoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
  onAutoShutdown?: (room: Room) => void;
  onToggleMasterRelay?: (roomId: string, newState: boolean) => void;
  style?: ViewStyle;
}

export const DetailedRoomCard: React.FC<DetailedRoomCardProps> = ({
  room,
  onPress,
  onAutoShutdown,
  onToggleMasterRelay,
  style,
}) => {
  const isIdle = room.occupancy.state === 'IDLE_TRANSITION';
  const isActive = room.occupancy.state === 'ACTIVE';
  const isPoweredOn = room.electrical.livePowerWatts > 50;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(room)}
      style={[
        styles.card,
        isIdle ? styles.idleCard : null,
        style,
      ]}
    >
      {/* Header: Room Name, Room No / Floor & Occupancy Badge + Switch */}
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <View style={styles.nameRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? Colors.primary
                    : isIdle
                    ? Colors.warning
                    : Colors.textMuted,
                },
              ]}
            />
            <Text style={styles.roomName} numberOfLines={1}>
              {room.name}
            </Text>
          </View>
          <Text style={styles.subtitle}>
            Room {room.roomNumber} • {room.floor}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <OccupancyBadge state={room.occupancy.state} />
          {onToggleMasterRelay && (
            <View style={styles.switchWrapper}>
              <Switch
                value={isPoweredOn}
                onValueChange={val => onToggleMasterRelay(room.id, val)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={isPoweredOn ? Colors.primary : Colors.textSubtle}
              />
            </View>
          )}
        </View>
      </View>

      {/* Compact Anomaly Warning Banner (Only when in IDLE_TRANSITION) */}
      {isIdle && (
        <View style={styles.anomalyBadgeRow}>
          <View style={styles.warningTag}>
            <Text style={styles.warningTagText}>IDLE</Text>
          </View>
          <Text style={styles.anomalyText} numberOfLines={1}>
            No motion {room.occupancy.idleTimerMinutes}m • {room.electrical.activeApplianceCount} loads active
          </Text>
          {onAutoShutdown && (
            <TouchableOpacity
              onPress={() => onAutoShutdown(room)}
              style={styles.shutdownAction}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.shutdownActionText}>Cut Power</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 3 Primary Metrics: Temperature, Lux, Live Power */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>TEMP</Text>
          <Text style={styles.metricValue}>{room.sensors.temperature}°C</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ILLUMINANCE</Text>
          <Text style={styles.metricValue}>{room.sensors.ambientLight} Lux</Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>LIVE POWER</Text>
          <Text
            style={[
              styles.metricValue,
              isPoweredOn ? styles.powerActive : styles.powerStandby,
            ]}
          >
            {room.electrical.livePowerWatts} W
          </Text>
        </View>
      </View>

      {/* Compact Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.footerApplianceText}>
          {room.electrical.activeApplianceCount} of {room.electrical.totalApplianceCount} loads active
        </Text>
        <Text style={styles.detailsLink}>Details ›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  idleCard: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  roomName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    flex: 1,
  },
  subtitle: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchWrapper: {
    marginLeft: 6,
  },
  anomalyBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    marginVertical: 4,
  },
  warningTag: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 6,
  },
  warningTagText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
  },
  anomalyText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.danger,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  shutdownAction: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginLeft: 4,
  },
  shutdownActionText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.danger,
    fontWeight: Typography.weights.bold,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  metricLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginBottom: 1,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  powerActive: {
    color: Colors.primary,
  },
  powerStandby: {
    color: Colors.textMuted,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  footerApplianceText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  detailsLink: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
