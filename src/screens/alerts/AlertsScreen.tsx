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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer } from '../../components/common';
import { AlertSummaryHeader, DetailedAlertCard } from '../../components/alerts';
import { mockApi } from '../../services/api';
import { AIAlert, AlertSeverity, AlertStatus } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Alerts'>;

export const AlertsScreen: React.FC<Props> = ({ navigation }) => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const loadAlerts = async () => {
    try {
      const data = await mockApi.getAlerts();
      setAlerts(data);
    } catch {
      Alert.alert('Error', 'Unable to retrieve AI alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const filterTabs = ['All', 'Critical', 'Warning', 'Info', 'Resolved'];

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        alert.title.toLowerCase().includes(q) ||
        alert.id.toLowerCase().includes(q) ||
        alert.roomName.toLowerCase().includes(q) ||
        (alert.deviceName && alert.deviceName.toLowerCase().includes(q));

      let matchesFilter = true;
      if (selectedFilter === 'Critical') {
        matchesFilter = alert.severity === 'CRITICAL' && alert.status !== 'RESOLVED';
      } else if (selectedFilter === 'Warning') {
        matchesFilter = alert.severity === 'WARNING' && alert.status !== 'RESOLVED';
      } else if (selectedFilter === 'Info') {
        matchesFilter = alert.severity === 'INFO' && alert.status !== 'RESOLVED';
      } else if (selectedFilter === 'Resolved') {
        matchesFilter = alert.status === 'RESOLVED';
      }

      return matchesSearch && matchesFilter;
    });
  }, [alerts, searchQuery, selectedFilter]);

  const counts = useMemo(() => {
    return {
      totalActive: alerts.filter(a => a.status !== 'RESOLVED').length,
      critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length,
      warning: alerts.filter(a => a.severity === 'WARNING' && a.status !== 'RESOLVED').length,
      info: alerts.filter(a => a.severity === 'INFO' && a.status !== 'RESOLVED').length,
      resolved: alerts.filter(a => a.status === 'RESOLVED').length,
    };
  }, [alerts]);

  const handleAlertPress = (alert: AIAlert) => {
    navigation.navigate('AlertDetails', {
      alertId: alert.id,
      alertTitle: alert.title,
    });
  };

  const handleAcknowledge = async (alert: AIAlert) => {
    await mockApi.acknowledgeAlert(alert.id);
    setAlerts(prev =>
      prev.map(a => (a.id === alert.id ? { ...a, isAcknowledged: true, status: 'ACKNOWLEDGED' } : a))
    );
    Alert.alert('Acknowledged', `Intervention for ${alert.roomName} acknowledged.`);
  };

  const handleResolve = (alert: AIAlert) => {
    Alert.alert(
      'Resolve Alert Confirmation',
      `[MOCK DEMO] Mark anomaly "${alert.title}" as resolved?\n\nThis will log compliance resolution in the facility telemetry records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Resolved',
          onPress: async () => {
            await mockApi.resolveAlert(alert.id);
            setAlerts(prev =>
              prev.map(a =>
                a.id === alert.id ? { ...a, status: 'RESOLVED', isAcknowledged: true } : a
              )
            );
            Alert.alert('Resolved (Demo)', `Alert ${alert.id} marked as RESOLVED.`);
          },
        },
      ]
    );
  };

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
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
        {/* Anomaly Engine Hero Banner */}
        <AlertSummaryHeader counts={counts} />

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search anomaly title, room, device or ID..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Severity Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsContainer}
        >
          {filterTabs.map(tab => {
            const isSelected = selectedFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(tab)}
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
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Status Count Label */}
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            Showing {filteredAlerts.length} Anomaly Records
          </Text>
        </View>

        {/* Detailed Alert Cards */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading AI anomalies...</Text>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No alerts found matching this filter.</Text>
          </View>
        ) : (
          filteredAlerts.map(alert => (
            <DetailedAlertCard
              key={alert.id}
              alert={alert}
              onPress={handleAlertPress}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
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
  filterPillsContainer: {
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
