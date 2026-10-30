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
      'Simulated Hardware Relay Trigger',
      `[MOCK DEMO] Master power relay for room was switched ${newState ? 'ON' : 'OFF'}.\n\nNote: In production, commands are queued via MQTT to the assigned ESP32 node and confirmed only after hardware ACK.`
    );
  };

  const handleTakeAction = (alert: AIAlert) => {
    Alert.alert(
      'Simulated Automation Action',
      `[MOCK DEMO] AI recommendation action triggered for ${alert.roomName}.\n\nSimulated action: ${alert.recommendedAction}\n\nActual ESP32 hardware remains unaffected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Action',
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
      'Campus Eco-Sweep Confirmation',
      '[MOCK DEMO] Initiate automated scan of all vacant rooms across Academic Block 4 to isolate idle loads (lights, fans, idle workstations)?\n\nSafety Check: Critical servers and test racks will remain protected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Execute Eco-Sweep',
          onPress: () => {
            Alert.alert(
              'Eco-Sweep Completed (Demo)',
              'Simulated command dispatched. 3 idle rooms isolated. Estimated power reduction: 1,340 W.'
            );
          },
        },
      ]
    );
  };

  const handleOverrideTimers = () => {
    Alert.alert(
      'Override Vacancy Timers',
      '[MOCK DEMO] Suspend automated idle-transition cutoffs across classrooms for next 60 minutes for campus events?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enable 60m Override',
          onPress: () => {
            Alert.alert(
              'Automation Overridden (Demo)',
              'Vacancy auto-shutdown timers paused until 16:00.'
            );
          },
        },
      ]
    );
  };

  if (loading || !user || !metrics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Synchronizing ESP32 Gateway Telemetry...</Text>
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
        {/* 1. Header with Greeting, ESP32 Gateway Pill & Notification Bell */}
        <DashboardHeader
          staffName={user.name}
          department={user.department}
          assignedBlock={user.assignedBlock}
          gatewayStatus="ESP32 Gateway Node #04 – Synced 12s ago"
          alertCount={unackAlerts.length}
          onPressAlerts={() => navigation.navigate('Alerts')}
          onPressProfile={() => navigation.navigate('MainApp', { screen: 'ProfileTab' })}
        />

        <View style={styles.innerContent}>
          {/* 2. Hero Dark Navy Consumption Card */}
          <HeroConsumptionCard
            consumptionKwh={metrics.todayConsumptionKwh}
            liveWatts={metrics.liveSystemPowerWatts}
            vsYesterdayPercent={-8.4}
            targetBudgetKwh={180}
          />

          {/* 3. 4-Tile Quick Metric Grid */}
          <MetricGrid
            activeRooms={metrics.totalActiveRooms}
            totalRooms={metrics.totalActiveRooms + metrics.totalEmptyRooms}
            emptyRooms={metrics.totalEmptyRooms}
            connectedDevices={metrics.totalConnectedDevices}
            deviceUptimePercent={98.4}
            activeAnomalies={unackAlerts.length}
          />

          {/* 4. Automated AI Interventions Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Automated AI Interventions</Text>
              <Text style={styles.sectionSubtitle}>Real-time heuristic & ML detections</Text>
            </View>
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

          {/* 5. Campus Hourly Energy Consumption Profile (Bar Chart) */}
          <EnergyBarChart
            data={metrics.hourlyTrends}
            peakHourLabel="Peak at 11:00"
            style={styles.chartSpacing}
          />

          {/* 6. Rooms Overview Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Rooms Overview</Text>
              <Text style={styles.sectionSubtitle}>Classrooms & Labs live occupancy</Text>
            </View>
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

          {/* 7. Institutional Actions Toolbar */}
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
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xxl,
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
    fontWeight: Typography.weights.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  chartSpacing: {
    marginVertical: Spacing.md,
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
    height: 48,
    borderRadius: BorderRadius.md,
  },
  overrideBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
  },
});
