import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { ChevronRight, ArrowLeft } from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, Skeleton } from '../../components/common';
import { mockApi } from '../../services/api';
import { AIAlert } from '../../types';

export const AlertsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Critical' | 'Warning'>('All');

  const loadAlerts = async () => {
    try {
      const data = await mockApi.getAlerts();
      setAlerts(data);
    } catch {
      // Fallback
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

  const handleAcknowledge = async (id: string, e: any) => {
    e.stopPropagation();
    try {
      await mockApi.acknowledgeAlert(id);
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, isAcknowledged: true } : a))
      );
    } catch {
      // Optimistic update if backend error
      setAlerts(prev =>
        prev.map(a => (a.id === id ? { ...a, isAcknowledged: true } : a))
      );
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(a => {
      if (selectedFilter === 'Critical') return a.severity === 'CRITICAL';
      if (selectedFilter === 'Warning') return a.severity === 'WARNING';
      return true;
    });
  }, [alerts, selectedFilter]);

  if (loading) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset={false} backgroundColor={Colors.background}>
        {/* Navigation Bar Skeleton */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Alerts</Text>
          <View style={styles.navSpacer} />
        </View>

        <View style={styles.container}>
          {/* Header Skeleton */}
          <View style={styles.header}>
            <Skeleton width={100} height={26} borderRadius={6} />
            <Skeleton width={80} height={14} borderRadius={4} />
          </View>

          {/* Filter Row Skeleton */}
          <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.base, gap: 8, marginBottom: Spacing.md }}>
            <Skeleton width={64} height={32} borderRadius={16} />
            <Skeleton width={80} height={32} borderRadius={16} />
            <Skeleton width={80} height={32} borderRadius={16} />
          </View>

          {/* Alert Cards Skeleton */}
          <View style={{ paddingHorizontal: Spacing.base, gap: Spacing.sm }}>
            {[1, 2, 3].map(idx => (
              <View
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Skeleton width={60} height={20} borderRadius={4} />
                    <Skeleton width={50} height={12} borderRadius={4} />
                  </View>
                  <Skeleton width={80} height={28} borderRadius={8} />
                </View>
                <Skeleton width="80%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="50%" height={12} borderRadius={4} />
              </View>
            ))}
          </View>
        </View>
      </AppScreenContainer>
    );
  }

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset={false} backgroundColor={Colors.background}>
      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.navy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Alerts</Text>
        <View style={styles.navSpacer} />
      </View>

      <View style={styles.container}>
        {/* Sub-header counter & filter */}
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.countText}>
            {alerts.filter(a => !a.isAcknowledged).length} pending
          </Text>
        </View>

        {/* Severity Filters */}
        <View style={styles.filterRow}>
          {(['All', 'Critical', 'Warning'] as const).map(tab => {
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

        {/* Alerts List */}
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
          {filteredAlerts.map(alert => {
            const isCrit = alert.severity === 'CRITICAL';
            const isWarn = alert.severity === 'WARNING';
            const formattedTime = (() => {
              try {
                const d = new Date(alert.timestamp);
                if (!isNaN(d.getTime())) {
                  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                }
              } catch {}
              // Fallback: extract HH:MM from ISO string
              const tIdx = alert.timestamp.indexOf('T');
              if (tIdx !== -1) return alert.timestamp.slice(tIdx + 1, tIdx + 6);
              return alert.timestamp.slice(0, 5);
            })();

            return (
              <TouchableOpacity
                key={alert.id}
                style={[
                  styles.alertCard,
                  isCrit && styles.cardCrit,
                  alert.isAcknowledged && styles.cardAck,
                ]}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('AlertDetails', { alertId: alert.id, alertTitle: alert.title })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.severityBadge,
                        isCrit ? styles.badgeCrit : isWarn ? styles.badgeWarn : styles.badgeInfo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.severityText,
                          isCrit ? styles.textCrit : isWarn ? styles.textWarn : styles.textInfo,
                        ]}
                      >
                        {alert.severity}
                      </Text>
                    </View>
                    <Text style={styles.timeText}>{formattedTime}</Text>
                  </View>

                  {!alert.isAcknowledged ? (
                    <TouchableOpacity
                      style={styles.ackButton}
                      onPress={e => handleAcknowledge(alert.id, e)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.ackText}>Acknowledge</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.ackedBadge}>
                      <Text style={styles.ackedText}>Acknowledged</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.alertTitle} numberOfLines={2}>{alert.title}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.roomTag}>{alert.roomName}</Text>
                    <ChevronRight size={16} color={Colors.textSubtle} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredAlerts.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No alerts to display</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  navTitle: {
    flex: 1,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
    textAlign: 'center',
  },
  navSpacer: {
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
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
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    height: 34,
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
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
  },
  cardCrit: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF9F9',
  },
  cardAck: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeCrit: {
    backgroundColor: Colors.dangerLight,
  },
  badgeWarn: {
    backgroundColor: Colors.warningLight,
  },
  badgeInfo: {
    backgroundColor: Colors.infoLight,
  },
  severityText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  textCrit: {
    color: Colors.danger,
  },
  textWarn: {
    color: Colors.warning,
  },
  textInfo: {
    color: Colors.info,
  },
  timeText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  ackButton: {
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    flexShrink: 0,
  },
  ackText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  ackedBadge: {
    paddingHorizontal: 10,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E6F4EA',
    flexShrink: 0,
  },
  ackedText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.primaryDark,
  },
  cardBody: {
    marginTop: 2,
  },
  alertTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  roomTag: {
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
