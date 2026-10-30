import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { IoTDevice } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'DeviceDetails'>;

export const DeviceDetailsScreen: React.FC<Props> = ({ route }) => {
  const { deviceId } = route.params;
  const [device, setDevice] = useState<IoTDevice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [automationToggle, setAutomationToggle] = useState<boolean>(true);

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const found = await mockApi.getDeviceById(deviceId);
        if (found) {
          setDevice(found);
          setAutomationToggle(found.automationEnabled);
        }
      } catch {
        Alert.alert('Error', 'Unable to retrieve controller telemetry.');
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
        'Action Blocked by Safety Lock',
        `Channel "${label}" is marked as critical infrastructure (e.g. servers or lab test benches) and cannot be switched off remotely.`
      );
      return;
    }

    Alert.alert(
      'Confirm Channel Switch',
      `[MOCK DEMO] Toggle power relay for "${label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Toggle Relay',
          onPress: () => {
            setDevice(prev => {
              if (!prev) return null;
              return {
                ...prev,
                channels: prev.channels.map(ch => {
                  if (ch.channelId === channelId) {
                    return { ...ch, isOn: !ch.isOn };
                  }
                  return ch;
                }),
              };
            });
            Alert.alert(
              'Relay Actuated (Demo)',
              `Channel status confirmed by ESP32 hardware telemetry.`
            );
          },
        },
      ]
    );
  };

  const handleRebootNode = () => {
    Alert.alert(
      'Simulate Node Soft-Restart',
      `[MOCK DEMO] Issue a soft restart command to ${device?.hardwareId}?\n\nTelemetry will reconnect within 15 seconds.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Restart Signal',
          onPress: () => {
            Alert.alert(
              'Signal Sent (Demo)',
              'ESP32 controller is restarting watchdog loops.'
            );
          },
        },
      ]
    );
  };

  if (loading || !device) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Connecting to ESP32 Telemetry...</Text>
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
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>
                {device.hardwareId} • Firmware: {device.firmwareVersion}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isOnline ? styles.statusOnline : styles.statusWarning,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  isOnline ? styles.textOnline : styles.textWarning,
                ]}
              >
                {device.status}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>MAC: {device.macAddress}</Text>
            <Text style={styles.metaText}>IP: {device.ipAddress}</Text>
            <Text style={styles.metaText}>Room: {device.roomName}</Text>
          </View>
        </Card>

        {/* Live Hardware Telemetry Grid */}
        <Text style={styles.sectionTitle}>Live Sensor & Bus Telemetry</Text>
        <View style={styles.telemetryGrid}>
          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>LIVE POWER LOAD</Text>
            <Text style={styles.tileValue}>{totalWatts} W</Text>
            <Text style={styles.tileSub}>Active Channel Draw</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>AC VOLTAGE</Text>
            <Text style={styles.tileValue}>{device.telemetry.voltage} V</Text>
            <Text style={styles.tileSub}>Frequency {device.telemetry.frequency} Hz</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>AC CURRENT</Text>
            <Text style={styles.tileValue}>{device.telemetry.current} A</Text>
            <Text style={styles.tileSub}>PF: {device.telemetry.powerFactor}</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>WI-FI SIGNAL (RSSI)</Text>
            <Text style={styles.tileValue}>{device.telemetry.wifiRssi} dBm</Text>
            <Text style={styles.tileSub}>
              {device.telemetry.wifiRssi > -70 ? 'Strong Link' : 'Moderate/Weak'}
            </Text>
          </Card>
        </View>

        {/* Relay Channels & Mock Remote Actuation */}
        <Text style={styles.sectionTitle}>
          Individual Relay Channels ({device.channels.length})
        </Text>
        <Card style={styles.channelsCard}>
          {device.channels.map(channel => (
            <View key={channel.channelId} style={styles.channelItem}>
              <View style={styles.channelTextCol}>
                <View style={styles.labelRow}>
                  <Text style={styles.channelLabel}>{channel.label}</Text>
                  {channel.safetyLocked && (
                    <View style={styles.lockedBadge}>
                      <Text style={styles.lockedText}>Safety Locked</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.channelSub}>
                  Channel #{channel.channelId} • {channel.isOn ? `${channel.powerWatts} W Draw` : 'Cut Off (0 W)'}
                </Text>
              </View>

              <Switch
                value={channel.isOn}
                disabled={channel.safetyLocked || !isOnline}
                onValueChange={() => handleToggleChannel(channel.channelId, channel.label)}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={channel.isOn ? Colors.primary : Colors.textSubtle}
              />
            </View>
          ))}
        </Card>

        {/* Automation Configuration for this Device */}
        <Text style={styles.sectionTitle}>Automation & Policy State</Text>
        <Card style={styles.automationCard}>
          <View style={styles.automationRow}>
            <View style={styles.automationInfo}>
              <Text style={styles.automationTitle}>Autonomous Energy Shedding</Text>
              <Text style={styles.automationDesc}>
                Allow institutional AI engine to de-energize active channels during room vacancy.
              </Text>
            </View>
            <Switch
              value={automationToggle}
              onValueChange={val => {
                setAutomationToggle(val);
                Alert.alert(
                  'Automation Rule Updated (Demo)',
                  `Autonomous energy shedding is now ${val ? 'ENABLED' : 'PAUSED'} for this node.`
                );
              }}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={automationToggle ? Colors.primary : Colors.textSubtle}
            />
          </View>
        </Card>

        {/* Node Maintenance Actions */}
        <Text style={styles.sectionTitle}>Node Maintenance & Diagnostics</Text>
        <Button
          title="Restart ESP32 Controller"
          onPress={handleRebootNode}
          variant="outline"
          style={styles.rebootBtn}
        />
      </ScrollView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  headerCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  titleInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  deviceMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  statusOnline: {
    backgroundColor: Colors.successLight,
  },
  statusWarning: {
    backgroundColor: Colors.warningLight,
  },
  statusText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
  },
  textOnline: {
    color: Colors.success,
  },
  textWarning: {
    color: Colors.warning,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  telemetryTile: {
    width: '48.5%',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tileLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tileValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  tileSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  channelsCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  channelTextCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  channelLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
  },
  lockedBadge: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.xs,
  },
  lockedText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  channelSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  automationCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  automationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  automationInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  automationTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  automationDesc: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  rebootBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
});

