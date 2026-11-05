import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button, AppScreenContainer, Skeleton } from '../../components/common';
import { LoadDynamicsChart } from '../../components/analytics';
import { liveApi } from '../../services/api';
import { TimeHorizon, PeriodAnalyticsData } from '../../types';

export const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('Week');
  const [analyticsData, setAnalyticsData] = useState<PeriodAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAnalytics = async (horizon: TimeHorizon) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await liveApi.getAnalyticsByHorizon(horizon);
      if (data) {
        setAnalyticsData(data);
      } else {
        setErrorMessage('No analytics data available for this time range.');
      }
    } catch {
      setErrorMessage('Unable to load analytics. Tap below to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(selectedHorizon);
  }, [selectedHorizon]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics(selectedHorizon);
  };

  const horizons: { label: string; value: TimeHorizon }[] = [
    { label: 'Today', value: 'Day' },
    { label: 'This Week', value: 'Week' },
    { label: 'This Month', value: 'Month' },
  ];

  if (loading && !refreshing) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset={false} backgroundColor={Colors.background}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Analytics & Telemetry</Text>
          <View style={styles.navSpacer} />
        </View>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header Skeleton */}
          <View style={[styles.header, { alignItems: 'center' }]}>
            <Skeleton width={120} height={26} borderRadius={6} />
            <Skeleton width={140} height={14} borderRadius={4} />
          </View>

          {/* Horizon Selector Skeleton */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.md }}>
            <Skeleton width={80} height={36} borderRadius={18} />
            <Skeleton width={100} height={36} borderRadius={18} />
            <Skeleton width={100} height={36} borderRadius={18} />
          </View>

          {/* Total Consumption Card Skeleton */}
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: Spacing.md }}>
            <Skeleton width={140} height={12} borderRadius={4} style={{ marginBottom: 8 }} />
            <Skeleton width={160} height={32} borderRadius={6} style={{ marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Skeleton width={110} height={28} borderRadius={6} />
              <Skeleton width={110} height={28} borderRadius={6} />
            </View>
          </View>

          {/* Trend Chart Skeleton */}
          <View style={{ marginBottom: Spacing.md }}>
            <Skeleton width={150} height={20} borderRadius={6} style={{ marginBottom: Spacing.sm }} />
            <Skeleton width="100%" height={180} borderRadius={16} />
          </View>

          {/* Top Consuming Rooms Skeleton */}
          <View>
            <Skeleton width={160} height={20} borderRadius={6} style={{ marginBottom: Spacing.sm }} />
            <Skeleton width="100%" height={56} borderRadius={12} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={56} borderRadius={12} />
          </View>
        </ScrollView>
      </AppScreenContainer>
    );
  }

  if (errorMessage || !analyticsData) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset={false} backgroundColor={Colors.background}>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color={Colors.navy} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Analytics & Telemetry</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Analytics Unavailable</Text>
          <Text style={styles.errorSubtitle}>
            {errorMessage || 'No energy analytics recorded for this period.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => fetchAnalytics(selectedHorizon)}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </AppScreenContainer>
    );
  }

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset={false} backgroundColor={Colors.background}>
      {/* Back Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={Colors.navy} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Analytics & Telemetry</Text>
        <View style={styles.navSpacer} />
      </View>

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
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.dateLabel}>{analyticsData.dateRangeLabel}</Text>
        </View>

        {/* 1. Time Horizon Filter: Today, This Week, This Month */}
        <View style={styles.horizonSelector}>
          {horizons.map(h => {
            const isSelected = selectedHorizon === h.value;
            return (
              <TouchableOpacity
                key={h.value}
                style={[styles.tab, isSelected && styles.tabActive]}
                onPress={() => setSelectedHorizon(h.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                  {h.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 2. Measured vs Estimated Energy Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>TOTAL CONSUMPTION</Text>
            <Text style={styles.summaryValue}>{analyticsData.totalConsumptionKwh.toLocaleString()} kWh</Text>
          </View>

          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <View>
                <Text style={styles.splitLabel}>Measured</Text>
                <Text style={styles.splitVal}>{Math.round(analyticsData.totalConsumptionKwh * 0.88).toLocaleString()} kWh</Text>
              </View>
            </View>

            <View style={styles.splitItem}>
              <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
              <View>
                <Text style={styles.splitLabel}>Estimated</Text>
                <Text style={styles.splitVal}>{Math.round(analyticsData.totalConsumptionKwh * 0.12).toLocaleString()} kWh</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3. Energy Consumption Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consumption Trend</Text>
          <LoadDynamicsChart
            data={analyticsData.chartData}
            peakPeriodLabel={analyticsData.peakPeriodLabel}
          />
        </View>

        {/* 4. Top Consuming Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Consuming Rooms</Text>
          {analyticsData.allocations.slice(0, 4).map((item, index) => (
            <View key={item.id} style={styles.roomItem}>
              <View style={styles.roomRank}>
                <Text style={styles.rankNum}>{index + 1}</Text>
              </View>
              <View style={styles.roomDetails}>
                <Text style={styles.roomName}>{item.name}</Text>
                <View style={styles.progressContainer}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${Math.min(item.percentage, 100)}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.roomKwh}>{item.consumptionKwh} kWh</Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.md,
  },
  errorTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    height: 48,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textInverse,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
  },
  dateLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  horizonSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    marginBottom: Spacing.base,
  },
  tab: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.navy,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.weights.semibold,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  summaryHeader: {
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.black,
    color: Colors.navy,
    marginTop: 2,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  splitLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  splitVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
    marginBottom: Spacing.sm,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
  },
  roomRank: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  rankNum: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
  },
  roomDetails: {
    flex: 1,
    marginRight: Spacing.md,
  },
  roomName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
    marginBottom: 4,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  roomKwh: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
});
