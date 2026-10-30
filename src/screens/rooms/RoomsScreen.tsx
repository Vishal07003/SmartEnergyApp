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

  const floorOptions = useMemo(() => {
    const floors = Array.from(new Set(rooms.map(r => r.floor)));
    return ['All', ...floors];
  }, [rooms]);

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
      `[MOCK DEMO] Turn off ${room.electrical.activeApplianceCount} active loads in ${room.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Shutdown',
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
          },
        },
      ]
    );
  };

  const handleToggleMasterRelay = (roomId: string, newState: boolean) => {
    setRooms(prev =>
      prev.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            electrical: {
              ...r.electrical,
              livePowerWatts: newState ? 850 : 25,
            },
          };
        }
        return r;
      })
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
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search room or lab..."
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

        {/* Hardware Status Banner */}
        <HardwareSensorSummaryBanner
          totalSensors={rooms.length * 4}
          overallConfidence={96.2}
        />

        {/* List Header */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filteredRooms.length} Rooms</Text>
          <Text style={styles.activeRatio}>
            {rooms.filter(r => r.occupancy.state === 'ACTIVE').length} Active
          </Text>
        </View>

        {/* List of Detailed Room Cards */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : filteredRooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No matching rooms found.</Text>
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
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  searchBar: {
    marginBottom: Spacing.xs,
  },
  searchInput: {
    height: 42,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
  },
  filterPillContainer: {
    paddingBottom: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
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
    marginBottom: Spacing.xs,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  activeRatio: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  emptyContainer: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
