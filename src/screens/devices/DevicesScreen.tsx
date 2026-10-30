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
import {
  DeviceCampusLoadBanner,
  DetailedDeviceCard,
  QuickDeviceConfig,
} from '../../components/devices';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadDevices = async () => {
    try {
      const data = await mockApi.getDevices();
      setDevices(data);
    } catch {
      Alert.alert('Error', 'Unable to load connected devices.');
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

  // Category filter tabs based on reference design: All, Labs, Lights, Fans & HVAC
  const categoryFilters = ['All', 'Labs', 'Lights', 'Fans & HVAC'];

  const filteredDevices = useMemo(() => {
    return devices.filter(dev => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        dev.name.toLowerCase().includes(query) ||
        dev.hardwareId.toLowerCase().includes(query) ||
        dev.roomName.toLowerCase().includes(query) ||
        dev.type.toLowerCase().includes(query);

      let matchesCat = true;
      if (selectedCategory === 'Labs') {
        matchesCat = dev.type === 'ESP32_NODE' || dev.type === 'CURRENT_SENSOR' || dev.name.includes('Lab');
      } else if (selectedCategory === 'Lights') {
        matchesCat = dev.type === 'LIGHTING_BANK' || dev.name.includes('Lighting') || dev.channels.some(c => c.label.includes('Light') || c.label.includes('LED'));
      } else if (selectedCategory === 'Fans & HVAC') {
        matchesCat = dev.type === 'HVAC_FAN_CONTROLLER' || dev.channels.some(c => c.label.includes('Fan') || c.label.includes('Air') || c.label.includes('Blower'));
      }

      return matchesSearch && matchesCat;
    });
  }, [devices, searchQuery, selectedCategory]);

  const handleDevicePress = (device: IoTDevice) => {
    navigation.navigate('DeviceDetails', {
      deviceId: device.id,
      deviceName: device.name,
    });
  };

  const handleToggleMaster = (device: IoTDevice, newState: boolean) => {
    Alert.alert(
      'Hardware Controller Switch',
      `[MOCK DEMO] Turn ${newState ? 'ON' : 'OFF'} all controllable channels on "${device.name}"?\n\nSafety check: Any channels designated as safety-locked will remain unaffected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Toggle',
          onPress: () => {
            setDevices(prev =>
              prev.map(d => {
                if (d.id === device.id) {
                  return {
                    ...d,
                    channels: d.channels.map(ch => {
                      if (!ch.safetyLocked) {
                        return { ...ch, isOn: newState };
                      }
                      return ch;
                    }),
                  };
                }
                return d;
              })
            );
            Alert.alert(
              'Relay State Updated (Demo)',
              `Command sent to hardware ID ${device.hardwareId}. Active loads adjusted.`
            );
          },
        },
      ]
    );
  };

  const totalLiveWatts = devices.reduce(
    (sum, d) => sum + d.channels.reduce((chSum, ch) => chSum + (ch.isOn ? ch.powerWatts : 0), 0),
    0
  );

  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const warningCount = devices.filter(d => d.status === 'DEGRADED').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;

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
        {/* Title Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Device Management</Text>
          <Text style={styles.screenSubtitle}>
            186 Connected Electrical Appliances • 22 Nodes Monitored
          </Text>
        </View>

        {/* Search Input Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search appliance, node ID, or room..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Category Horizontal Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillContainer}
        >
          {categoryFilters.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
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
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Campus Live Power & Node Counter Summary */}
        <DeviceCampusLoadBanner
          liveWatts={totalLiveWatts}
          totalDevices={devices.length}
          onlineCount={onlineCount}
          warningCount={warningCount}
          offlineCount={offlineCount}
        />

        {/* Device Cards Section */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing {filteredDevices.length} Connected Controllers
          </Text>
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading device controllers...</Text>
          </View>
        ) : filteredDevices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No devices match your search or filter.</Text>
          </View>
        ) : (
          filteredDevices.map(device => (
            <DetailedDeviceCard
              key={device.id}
              device={device}
              onPress={handleDevicePress}
              onToggleMaster={handleToggleMaster}
            />
          ))
        )}

        {/* Quick ESP32 Device Configuration Section */}
        <QuickDeviceConfig />
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
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
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
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
});
