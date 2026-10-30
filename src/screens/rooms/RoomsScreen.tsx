import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer } from '../../components/common';
import { DetailedRoomCard, HardwareSensorSummaryBanner } from '../../components/rooms';
import { mockApi } from '../../services/api';
import { Room } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'RoomsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const RoomsScreen: React.FC<Props> = ({ navigation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('All');

  const loadRooms = async () => {
    try {
      const data = await mockApi.getRooms();
      setRooms(data);
    } catch {
      Alert.alert('Error', 'Unable to retrieve room sensor records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRooms();
  };

  // Distinct floors for filtering
  const floorOptions = useMemo(() => {
    const floors = Array.from(new Set(rooms.map(r => r.floor)));
    return ['All', ...floors];
  }, [rooms]);

  // Filtered rooms based on search text and selected floor
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFloor =
        selectedFloor === 'All' || room.floor === selectedFloor;

      return matchesSearch && matchesFloor;
    });
  }, [rooms, searchQuery, selectedFloor]);

  const handleRoomPress = (room: Room) => {
    navigation.navigate('RoomDetails', { roomId: room.id, roomName: room.name });
  };

  const handleAutoShutdown = (room: Room) => {
    Alert.alert(
      'Confirm Auto-Shutdown',
      `[MOCK DEMO] Execute vacancy power-cut protocol for ${room.name}?\n\nThis will safely de-energize ${room.electrical.activeApplianceCount} active loads (fans/monitors) via the assigned ESP32 relay.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Shutdown Now',
          style: 'destructive',
          onPress: () => {
            setRooms(prev =>
              prev.map(r => {
                if (r.id === room.id) {
                  return {
                    ...r,
                    occupancy: {
                      ...r.occupancy,
                      state: 'EMPTY',
                      idleTimerMinutes: 0,
                    },
                    electrical: {
                      ...r.electrical,
                      livePowerWatts: 35,
                      activeApplianceCount: 0,
                    },
                  };
                }
                return r;
              })
            );
            Alert.alert(
              'Automation Dispatched (Demo)',
              `${room.name} transitioned to EMPTY. Estimated savings: ${room.electrical.livePowerWatts} W.`
            );
          },
        },
      ]
    );
  };

  const handleToggleMasterRelay = (roomId: string, newState: boolean) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id === roomId) {
          const updatedWatts = newState ? 950 : 25;
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
      'Simulated Relay Command',
      `[MOCK DEMO] Master circuit switch turned ${newState ? 'ON' : 'OFF'}.\n\nCommand logged to institutional gateway mock telemetry.`
    );
  };

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
        {/* Header Title Section */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Rooms Monitoring</Text>
          <Text style={styles.screenSubtitle}>
            Academic Block 4 • Engineering Complex • Live Telemetry
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search room name, lab, or number..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Floor Filter Horizontal Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillContainer}
        >
          {floorOptions.map(floor => {
            const isSelected = selectedFloor === floor;
            return (
              <TouchableOpacity
                key={floor}
                activeOpacity={0.8}
                onPress={() => setSelectedFloor(floor)}
                style={[
                  styles.filterPill,
                  isSelected ? styles.filterPillActive : styles.filterPillInactive,
                ]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected ? styles.filterTextActive : styles.filterTextInactive,
                  ]}
                >
                  {floor}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ESP32 Multi-Sensor Hardware Status Banner */}
        <HardwareSensorSummaryBanner
          totalSensors={rooms.length * 4}
          overallConfidence={96.2}
        />

        {/* Status Counts Header */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing {filteredRooms.length} of {rooms.length} Spaces
          </Text>
          <Text style={styles.activeRatio}>
            {rooms.filter(r => r.occupancy.state === 'ACTIVE').length} In Session
          </Text>
        </View>

        {/* List of Detailed Room Cards */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading sensor telemetry...</Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching rooms or labs found.</Text>
          </View>
        ) : (
          filteredRooms.map(room => (
            <DetailedRoomCard
              key={room.id}
              room={room}
              onPress={handleRoomPress}
              onAutoShutdown={handleAutoShutdown}
              onToggleMasterRelay={handleToggleMasterRelay}
            />
          ))
        )}
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
  header: {
    marginBottom: Spacing.md,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  screenSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchBar: {
    marginBottom: Spacing.sm,
  },
  searchInput: {
    height: 46,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.base,
    color: Colors.textMain,
  },
  filterPillContainer: {
    paddingBottom: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    borderWidth: 1,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  filterPillText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  filterTextActive: {
    color: Colors.textInverse,
  },
  filterTextInactive: {
    color: Colors.textMuted,
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMain,
  },
  activeRatio: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
