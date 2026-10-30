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
  };

  if (loading || !room) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

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
            <View style={styles.titleArea}>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.locationTag}>
                Room {room.roomNumber} • {room.floor}
              </Text>
            </View>
            <OccupancyBadge state={room.occupancy.state} />
          </View>
        </Card>

        {/* Environmental Sensors */}
        <Text style={styles.sectionTitle}>Environmental Sensors</Text>
        <View style={styles.sensorGrid}>
          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>TEMPERATURE</Text>
            <Text style={styles.tileValue}>{room.sensors.temperature}°C</Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>HUMIDITY</Text>
            <Text style={styles.tileValue}>{room.sensors.humidity}%</Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>ILLUMINANCE</Text>
            <Text style={styles.tileValue}>{room.sensors.ambientLight} Lux</Text>
          </Card>

          <Card style={styles.sensorTile}>
            <Text style={styles.tileLabel}>ACOUSTICS</Text>
            <Text style={styles.tileValue}>{room.sensors.soundLevel} dB</Text>
          </Card>
        </View>

        {/* Electrical Metrics */}
        <Text style={styles.sectionTitle}>Electrical Load</Text>
        <Card style={styles.electricalCard}>
          <View style={styles.powerMainRow}>
            <View>
              <Text style={styles.powerMainLabel}>LIVE POWER</Text>
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
        {room.aiRecommendations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {room.aiRecommendations.map((rec, idx) => (
              <Card key={idx} style={styles.recCard}>
                <View style={styles.recDot} />
                <Text style={styles.recText}>{rec}</Text>
              </Card>
            ))}
          </>
        )}

        {/* Connected Relays */}
        <Text style={styles.sectionTitle}>Relay Controls</Text>
        {devices.map(device => (
          <Card key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceName}>{device.name}</Text>
              <Text style={styles.deviceStatusText}>{device.status}</Text>
            </View>

            {device.channels.map(ch => (
              <View key={ch.channelId} style={styles.channelRow}>
                <View style={styles.channelInfo}>
                  <Text style={styles.channelLabel}>{ch.label}</Text>
                  <Text style={styles.channelWatts}>
                    {ch.isOn ? `${ch.powerWatts} W` : 'OFF'}
                    {ch.safetyLocked ? ' • Locked' : ''}
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
  titleArea: {
    flex: 1,
  },
  roomName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  locationTag: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
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
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  electricalCard: {
    padding: Spacing.base,
    marginBottom: Spacing.xs,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayKwhLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  todayKwhValue: {
    fontSize: Typography.sizes.xs,
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
    marginBottom: 2,
  },
  subColValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  subDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  recCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.border,
  },
  recDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
    marginTop: 5,
    marginRight: Spacing.sm,
  },
  recText: {
    flex: 1,
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    lineHeight: 16,
  },
  deviceCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  deviceName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  deviceStatusText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
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
  },
});
