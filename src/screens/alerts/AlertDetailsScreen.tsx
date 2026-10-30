import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  AlertTriangle,
  DoorOpen,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { AIAlert } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetails'>;

export const AlertDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alertId } = route.params;
  const [alertData, setAlertData] = useState<AIAlert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const found = await mockApi.getAlertById(alertId);
        if (found) {
          setAlertData(found);
        }
      } catch {
        Alert.alert('Error', 'Unable to retrieve alert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [alertId]);

  const handleAcknowledge = async () => {
    if (!alertData) return;
    await mockApi.acknowledgeAlert(alertData.id);
    setAlertData(prev => prev ? { ...prev, isAcknowledged: true, status: 'ACKNOWLEDGED' } : null);
    Alert.alert('Acknowledged', `Alert ${alertData.id} marked as acknowledged by staff.`);
  };

  const handleResolve = async () => {
    if (!alertData) return;
    Alert.alert(
      'Resolve Alert Confirmation',
      `[MOCK DEMO] Mark anomaly "${alertData.title}" as fully resolved?\n\nThis will record corrective action in the institutional compliance audit log.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Resolved',
          onPress: async () => {
            await mockApi.resolveAlert(alertData.id);
            setAlertData(prev => prev ? { ...prev, status: 'RESOLVED', isAcknowledged: true } : null);
            Alert.alert('Resolved (Demo)', `Alert ${alertData.id} marked as RESOLVED.`);
          },
        },
      ]
    );
  };

  if (loading || !alertData) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching AI Telemetry Snapshot...</Text>
        </View>
      </AppScreenContainer>
    );
  }

  const isCritical = alertData.severity === 'CRITICAL';
  const isResolved = alertData.status === 'RESOLVED';

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Alert Card */}
        <Card style={[styles.headerCard, isCritical ? styles.criticalBorder : {}]}>
          <View style={styles.topHeaderRow}>
            <View
              style={[
                styles.severityPill,
                isCritical
                  ? styles.critPill
                  : isResolved
                  ? styles.resPill
                  : styles.warnPill,
              ]}
            >
              <Text
                style={[
                  styles.severityPillText,
                  isCritical
                    ? styles.critText
                    : isResolved
                    ? styles.resText
                    : styles.warnText,
                ]}
              >
                {alertData.status === 'RESOLVED' ? 'RESOLVED' : alertData.severity}
              </Text>
            </View>

            <Text style={styles.alertIdText}>
              {alertData.id} • {alertData.timestamp}
            </Text>
          </View>

          <Text style={styles.alertTitle}>{alertData.title}</Text>
          <Text style={styles.alertDesc}>{alertData.description}</Text>

          {/* AI Confidence Meter */}
          <View style={styles.confidenceRow}>
            <Sparkles size={14} color={Colors.primary} />
            <Text style={styles.confidenceText}>
              AI Detection Confidence: {(alertData.aiConfidenceScore * 100).toFixed(0)}% • ML Multi-Sensor Fusion
            </Text>
          </View>
        </Card>

        {/* Sensor Snapshot at Detection Instant */}
        <Text style={styles.sectionTitle}>Sensor Telemetry at Incident Moment</Text>
        <View style={styles.snapshotGrid}>
          <Card style={styles.snapshotTile}>
            <Text style={styles.tileLabel}>PIR MOTION</Text>
            <Text style={styles.tileVal}>
              {alertData.sensorSnapshot.motionDetected ? 'Active Motion' : 'No Movement'}
            </Text>
            <Text style={styles.tileSub}>Room Vacancy Heuristic</Text>
          </Card>

          <Card style={styles.snapshotTile}>
            <Text style={styles.tileLabel}>LIVE POWER LOAD</Text>
            <Text style={[styles.tileVal, styles.powerHighlight]}>
              {alertData.sensorSnapshot.liveWatts} W
            </Text>
            <Text style={styles.tileSub}>
              {alertData.powerWastageEstimateWatts ? `~${alertData.powerWastageEstimateWatts}W Waste` : 'Monitored bus'}
            </Text>
          </Card>

          <Card style={styles.snapshotTile}>
            <Text style={styles.tileLabel}>AMBIENT LUX</Text>
            <Text style={styles.tileVal}>{alertData.sensorSnapshot.ambientLight} Lux</Text>
            <Text style={styles.tileSub}>Photodiode sensor</Text>
          </Card>

          <Card style={styles.snapshotTile}>
            <Text style={styles.tileLabel}>TEMPERATURE</Text>
            <Text style={styles.tileVal}>{alertData.sensorSnapshot.temperature}°C</Text>
            <Text style={styles.tileSub}>
              {alertData.sensorSnapshot.humidity}% Humidity
            </Text>
          </Card>
        </View>

        {/* Diagnosis & Root Cause Analysis */}
        <Text style={styles.sectionTitle}>AI Root Cause Analysis</Text>
        <Card style={styles.analysisCard}>
          <View style={styles.analysisItem}>
            <Text style={styles.itemHeading}>POSSIBLE ROOT CAUSE</Text>
            <Text style={styles.itemContent}>{alertData.possibleReason}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.analysisItem}>
            <Text style={styles.itemHeading}>RECOMMENDED INTERVENTION</Text>
            <Text style={styles.itemContent}>{alertData.recommendedAction}</Text>
          </View>
        </Card>

        {/* Navigation to Associated Room or Device */}
        <Text style={styles.sectionTitle}>Associated Infrastructure Nodes</Text>
        <View style={styles.navLinksRow}>
          <Button
            title={`View Room: ${alertData.roomName}`}
            onPress={() =>
              navigation.navigate('RoomDetails', {
                roomId: alertData.roomId,
                roomName: alertData.roomName,
              })
            }
            variant="outline"
            style={styles.navBtn}
            textStyle={styles.navBtnText}
          />

          {alertData.deviceId && alertData.deviceName ? (
            <Button
              title={`View Device: ${alertData.deviceName.split('-')[0]}`}
              onPress={() =>
                navigation.navigate('DeviceDetails', {
                  deviceId: alertData.deviceId!,
                  deviceName: alertData.deviceName!,
                })
              }
              variant="outline"
              style={styles.navBtn}
              textStyle={styles.navBtnText}
            />
          ) : null}
        </View>

        {/* Chronological Incident History Log */}
        <Text style={styles.sectionTitle}>Incident Chronology Log</Text>
        <Card style={styles.historyCard}>
          {alertData.historyLog.map((log, idx) => (
            <View key={idx} style={styles.logRow}>
              <View style={styles.logTimeCol}>
                <Clock size={12} color={Colors.textMuted} />
                <Text style={styles.logTimeText}>{log.time}</Text>
              </View>
              <Text style={styles.logEventText}>{log.event}</Text>
            </View>
          ))}
        </Card>

        {/* Primary Alert Actions Footer */}
        <View style={styles.actionsFooter}>
          {!isResolved && !alertData.isAcknowledged && (
            <Button
              title="Acknowledge Alert"
              onPress={handleAcknowledge}
              variant="outline"
              style={styles.mainActionBtn}
            />
          )}

          {!isResolved ? (
            <Button
              title="Mark Anomaly as Resolved"
              onPress={handleResolve}
              variant={isCritical ? 'danger' : 'primary'}
              style={styles.mainActionBtn}
            />
          ) : (
            <Card style={styles.resolvedBanner}>
              <CheckCircle2 size={16} color={Colors.success} />
              <Text style={styles.resolvedBannerText}>
                This incident is documented as RESOLVED in audit logs.
              </Text>
            </Card>
          )}
        </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  headerCard: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  criticalBorder: {
    borderColor: '#FED7D7',
    backgroundColor: '#FFFBFB',
  },
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  critPill: {
    backgroundColor: Colors.dangerLight,
  },
  warnPill: {
    backgroundColor: Colors.warningLight,
  },
  resPill: {
    backgroundColor: Colors.successLight,
  },
  severityPillText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
  },
  critText: {
    color: Colors.danger,
  },
  warnText: {
    color: Colors.warning,
  },
  resText: {
    color: Colors.success,
  },
  alertIdText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  alertTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    marginBottom: Spacing.xs,
  },
  alertDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  confidenceText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.primaryDark,
    fontWeight: Typography.weights.semibold,
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  snapshotTile: {
    width: '48.5%',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tileLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  tileVal: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  powerHighlight: {
    color: Colors.primary,
  },
  tileSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
    marginTop: 2,
  },
  analysisCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  analysisItem: {
    paddingVertical: 2,
  },
  itemHeading: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemContent: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
  navLinksRow: {
    marginBottom: Spacing.sm,
  },
  navBtn: {
    height: 42,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  navBtnText: {
    fontSize: Typography.sizes.xs,
  },
  historyCard: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  logTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    marginRight: Spacing.sm,
  },
  logTimeText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  logEventText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMain,
    flex: 1,
    lineHeight: 16,
  },
  actionsFooter: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.base,
  },
  mainActionBtn: {
    height: 48,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.successLight,
    borderColor: '#C6F6D5',
  },
  resolvedBannerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontWeight: Typography.weights.semibold,
    marginLeft: Spacing.sm,
  },
});
