import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { FileText, Download } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, Button } from '../../components/common';
import {
  PeriodicHeroCard,
  LoadDynamicsChart,
  InstitutionalAllocationSection,
  AIEnergyGovernanceCard,
} from '../../components/analytics';
import { mockApi } from '../../services/api';
import { TimeHorizon, PeriodAnalyticsData } from '../../types';

export const AnalyticsScreen: React.FC = () => {
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon>('Week');
  const [analyticsData, setAnalyticsData] = useState<PeriodAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (horizon: TimeHorizon) => {
    try {
      const data = await mockApi.getAnalyticsByHorizon(horizon);
      setAnalyticsData(data);
    } catch {
      Alert.alert('Error', 'Unable to retrieve periodic analytics data.');
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

  const handleExportReport = (format: 'PDF' | 'CSV') => {
    Alert.alert(
      `Download Audit Report (${format})`,
      `[MOCK DEMO] Compiling institutional energy audit data for period "${analyticsData?.dateRangeLabel}".\n\nFormat: ${format}\nStandards: ISO 50001 Certified Format\n\nNote: In production with FastAPI backend, this streams a digitally-signed compliance report.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Download ${format}`,
          onPress: () => {
            Alert.alert(
              'Report Ready (Demo)',
              `Simulated energy_audit_${selectedHorizon.toLowerCase()}_2026.${format.toLowerCase()} saved to device cache.`
            );
          },
        },
      ]
    );
  };

  const horizons: TimeHorizon[] = ['Day', 'Week', 'Month', 'Year'];

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
        {/* Analytics Top Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Energy Analytics</Text>
          <Text style={styles.screenSubtitle}>
            Campus Net-Zero & Telemetry Analytics • Academic Block 4
          </Text>
        </View>

        {/* Time Horizon Selector: Day, Week, Month, Year */}
        <View style={styles.horizonSelector}>
          {horizons.map(h => {
            const isSelected = selectedHorizon === h;
            return (
              <TouchableOpacity
                key={h}
                activeOpacity={0.8}
                onPress={() => setSelectedHorizon(h)}
                style={[
                  styles.horizonTab,
                  isSelected ? styles.horizonTabActive : styles.horizonTabInactive,
                ]}
              >
                <Text
                  style={[
                    styles.horizonText,
                    isSelected ? styles.horizonTextActive : styles.horizonTextInactive,
                  ]}
                >
                  {h}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date Range Subtext Indicator */}
        {analyticsData && (
          <View style={styles.dateRangeBadge}>
            <Text style={styles.dateRangeText}>{analyticsData.dateRangeLabel}</Text>
          </View>
        )}

        {loading || !analyticsData ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading energy analytics telemetry...</Text>
          </View>
        ) : (
          <>
            {/* 1. Energy Overview Hero Card */}
            <PeriodicHeroCard
              totalKwh={analyticsData.totalConsumptionKwh}
              deltaPercent={analyticsData.deltaPercentVsPrevious}
              liveWatts={analyticsData.liveCampusDemandWatts}
              carbonOffsetKg={analyticsData.carbonOffsetKg}
              targetBudgetKwh={analyticsData.targetBudgetKwh}
              periodLabel={analyticsData.dateRangeLabel}
            />

            {/* 2. Interactive Periodic Load Dynamics Chart */}
            <LoadDynamicsChart
              data={analyticsData.chartData}
              peakPeriodLabel={analyticsData.peakPeriodLabel}
            />

            {/* 3. Institutional Load Allocation */}
            <InstitutionalAllocationSection
              allocations={analyticsData.allocations}
            />

            {/* 4. AI Energy Governance Section */}
            <AIEnergyGovernanceCard
              governance={analyticsData.governance}
            />

            {/* 5. Report Export Actions */}
            <View style={styles.exportSection}>
              <Button
                title="Download Comprehensive Audit (PDF)"
                onPress={() => handleExportReport('PDF')}
                variant="primary"
                style={styles.exportBtn}
              />
              <Button
                title="Export Raw Telemetry (CSV)"
                onPress={() => handleExportReport('CSV')}
                variant="outline"
                style={styles.exportBtnOutline}
              />
            </View>
          </>
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
  horizonSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xs,
  },
  horizonTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  horizonTabActive: {
    backgroundColor: Colors.navy,
  },
  horizonTabInactive: {
    backgroundColor: 'transparent',
  },
  horizonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  horizonTextActive: {
    color: Colors.textInverse,
  },
  horizonTextInactive: {
    color: Colors.textMuted,
  },
  dateRangeBadge: {
    alignSelf: 'center',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dateRangeText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  exportSection: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  exportBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  exportBtnOutline: {
    height: 48,
    borderRadius: BorderRadius.md,
  },
});
