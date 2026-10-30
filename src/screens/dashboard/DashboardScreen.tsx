import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button, AppScreenContainer } from '../../components/common';
import {
  DashboardHeader,
  HeroConsumptionCard,
  MetricGrid,
  AIInterventionCard,
  RoomOverviewCard,
} from '../../components/dashboard';
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

  const loadDashboardData = async () => {
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
      Alert.alert('Telemetry Error', 'Failed to synchronize with ESP32 gateway telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleRoomPress = (room: Room) => {
    navigation.navigate('RoomDetails', { roomId: room.id, roomName: room.name });
  };

  const handleToggleMasterRelay = (roomId: string, newState: boolean) => {
    setRooms(prevRooms =>
      prevRooms.map(r => {
        if (r.id === roomId) {
          const updatedWatts = newState ? 850 : 25;
          return {
            ...r,
            electrical: {
              ...r.electrical,
              livePowerWatts: updatedWatts,
            },
          };
        }
        return r;
      })
    );

    Alert.alert(
      'Hardware Relay Trigger',
      `[MOCK DEMO] Master power relay switched ${newState ? 'ON' : 'OFF'}.\n\nCommand dispatched via MQTT.`
    );
  };

  const handleTakeAction = (alert: AIAlert) => {
    Alert.alert(
      'Automated Action',
      `[MOCK DEMO] Execute: ${alert.recommendedAction}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            mockApi.acknowledgeAlert(alert.id);
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
          },
        },
      ]
    );
  };

  const handleCampusEcoSweep = () => {
    Alert.alert(
      'Campus Eco-Sweep',
      '[MOCK DEMO] De-energize non-essential loads in all empty rooms?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute',
          onPress: () => {
            Alert.alert('Completed', '3 idle rooms isolated. Saved ~1,340 W.');
          },
        },
      ]
    );
  };

  const handleOverrideTimers = () => {
    Alert.alert(
      'Override Timers',
      '[MOCK DEMO] Pause vacancy timers for the next 60 minutes?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Override',
          onPress: () => {
            Alert.alert('Enabled', 'Timers paused for 60m.');
          },
        },
      ]
    );
  };

  if (loading || !user || !metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Synchronizing Gateway Telemetry...</Text>
      </View>
    );
  }

  const unackAlerts = alerts.filter(a => !a.isAcknowledged);

  return (
    <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
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
        {/* 1. Header */}
        <DashboardHeader
          staffName={user.name}
          department={user.department}
          assignedBlock={user.assignedBlock}
          gatewayStatus="Node #04 • Synced"
          alertCount={unackAlerts.length}
          onPressAlerts={() => navigation.navigate('Alerts')}
          onPressProfile={() => navigation.navigate('MainApp', { screen: 'ProfileTab' })}
        />

        <View style={styles.innerContent}>
          {/* 2. Hero Consumption Card */}
          <HeroConsumptionCard
            consumptionKwh={metrics.todayConsumptionKwh}
            liveWatts={metrics.liveSystemPowerWatts}
            vsYesterdayPercent={-8.4}
            targetBudgetKwh={180}
          />

          {/* 3. Metric Grid */}
          <MetricGrid
            activeRooms={metrics.totalActiveRooms}
            totalRooms={metrics.totalActiveRooms + metrics.totalEmptyRooms}
            emptyRooms={metrics.totalEmptyRooms}
            connectedDevices={metrics.totalConnectedDevices}
            deviceUptimePercent={98.4}
            activeAnomalies={unackAlerts.length}
          />

          {/* 4. Automated AI Interventions */}
          {unackAlerts.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>AI Interventions</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                  <Text style={styles.viewAllText}>View All ({alerts.length})</Text>
                </TouchableOpacity>
              </View>

              {unackAlerts.slice(0, 2).map(alert => (
                <AIInterventionCard
                  key={alert.id}
                  alert={alert}
                  onTakeAction={handleTakeAction}
                />
              ))}
            </>
          )}

          {/* 5. Campus Hourly Load Chart */}
          <EnergyBarChart
            data={metrics.hourlyTrends}
            peakHourLabel="Peak: 11:00"
            style={styles.chartSpacing}
          />

          {/* 6. Rooms Overview */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Rooms Overview</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MainApp', { screen: 'RoomsTab' })}>
              <Text style={styles.viewAllText}>View All ({rooms.length}) ›</Text>
            </TouchableOpacity>
          </View>

          {rooms.map(room => (
            <RoomOverviewCard
              key={room.id}
              room={room}
              onPress={handleRoomPress}
              onToggleMasterRelay={handleToggleMasterRelay}
            />
          ))}

          {/* 7. Action Bar */}
          <View style={styles.actionsBar}>
            <Button
              title="Campus Eco-Sweep"
              onPress={handleCampusEcoSweep}
              variant="primary"
              style={styles.sweepBtn}
            />
            <Button
              title="Override Timers"
              onPress={handleOverrideTimers}
              variant="outline"
              style={styles.overrideBtn}
            />
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
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  innerContent: {
    paddingHorizontal: Spacing.base,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  chartSpacing: {
    marginVertical: Spacing.sm,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
  sweepBtn: {
    flex: 1.2,
    marginRight: Spacing.sm,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  overrideBtn: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
  },
});
