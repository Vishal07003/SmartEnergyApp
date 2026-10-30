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
        'Safety Locked',
        `"${label}" is marked as critical infrastructure and cannot be switched off.`
      );
      return;
    }

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
  };

  const handleRebootNode = () => {
    Alert.alert(
      'Restart Node',
      `[MOCK DEMO] Issue soft restart command to ${device?.hardwareId}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restart',
          onPress: () => {
            Alert.alert('Sent', 'ESP32 controller is restarting watchdog loops.');
          },
        },
      ]
    );
  };

  if (loading || !device) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
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
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceMeta}>{device.hardwareId} • {device.roomName}</Text>
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
        </Card>

        {/* Telemetry Grid */}
        <Text style={styles.sectionTitle}>Telemetry</Text>
        <View style={styles.telemetryGrid}>
          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>LIVE POWER</Text>
            <Text style={styles.tileValue}>{totalWatts} W</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>VOLTAGE</Text>
            <Text style={styles.tileValue}>{device.telemetry.voltage} V</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>CURRENT</Text>
            <Text style={styles.tileValue}>{device.telemetry.current} A</Text>
          </Card>

          <Card style={styles.telemetryTile}>
            <Text style={styles.tileLabel}>WI-FI RSSI</Text>
            <Text style={styles.tileValue}>{device.telemetry.wifiRssi} dBm</Text>
          </Card>
        </View>

        {/* Channels */}
        <Text style={styles.sectionTitle}>Relay Channels</Text>
        <Card style={styles.channelsCard}>
          {device.channels.map(channel => (
            <View key={channel.channelId} style={styles.channelItem}>
              <View style={styles.channelTextCol}>
                <Text style={styles.channelLabel}>{channel.label}</Text>
                <Text style={styles.channelSub}>
                  {channel.isOn ? `${channel.powerWatts} W` : 'OFF'}
                  {channel.safetyLocked ? ' • Locked' : ''}
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

        {/* Automation State */}
        <Text style={styles.sectionTitle}>Automation</Text>
        <Card style={styles.automationCard}>
          <View style={styles.automationRow}>
            <View style={styles.automationInfo}>
              <Text style={styles.automationTitle}>Smart Shedding</Text>
              <Text style={styles.automationDesc}>
                Auto-isolate idle loads when room is empty.
              </Text>
            </View>
            <Switch
              value={automationToggle}
              onValueChange={setAutomationToggle}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={automationToggle ? Colors.primary : Colors.textSubtle}
            />
          </View>
        </Card>

        {/* Action Button */}
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
    paddingBottom: Spacing.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    padding: Spacing.base,
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  deviceMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  telemetryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  channelsCard: {
    padding: Spacing.base,
    marginBottom: Spacing.xs,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  channelTextCol: {
    flex: 1,
  },
  channelLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
  },
  channelSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  automationCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
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
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  automationDesc: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  rebootBtn: {
    height: 44,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
});
