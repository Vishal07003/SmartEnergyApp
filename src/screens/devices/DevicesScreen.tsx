import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, ChevronRight } from 'lucide-react-native';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer } from '../../components/common';
import { mockApi } from '../../services/api';
import { IoTDevice } from '../../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'DevicesTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const DevicesScreen: React.FC<Props> = ({ navigation }) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Online' | 'Offline'>('All');

  const loadDevices = async () => {
    try {
      const data = await mockApi.getDevices();
      setDevices(data);
    } catch {
      // Resilient error handling
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDevices();
  };

  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        dev.name.toLowerCase().includes(query) ||
        dev.roomName.toLowerCase().includes(query) ||
        dev.hardwareId.toLowerCase().includes(query);

      let matchesStatus = true;
      if (selectedFilter === 'Online') matchesStatus = dev.status === 'ONLINE';
      if (selectedFilter === 'Offline') matchesStatus = dev.status !== 'ONLINE';

      return matchesSearch && matchesStatus;
    });
  }, [devices, searchQuery, selectedFilter]);

  const handleToggleMaster = (device: IoTDevice, newState: boolean) => {
    if (device.status !== 'ONLINE') {
      Alert.alert('Device Offline', 'Cannot send commands to an offline device.');
      return;
    }

    setDevices(prev =>
      prev.map(d => {
        if (d.id === device.id) {
          return {
            ...d,
            channels: d.channels.map(ch => (ch.safetyLocked ? ch : { ...ch, isOn: newState })),
          };
        }
        return d;
      })
    );
  };

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
          <Text style={styles.title}>Devices</Text>
          <Text style={styles.countText}>{filteredDevices.length} devices</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Search size={16} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search devices or rooms..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Status Filters: All, Online, Offline */}
        <View style={styles.filterRow}>
          {(['All', 'Online', 'Offline'] as const).map(tab => {
            const isSelected = selectedFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedFilter(tab)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Devices List */}
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
          {filteredDevices.map(dev => {
            const isOnline = dev.status === 'ONLINE';
            const hasRelay = dev.channels.length > 0;
            const anyRelayOn = dev.channels.some(c => c.isOn);
            const totalWatts = dev.channels.reduce((s, c) => s + (c.isOn ? c.powerWatts : 0), 0);

            return (
              <TouchableOpacity
                key={dev.id}
                style={styles.deviceCard}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('DeviceDetails', { deviceId: dev.id, deviceName: dev.name })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.titleArea}>
                    <View style={styles.nameRow}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: isOnline ? Colors.primary : Colors.textMuted },
                        ]}
                      />
                      <Text style={styles.deviceName} numberOfLines={1}>
                        {dev.name.replace('ESP32 Node - ', '')}
                      </Text>
                    </View>
                    <Text style={styles.deviceRoom}>{dev.roomName}</Text>
                  </View>

                  {hasRelay && (
                    <View style={styles.switchArea}>
                      {isOnline ? (
                        <Switch
                          value={anyRelayOn}
                          onValueChange={val => handleToggleMaster(dev, val)}
                          trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                          thumbColor={anyRelayOn ? Colors.primary : Colors.textSubtle}
                        />
                      ) : (
                        <View style={styles.unavailableBadge}>
                          <Text style={styles.unavailableText}>OFFLINE</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.statusLabel}>
                    {isOnline ? 'Online' : 'Offline'}
                    {isOnline && totalWatts > 0 ? ` • ${totalWatts} W` : ''}
                  </Text>
                  <ChevronRight size={16} color={Colors.textSubtle} />
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredDevices.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No devices match the criteria</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
  filterChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  filterChipTextActive: {
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
  deviceCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    minHeight: 80,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  deviceName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  deviceRoom: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
    marginLeft: 16,
  },
  switchArea: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  unavailableBadge: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  unavailableText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  statusLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
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
