import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Thermometer, Droplets, Sun, ChevronRight } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, OccupancyBadge, Card } from '../../components/common';
import { mockApi } from '../../services/api';
import { Room, IoTDevice, AIAlert } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'RoomDetails'>;

export const RoomDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { roomId } = route.params;
  const [room, setRoom] = useState<Room | null>(null);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [foundRoom, allDevices, allAlerts] = await Promise.all([
          mockApi.getRoomById(roomId),
          mockApi.getDevices(),
          mockApi.getAlerts(),
        ]);
        if (foundRoom) {
          setRoom(foundRoom);
          setDevices(allDevices.filter(d => foundRoom.connectedDeviceIds.includes(d.id)));
          setAlerts(allAlerts.filter(a => a.roomId === roomId && !a.isAcknowledged));
        }
      } catch {
        // Handled via fallback
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [roomId]);

  const handleToggleChannel = (deviceId: string, channelId: number) => {
    setDevices(prevDevices =>
      prevDevices.map(d => {
        if (d.id === deviceId) {
          return {
            ...d,
            channels: d.channels.map(ch => {
              if (ch.channelId === channelId && !ch.safetyLocked) {
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
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Room Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.roomSubtitle}>Room {room.roomNumber} • {room.floor}</Text>
            </View>
            <OccupancyBadge state={room.occupancy.state} />
          </View>

          <View style={styles.energyRow}>
            <View>
              <Text style={styles.statLabel}>LIVE DEMAND</Text>
              <Text style={styles.statValue}>{room.electrical.livePowerWatts} W</Text>
            </View>
            <View style={styles.statDivider} />
            <View>
              <Text style={styles.statLabel}>TODAY</Text>
              <Text style={styles.statValue}>{room.electrical.todayEnergyKwh.toFixed(1)} kWh</Text>
            </View>
            <View style={styles.statDivider} />
            <View>
              <Text style={styles.statLabel}>LOADS</Text>
              <Text style={styles.statValue}>{room.electrical.activeApplianceCount} Active</Text>
            </View>
          </View>
        </View>

        {/* 2. Important Alerts */}
        {alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alerts ({alerts.length})</Text>
            {alerts.map(alert => (
              <TouchableOpacity
                key={alert.id}
                style={[styles.alertCard, alert.severity === 'CRITICAL' && styles.alertCrit]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id, alertTitle: alert.title })}
              >
                <View style={styles.alertLeft}>
                  <View
                    style={[
                      styles.alertDot,
                      { backgroundColor: alert.severity === 'CRITICAL' ? Colors.danger : Colors.warning },
                    ]}
                  />
                  <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSubtle} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 3. Relevant Sensors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensors</Text>
          <View style={styles.sensorGrid}>
            <View style={styles.sensorCard}>
              <Thermometer size={16} color={Colors.primary} />
              <Text style={styles.sensorValue}>{room.sensors.temperature}°C</Text>
              <Text style={styles.sensorLabel}>Temperature</Text>
            </View>
            <View style={styles.sensorCard}>
              <Droplets size={16} color={Colors.info} />
              <Text style={styles.sensorValue}>{room.sensors.humidity}%</Text>
              <Text style={styles.sensorLabel}>Humidity</Text>
            </View>
            <View style={styles.sensorCard}>
              <Sun size={16} color={Colors.warning} />
              <Text style={styles.sensorValue}>{room.sensors.ambientLight} lx</Text>
              <Text style={styles.sensorLabel}>Ambient Light</Text>
            </View>
          </View>
        </View>

        {/* 4. Connected Devices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devices ({devices.length})</Text>
          {devices.map(dev => (
            <View key={dev.id} style={styles.deviceCard}>
              <TouchableOpacity
                style={styles.deviceHeader}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('DeviceDetails', { deviceId: dev.id, deviceName: dev.name })}
              >
                <View style={styles.deviceTitleRow}>
                  <View
                    style={[
                      styles.deviceDot,
                      { backgroundColor: dev.status === 'ONLINE' ? Colors.primary : Colors.textMuted },
                    ]}
                  />
                  <Text style={styles.deviceName}>{dev.name.replace('ESP32 Node - ', '')}</Text>
                </View>
                <ChevronRight size={16} color={Colors.textSubtle} />
              </TouchableOpacity>

              {/* Relay Controls */}
              {dev.channels.map(ch => (
                <View key={ch.channelId} style={styles.channelRow}>
                  <View style={styles.channelInfo}>
                    <Text style={styles.channelLabel}>{ch.label}</Text>
                    {ch.safetyLocked ? (
                      <Text style={styles.channelSub}>Safety Locked</Text>
                    ) : (
                      <Text style={styles.channelSub}>{ch.isOn ? `${ch.powerWatts} W` : 'OFF'}</Text>
                    )}
                  </View>
                  <Switch
                    value={ch.isOn}
                    disabled={ch.safetyLocked || dev.status !== 'ONLINE'}
                    onValueChange={() => handleToggleChannel(dev.id, ch.channelId)}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={ch.isOn ? Colors.primary : Colors.textSubtle}
                  />
                </View>
              ))}
            </View>
          ))}
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
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  roomTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  roomSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  energyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginTop: 2,
  },
  statDivider: {
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  alertCrit: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  alertTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  sensorGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sensorCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    alignItems: 'center',
  },
  sensorValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginVertical: 4,
  },
  sensorLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  deviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
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
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    fontWeight: Typography.weights.medium,
  },
  channelSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
