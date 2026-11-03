import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, ChevronRight } from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, OccupancyBadge } from '../../components/common';
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
      // Keep UI resilient
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
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFloor = selectedFloor === 'All' || room.floor === selectedFloor;
      return matchesSearch && matchesFloor;
    });
  }, [rooms, searchQuery, selectedFloor]);

  if (loading) {
    return (
      <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  return (
    <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rooms</Text>
          <Text style={styles.countText}>{filteredRooms.length} rooms</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rooms..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Floor Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.floorTabs}
          contentContainerStyle={styles.floorTabsContent}
        >
          {floorOptions.map(floor => {
            const isSelected = selectedFloor === floor;
            return (
              <TouchableOpacity
                key={floor}
                style={[styles.floorChip, isSelected && styles.floorChipActive]}
                onPress={() => setSelectedFloor(floor)}
                activeOpacity={0.8}
              >
                <Text style={[styles.floorChipText, isSelected && styles.floorChipTextActive]}>
                  {floor}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Rooms List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
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
          {filteredRooms.map(room => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('RoomDetails', { roomId: room.id, roomName: room.name })}
            >
              <View style={styles.cardMain}>
                <View style={styles.nameRow}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <OccupancyBadge state={room.occupancy.state} />
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.roomMeta}>
                    Room {room.roomNumber} • {room.floor}
                  </Text>
                  <View style={styles.energyWrap}>
                    <Text style={styles.energyValue}>{room.electrical.livePowerWatts} W</Text>
                    <ChevronRight size={16} color={Colors.textSubtle} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredRooms.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No matching rooms found</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textMain,
    marginLeft: Spacing.xs,
    paddingVertical: 0,
  },
  floorTabs: {
    maxHeight: 44,
    marginBottom: Spacing.sm,
  },
  floorTabsContent: {
    gap: Spacing.xs,
    paddingRight: Spacing.base,
    alignItems: 'center',
  },
  floorChip: {
    paddingHorizontal: 16,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  floorChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  floorChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  floorChipTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  roomCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    minHeight: 76,
    justifyContent: 'center',
  },
  cardMain: {
    gap: Spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  roomMeta: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  energyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  energyValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
