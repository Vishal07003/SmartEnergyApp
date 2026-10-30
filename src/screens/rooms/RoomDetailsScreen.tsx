import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer, OccupancyBadge } from '../../components/common';
import { mockApi } from '../../services/api';
import { Room, IoTDevice } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomDetails'>;

export const RoomDetailsScreen: React.FC<Props> = ({ route }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState<Room | null>(null);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const foundRoom = await mockApi.getRoomById(roomId);
        const allDevices = await mockApi.getDevices();
        if (foundRoom) {
          setRoom(foundRoom);
          const related = allDevices.filter(d => foundRoom.connectedDeviceIds.includes(d.id));
          setDevices(related);
        }
      } catch {
        Alert.alert('Error', 'Unable to load room details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [roomId]);

  const handleToggleChannel = (deviceId: string, channelId: number, label: string) => {
    setDevices(prevDevices =>
      prevDevices.map(d => {
        if (d.id === deviceId) {
          return {
            ...d,
            channels: d.channels.map(ch => {
              if (ch.channelId === channelId) {
                return { ...ch, isOn: !ch.isOn };
              }
              return ch;
            }),
          };
        }
        return d;
      })
    );

    Alert.alert(
      'Simulated Relay Control',
      `[MOCK DEMO] Remote relay command queued for "${label}".\n\nHardware state will update when ESP32 confirms telemetry ACK.`
    );
  };

  if (loading || !room) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching Live Room Sensors...</Text>
        </View>
      </AppScreenContainer>
    );
  }

  const isOccupied = room.occupancy.state === 'ACTIVE';

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.locationTag}>
                {room.roomNumber} • {room.floor} • {room.building}
              </Text>
            </View>
            <OccupancyBadge state={room.occupancy.state} />
          </View>

          <View style={styles.confidenceRow}>
            <View style={styles.liveDot} />
            <Text style={styles.confidenceText}>
              Multi-Sensor ML Fusion: {(room.occupancy.confidenceScore * 100).toFixed(0)}% Confidence
            </Text>
          </View>
        </Card>

        {/* Live Multi-Sensor Readout Grid */}
        <Text style={styles.sectionTitle}>Environmental & Occupancy Sensors</Text>
        <View style={styles.sensorGrid}>
          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>CLIMATE TEMPERATURE</Text>
            <Text style={styles.tileValue}>{room.sensors.temperature}°C</Text>
            <Text style={styles.tileSub}>Nominal 21°C - 24°C</Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>RELATIVE HUMIDITY</Text>
            <Text style={styles.tileValue}>{room.sensors.humidity}%</Text>
            <Text style={styles.tileSub}>Optimal Indoor Air</Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>AMBIENT LUX</Text>
            <Text style={styles.tileValue}>{room.sensors.ambientLight} Lux</Text>
            <Text style={styles.tileSub}>
              {room.sensors.ambientLight > 400 ? 'Daylight Available' : 'Perimeter Dimming'}
            </Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>ACOUSTIC / SOUND</Text>
            <Text style={styles.tileValue}>{room.sensors.soundLevel} dB</Text>
            <Text style={styles.tileSub}>
              {room.sensors.soundLevel > 50 ? 'Conversational Noise' : 'Quiet Environment'}
            </Text>
          </Card>
        </View>

        {/* Live Electrical & Load Metrics */}
        <Text style={styles.sectionTitle}>Electrical & Sub-metering</Text>
        <Card style={styles.electricalCard}>
          <View style={styles.powerMainRow}>
            <View>
              <Text style={styles.powerMainLabel}>CURRENT LIVE LOAD</Text>
              <Text style={styles.powerMainValue}>{room.electrical.livePowerWatts} W</Text>
            </View>
            <View style={styles.todayKwhBadge}>
              <Text style={styles.todayKwhLabel}>TODAY</Text>
              <Text style={styles.todayKwhValue}>{room.electrical.todayEnergyKwh} kWh</Text>
            </View>
          </View>

          <View style={styles.electricalSubGrid}>
            <View style={styles.subCol}>
              <Text style={styles.subColLabel}>VOLTAGE</Text>
              <Text style={styles.subColValue}>{room.electrical.voltageVolts} V</Text>
            </View>
            <View style={styles.subDivider} />
            <View style={styles.subCol}>
              <Text style={styles.subColLabel}>CURRENT</Text>
              <Text style={styles.subColValue}>{room.electrical.currentAmps} A</Text>
            </View>
            <View style={styles.subDivider} />
            <View style={styles.subCol}>
              <Text style={styles.subColLabel}>ACTIVE LOADS</Text>
              <Text style={styles.subColValue}>
                {room.electrical.activeApplianceCount} / {room.electrical.totalApplianceCount}
              </Text>
            </View>
          </View>
        </Card>

        {/* AI Recommendations */}
        <Text style={styles.sectionTitle}>AI Energy Recommendations</Text>
        {room.aiRecommendations.map((rec, idx) => (
          <Card key={idx} style={styles.recCard}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>{rec}</Text>
          </Card>
        ))}

        {/* Connected ESP32 Hardware & Relays */}
        <Text style={styles.sectionTitle}>
          Connected IoT Controllers & Relays ({devices.length})
        </Text>
        {devices.map(device => (
          <Card key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <View>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceId}>
                  {device.hardwareId} • RSSI: {device.telemetry.wifiRssi} dBm
                </Text>
              </View>
              <View style={styles.onlineBadge}>
                <Text style={styles.onlineText}>{device.status}</Text>
              </View>
            </View>

            <View style={styles.channelSection}>
              <Text style={styles.channelSectionTitle}>RELAY CHANNELS</Text>
              {device.channels.map(ch => (
                <View key={ch.channelId} style={styles.channelRow}>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelLabel}>{ch.label}</Text>
                    <Text style={styles.channelWatts}>
                      {ch.isOn ? `${ch.powerWatts} W • Active` : '0 W • Disconnected'}
                      {ch.safetyLocked ? ' (Safety Locked)' : ''}
                    </Text>
                  </View>
                  <Switch
                    value={ch.isOn}
                    disabled={ch.safetyLocked}
                    onValueChange={() => handleToggleChannel(device.id, ch.channelId, ch.label)}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={ch.isOn ? Colors.primary : Colors.textSubtle}
                  />
                </View>
              ))}
            </View>
          </Card>
        ))}

        {/* Recent Room Activities */}
        <Text style={styles.sectionTitle}>Recent Activity Log</Text>
        {room.recentActivities.map(activity => (
          <Card key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.timestamp}</Text>
            </View>
            <Text style={styles.activityDesc}>{activity.description}</Text>
          </Card>
        ))}
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
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  roomName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  locationTag: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  confidenceText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
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
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  sensorTile: {
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
  electricalCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  powerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  powerMainLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  powerMainValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  todayKwhBadge: {
    alignItems: 'flex-end',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayKwhLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.bold,
  },
  todayKwhValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  electricalSubGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
  },
  subCol: {
    flex: 1,
    alignItems: 'center',
  },
  subColLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  subColValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  subDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.infoLight,
    borderColor: Colors.border,
  },
  recDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  recText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.navyDark,
    lineHeight: 18,
  },
  deviceCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  deviceId: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  onlineBadge: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  onlineText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.success,
    fontWeight: Typography.weights.bold,
  },
  channelSection: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  channelSectionTitle: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  channelInfo: {
    flex: 1,
  },
  channelLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
  },
  channelWatts: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  activityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  activityTime: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  activityDesc: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
