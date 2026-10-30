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

  // Shorten device title for clean industrial aesthetics
  const displayTitle = device.name
    .replace('ESP32 Node - ', '')
    .replace('ESP32 Smart Controller - ', '')
    .replace('ESP32 Sensor Gateway - ', '')
    .replace('ESP32 Master Relay - ', '')
    .replace('ESP32 Environmental & Lighting Hub', 'Lighting & Enviro Hub');

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(device)}
      style={[styles.card, isDegraded ? styles.degradedBorder : null, style]}
    >
      {/* Header: Compact Name, Room Subtitle & Master Switch */}
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
              {displayTitle}
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

      {/* 3 Primary Metrics: Live Power, Runtime, Wi-Fi Signal */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>LIVE POWER</Text>
          <Text style={[styles.metricValue, hasActiveChannels ? styles.powerActive : null]}>
            {totalWatts} W
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>RUNTIME</Text>
          <Text style={styles.metricValue}>
            {Math.floor(device.uptimeHours / 24)}d {device.uptimeHours % 24}h
          </Text>
        </View>

        <View style={styles.metricDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>WI-FI SIGNAL</Text>
          <Text style={[styles.metricValue, isDegraded ? styles.warningValue : null]}>
            {device.telemetry.wifiRssi} dBm
          </Text>
        </View>
      </View>

      {/* Footer Info: Small Last Seen & Clean Details Link */}
      <View style={styles.footerRow}>
        <Text style={styles.syncText}>Seen {device.lastCommunicationTime}</Text>
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
  degradedBorder: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleInfo: {
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
  nameText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    flex: 1,
  },
  roomSubtitle: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  switchCol: {
    alignItems: 'flex-end',
  },
  metricsBar: {
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
  warningValue: {
    color: Colors.warning,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  syncText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
  },
  detailsLink: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
