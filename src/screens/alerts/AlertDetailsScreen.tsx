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
import { RootStackParamList } from '../../navigation/types';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppScreenContainer, Card, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { AIAlert } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetails'>;

export const AlertDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alertId } = route.params;
  const [alert, setAlert] = useState<AIAlert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const all = await mockApi.getAlerts();
        const found = all.find(a => a.id === alertId);
        if (found) setAlert(found);
      } catch {
        Alert.alert('Error', 'Unable to retrieve alert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [alertId]);

  const handleAcknowledge = () => {
    if (alert) {
      mockApi.acknowledgeAlert(alert.id);
      setAlert({ ...alert, isAcknowledged: true });
      Alert.alert('Acknowledged', 'Alert marked as handled.');
    }
  };

  if (loading || !alert) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Severity Banner */}
        <Card
          style={[
            styles.bannerCard,
            isCritical ? styles.critCard : isWarning ? styles.warnCard : undefined,
          ]}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                isCritical
                  ? styles.critBadge
                  : isWarning
                  ? styles.warnBadge
                  : styles.infoBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCritical
                    ? styles.critText
                    : isWarning
                    ? styles.warnText
                    : styles.infoText,
                ]}
              >
                {alert.severity}
              </Text>
            </View>
            <Text style={styles.timestamp}>{alert.timestamp}</Text>
          </View>
          <Text style={styles.title}>{alert.title}</Text>
          <Text style={styles.location}>{alert.roomName}</Text>
        </Card>

        {/* Diagnosis & Cause */}
        <Text style={styles.sectionTitle}>Diagnosis</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>DESCRIPTION</Text>
          <Text style={styles.fieldValue}>{alert.description}</Text>

          <Text style={[styles.fieldLabel, styles.topGap]}>POSSIBLE CAUSE</Text>
          <Text style={styles.fieldValue}>{alert.possibleReason}</Text>
        </Card>

        {/* Recommended Action */}
        <Text style={styles.sectionTitle}>Recommended Action</Text>
        <Card style={styles.sectionCard}>
          <Text style={styles.fieldValue}>{alert.recommendedAction}</Text>
          {alert.powerWastageEstimateWatts ? (
            <View style={styles.wastePill}>
              <Text style={styles.wasteText}>
                Estimated Wastage: ~{alert.powerWastageEstimateWatts} W
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Action Button */}
        {!alert.isAcknowledged ? (
          <Button
            title="Mark Acknowledged"
            onPress={handleAcknowledge}
            variant="primary"
            style={styles.actionBtn}
          />
        ) : (
          <View style={styles.ackBox}>
            <Text style={styles.ackBoxText}>Alert Acknowledged by Staff</Text>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  critCard: {
    borderColor: '#FED7D7',
    backgroundColor: '#FFFBFB',
  },
  warnCard: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  critBadge: {
    backgroundColor: Colors.dangerLight,
  },
  warnBadge: {
    backgroundColor: Colors.warningLight,
  },
  infoBadge: {
    backgroundColor: Colors.infoLight,
  },
  badgeText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
  },
  critText: {
    color: Colors.danger,
  },
  warnText: {
    color: Colors.warning,
  },
  infoText: {
    color: Colors.navy,
  },
  timestamp: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  location: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: Spacing.base,
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 20,
  },
  topGap: {
    marginTop: Spacing.sm,
  },
  wastePill: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.xs,
    padding: Spacing.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  wasteText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.semibold,
    color: Colors.warning,
  },
  actionBtn: {
    height: 44,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  ackBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  ackBoxText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
});
