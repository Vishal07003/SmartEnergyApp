import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { IoTDevice } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

export const DeviceDetailsScreen: React.FC<Props> = ({ route }) => {
  const { deviceId } = route.params;
  const [device, setDevice] = useState<IoTDevice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const found = await mockApi.getDeviceById(deviceId);
        if (found) {
          setDevice(found);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [deviceId]);

  const handleToggleChannel = (channelId: number, label: string) => {
    if (!device) return;

    const target = device.channels.find(c => c.channelId === channelId);
    if (target?.safetyLocked) {
      Alert.alert(
        'Action Blocked',
        `"${label}" is safety-locked to protect critical equipment.`
      );
      return;
    }

    if (device.status !== 'ONLINE') {
      Alert.alert('Device Offline', 'Cannot send control commands to an offline device.');
      return;
    }

    setDevice(prev => {
      if (!prev) return null;
      return {
        ...prev,
        channels: prev.channels.map(ch =>
          ch.channelId === channelId ? { ...ch, isOn: !ch.isOn } : ch
        ),
      };
    });
  };

  if (loading || !device) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  const isOnline = device.status === 'ONLINE';
  const totalWatts = device.channels.reduce((sum, ch) => sum + (ch.isOn ? ch.powerWatts : 0), 0);

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Device Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.nameArea}>
              <Text style={styles.deviceName}>{device.name.replace('ESP32 Node - ', '')}</Text>
              <Text style={styles.roomTag}>{device.roomName} • {device.hardwareId}</Text>
            </View>
            <View style={[styles.statusBadge, isOnline ? styles.badgeOnline : styles.badgeOffline]}>
              <Text style={[styles.badgeText, isOnline ? styles.textOnline : styles.textOffline]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>ACTIVE DEMAND</Text>
              <Text style={styles.metaValue}>{totalWatts} W</Text>
            </View>
            <View style={styles.metaDivider} />
            <View>
              <Text style={styles.metaLabel}>WI-FI RSSI</Text>
              <Text style={styles.metaValue}>{device.telemetry?.wifiRssi ?? -60} dBm</Text>
            </View>
            <View style={styles.metaDivider} />
            <View>
              <Text style={styles.metaLabel}>LAST UPDATE</Text>
              <Text style={styles.metaValue}>{device.lastCommunicationTime}</Text>
            </View>
          </View>
        </View>

        {/* Relay Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Relay Controls</Text>
          {device.channels.map(ch => (
            <View key={ch.channelId} style={styles.channelCard}>
              <View style={styles.channelMain}>
                <Text style={styles.channelTitle}>{ch.label}</Text>
                <Text style={styles.channelSubtitle}>
                  {ch.safetyLocked
                    ? 'Protected (Safety Locked)'
                    : ch.isOn
                    ? `Consuming ${ch.powerWatts} W`
                    : 'Currently OFF'}
                </Text>
              </View>

              <Switch
                value={ch.isOn}
                disabled={ch.safetyLocked || !isOnline}
                onValueChange={() => handleToggleChannel(ch.channelId, ch.label)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={ch.isOn && isOnline ? Colors.primary : Colors.textSubtle}
              />
            </View>
          ))}

          {device.channels.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No controllable relays on this device</Text>
            </View>
          )}
        </View>

        {/* Device Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Firmware</Text>
              <Text style={styles.infoVal}>{device.firmwareVersion}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>IP Address</Text>
              <Text style={styles.infoVal}>{device.ipAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>MAC Address</Text>
              <Text style={styles.infoVal}>{device.macAddress}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  nameArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  roomTag: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgeOnline: {
    backgroundColor: Colors.successLight,
  },
  badgeOffline: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  textOnline: {
    color: Colors.primary,
  },
  textOffline: {
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  channelCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    minHeight: 64,
    marginBottom: Spacing.xs,
  },
  channelMain: {
    flex: 1,
    marginRight: Spacing.md,
  },
  channelTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  channelSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  infoKey: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  infoVal: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  empty: {
    padding: Spacing.base,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
