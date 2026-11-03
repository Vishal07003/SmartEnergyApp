import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Zap, ArrowUpRight, ArrowDownRight, Bell, ChevronRight } from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, Card } from '../../components/common';
import { EnergyBarChart } from '../../components/charts';
import { mockApi } from '../../services/api';
import { StaffUser, SystemEnergyMetrics, Room, AIAlert } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [user, setUser] = useState<StaffUser | null>(null);
  const [metrics, setMetrics] = useState<SystemEnergyMetrics | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);

  const loadData = async () => {
    try {
      const [userData, metricData, roomList, alertList] = await Promise.all([
        mockApi.getStaffProfile(),
        mockApi.getDashboardMetrics(),
        mockApi.getRooms(),
        mockApi.getAlerts(),
      ]);
      setUser(userData);
      setMetrics(metricData);
      setRooms(roomList);
      setAlerts(alertList);
    } catch {
      // Keep UI clean, handled via fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !user || !metrics) {
    return (
      <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  const unackAlerts = alerts.filter(a => !a.isAcknowledged);
  const isSaving = true; // vs yesterday

  return (
    <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Smart Energy Manager</Text>
            <Text style={styles.subTitle}>{user.assignedBlock} • {user.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.alertBtn}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.7}
          >
            <Bell size={20} color={Colors.navy} />
            {unackAlerts.length > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertCount}>{unackAlerts.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* 1. Total Energy Consumption Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Text style={styles.heroLabel}>TODAY'S ENERGY</Text>
            <View style={styles.trendPill}>
              {isSaving ? (
                <ArrowDownRight size={14} color={Colors.emeraldAccent} />
              ) : (
                <ArrowUpRight size={14} color={Colors.danger} />
              )}
              <Text style={styles.trendText}>8.4% vs Yesterday</Text>
            </View>
          </View>

          <View style={styles.heroMain}>
            <Text style={styles.heroValue}>{metrics.todayConsumptionKwh.toFixed(1)}</Text>
            <Text style={styles.heroUnit}>kWh</Text>
            <View style={styles.liveDemand}>
              <Zap size={14} color="#34D399" />
              <Text style={styles.liveDemandText}>+{metrics.liveSystemPowerWatts.toLocaleString()} W</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min((metrics.todayConsumptionKwh / 180) * 100, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.targetLabel}>Target: 180 kWh</Text>
        </View>

        {/* 2. Key Metrics Row: Active Rooms & Online Devices */}
        <View style={styles.metricRow}>
          <TouchableOpacity
            style={styles.metricTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainApp', { screen: 'RoomsTab' })}
          >
            <Text style={styles.metricLabel}>ACTIVE ROOMS</Text>
            <Text style={styles.metricValue}>
              {metrics.totalActiveRooms}
              <Text style={styles.metricTotal}> / {metrics.totalActiveRooms + metrics.totalEmptyRooms}</Text>
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statusText}>{metrics.totalEmptyRooms} Empty</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricTile}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainApp', { screen: 'DevicesTab' })}
          >
            <Text style={styles.metricLabel}>ONLINE DEVICES</Text>
            <Text style={styles.metricValue}>{metrics.totalConnectedDevices}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statusText}>98.4% Connected</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. Small Energy Usage Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hourly Usage</Text>
          <EnergyBarChart data={metrics.hourlyTrends} peakHourLabel="Peak: 11:00" />
        </View>

        {/* 4. Important Alerts (if any) */}
        {unackAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alerts</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                <Text style={styles.viewLink}>View All ({unackAlerts.length})</Text>
              </TouchableOpacity>
            </View>

            {unackAlerts.slice(0, 2).map(alert => (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertItem,
                  alert.severity === 'CRITICAL' && styles.alertCrit,
                ]}
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
                  <View style={styles.alertTextWrap}>
                    <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                    <Text style={styles.alertMeta}>{alert.roomName} • {alert.timestamp}</Text>
                  </View>
                </View>
                <ChevronRight size={16} color={Colors.textSubtle} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 5. Recent Important Activity / Rooms Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainApp', { screen: 'RoomsTab' })}>
              <Text style={styles.viewLink}>View Rooms</Text>
            </TouchableOpacity>
          </View>

          {rooms.slice(0, 3).map(room => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomItem}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RoomDetails', { roomId: room.id, roomName: room.name })}
            >
              <View style={styles.roomLeft}>
                <View
                  style={[
                    styles.roomDot,
                    {
                      backgroundColor:
                        room.occupancy.state === 'ACTIVE'
                          ? Colors.primary
                          : room.occupancy.state === 'IDLE_TRANSITION'
                            ? Colors.warning
                            : Colors.textMuted,
                    },
                  ]}
                />
                <View>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomSub}>
                    {room.occupancy.state === 'ACTIVE' ? 'Active' : room.occupancy.state === 'IDLE_TRANSITION' ? 'Idle' : 'Empty'}
                  </Text>
                </View>
              </View>
              <View style={styles.roomRight}>
                <Text style={styles.roomWatts}>{room.electrical.livePowerWatts} W</Text>
                <ChevronRight size={16} color={Colors.textSubtle} />
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  welcome: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  subTitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  alertBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  alertCount: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
  },
  heroCard: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  trendText: {
    fontSize: Typography.sizes.xs,
    color: '#34D399',
    fontWeight: Typography.weights.semibold,
  },
  heroMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroValue: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.black,
    color: Colors.textInverse,
  },
  heroUnit: {
    fontSize: Typography.sizes.base,
    color: '#94A3B8',
    marginLeft: 6,
    marginRight: 'auto',
  },
  liveDemand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  liveDemandText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.emeraldAccent,
    borderRadius: 3,
  },
  targetLabel: {
    fontSize: Typography.sizes.xs,
    color: '#94A3B8',
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  metricTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  metricLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginVertical: Spacing.xs,
  },
  metricTotal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.regular,
    color: Colors.textMuted,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  viewLink: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertCrit: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  alertMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  roomName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  roomSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  roomRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomWatts: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
});
