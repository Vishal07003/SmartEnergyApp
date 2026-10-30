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
import { IoTDevice } from '../../types';

interface DetailedDeviceCardProps {
  device: IoTDevice;
  onPress: (device: IoTDevice) => void;
  onToggleMaster: (device: IoTDevice, newState: boolean) => void;
  style?: ViewStyle;
}

export const DetailedDeviceCard: React.FC<DetailedDeviceCardProps> = ({
  device,
  onPress,
  onToggleMaster,
  style,
}) => {
  const isOnline = device.status === 'ONLINE';
  const isDegraded = device.status === 'DEGRADED';
  const hasActiveChannels = device.channels.some(ch => ch.isOn);

  const totalWatts = device.channels.reduce((sum, ch) => sum + (ch.isOn ? ch.powerWatts : 0), 0);

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(device)}
      style={[styles.card, isDegraded ? styles.degradedBorder : null, style]}
    >
      {/* Header: Name, Room, Hardware ID & Master Switch */}
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <View style={styles.nameRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline
                    ? Colors.primary
                    : isDegraded
                    ? Colors.warning
                    : Colors.danger,
                },
              ]}
            />
            <Text style={styles.nameText} numberOfLines={1}>
              {device.name}
            </Text>
          </View>
          <Text style={styles.roomSubtitle}>
            {device.roomName} • {device.hardwareId}
          </Text>
        </View>

        <View style={styles.switchCol}>
          <Switch
            value={hasActiveChannels}
            disabled={!isOnline}
            onValueChange={val => onToggleMaster(device, val)}
            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
            thumbColor={hasActiveChannels ? Colors.primary : Colors.textSubtle}
          />
        </View>
      </View>

      {/* Telemetry and Metrics Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>LIVE POWER</Text>
          <Text style={[styles.metricValue, hasActiveChannels ? styles.powerActive : null]}>
            {totalWatts} W
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>RUNTIME TODAY</Text>
          <Text style={styles.metricValue}>
            {Math.floor(device.uptimeHours / 24)}d {device.uptimeHours % 24}h
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>WI-FI RSSI</Text>
          <Text style={[styles.metricValue, isDegraded ? styles.warningValue : null]}>
            {device.telemetry.wifiRssi} dBm
          </Text>
        </View>
      </View>

      {/* Channel Breakdown List */}
      <View style={styles.channelPreviewList}>
        {device.channels.map(ch => (
          <View key={ch.channelId} style={styles.channelRow}>
            <Text style={styles.channelName} numberOfLines={1}>
              {ch.label}
            </Text>
            <Text style={styles.channelWatts}>
              {ch.isOn ? `${ch.powerWatts} W` : 'OFF'}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={styles.syncText}>Last seen: {device.lastCommunicationTime}</Text>
        <Text style={styles.detailsLink}>Manage & Config ›</Text>
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
  degradedBorder: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  nameText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    flex: 1,
  },
  roomSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  switchCol: {
    alignItems: 'flex-end',
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  metricLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginBottom: 2,
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
  warningValue: {
    color: Colors.warning,
  },
  channelPreviewList: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  channelName: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    flex: 1,
  },
  channelWatts: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMain,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  syncText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
  },
  detailsLink: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});

