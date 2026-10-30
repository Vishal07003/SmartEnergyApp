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
import { Button } from '../common/Button';
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
        isIdle ? styles.idleBorder : null,
        style,
      ]}
    >
      {/* Top Header: Room Name, Number, Floor & Occupancy Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleArea}>
          <View style={styles.roomNameRow}>
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
          <Text style={styles.locationSubtitle}>
            Room {room.roomNumber} • {room.floor} • {room.building}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <OccupancyBadge state={room.occupancy.state} />
          {onToggleMasterRelay && (
            <View style={styles.switchContainer}>
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

      {/* AI Anomaly or Motion Notification Strip */}
      {isIdle ? (
        <View style={styles.anomalyBanner}>
          <Text style={styles.anomalyTitle}>
            Automated Anomaly Alert: Zero PIR motion for {room.occupancy.idleTimerMinutes}m
          </Text>
          <Text style={styles.anomalyDesc}>
            Predicts empty in 2 mins. {room.electrical.activeApplianceCount} active appliances drawing idle load.
          </Text>
          {onAutoShutdown && (
            <Button
              title="Auto-Shutdown"
              onPress={() => onAutoShutdown(room)}
              variant="danger"
              style={styles.shutdownBtn}
              textStyle={styles.shutdownBtnText}
            />
          )}
        </View>
      ) : (
        <View style={styles.motionBanner}>
          <Text style={styles.motionText}>
            {isActive
              ? 'Continuous Motion Detected • Occupancy Confirmed'
              : 'Secured Vacancy • Non-essential loads isolated'}
          </Text>
          <Text style={styles.confidenceText}>
            ML: {(room.occupancy.confidenceScore * 100).toFixed(0)}% Conf.
          </Text>
        </View>
      )}

      {/* 3-Column Environmental & Telemetry Readouts (from Reference Mockup) */}
      <View style={styles.readoutGrid}>
        <View style={styles.readoutTile}>
          <Text style={styles.readoutLabel}>CLIMATE</Text>
          <Text style={styles.readoutValue}>{room.sensors.temperature}°C</Text>
          <Text style={styles.readoutSub}>{room.sensors.humidity}% Humidity</Text>
        </View>

        <View style={styles.tileDivider} />

        <View style={styles.readoutTile}>
          <Text style={styles.readoutLabel}>ILLUMINANCE</Text>
          <Text style={styles.readoutValue}>{room.sensors.ambientLight} Lux</Text>
          <Text style={styles.readoutSub}>
            {room.sensors.ambientLight > 400 ? 'Daylit Zone' : 'Dim Ambient'}
          </Text>
        </View>

        <View style={styles.tileDivider} />

        <View style={styles.readoutTile}>
          <Text style={styles.readoutLabel}>LIVE POWER</Text>
          <Text
            style={[
              styles.readoutValue,
              isPoweredOn ? styles.powerActive : styles.powerStandby,
            ]}
          >
            {room.electrical.livePowerWatts} W
          </Text>
          <Text style={styles.readoutSub}>
            {room.electrical.todayEnergyKwh} kWh Today
          </Text>
        </View>
      </View>

      {/* Card Footer: Connected Devices, Details Arrow */}
      <View style={styles.footerRow}>
        <Text style={styles.devicesText}>
          {room.electrical.activeApplianceCount} of {room.electrical.totalApplianceCount} Appliances Active
        </Text>
        <Text style={styles.detailsLink}>Details ›</Text>
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
  idleBorder: {
    borderColor: '#FBD38D',
    backgroundColor: '#FFFCF8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  roomNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roomName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    flex: 1,
  },
  locationSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  switchContainer: {
    marginTop: Spacing.xs,
  },
  anomalyBanner: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  anomalyTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
    marginBottom: 2,
  },
  anomalyDesc: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMain,
    lineHeight: 16,
    marginBottom: Spacing.xs,
  },
  shutdownBtn: {
    height: 32,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.xs,
  },
  shutdownBtnText: {
    fontSize: Typography.sizes.xxs,
  },
  motionBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  motionText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    flex: 1,
  },
  confidenceText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.xs,
  },
  readoutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  readoutTile: {
    flex: 1,
    alignItems: 'center',
  },
  tileDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  readoutLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  readoutValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  powerActive: {
    color: Colors.primary,
  },
  powerStandby: {
    color: Colors.textMuted,
  },
  readoutSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  devicesText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  detailsLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});

