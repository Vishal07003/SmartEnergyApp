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
import { AppScreenContainer, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { AIAlert } from '../../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AlertDetails'>;

export const AlertDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { alertId } = route.params;
  const [alert, setAlert] = useState<AIAlert | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [resolving, setResolving] = useState<boolean>(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const all = await mockApi.getAlerts();
        const found = all.find(a => a.id === alertId);
        if (found) setAlert(found);
      } catch {
        // Fallback
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
    }
  };

  const handleResolve = () => {
    if (alert) {
      setResolving(true);
      setTimeout(() => {
        mockApi.acknowledgeAlert(alert.id);
        setResolving(false);
        navigation.goBack();
      }, 500);
    }
  };

  if (loading || !alert) {
    return (
      <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      </AppScreenContainer>
    );
  }

  const isCrit = alert.severity === 'CRITICAL';
  const isWarn = alert.severity === 'WARNING';

  return (
    <AppScreenContainer applyTopInset={false} applyBottomInset backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. What & Where */}
        <View style={[styles.mainCard, isCrit && styles.cardCrit]}>
          <View style={styles.headerRow}>
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
            <Text style={styles.timestamp}>{alert.timestamp}</Text>
          </View>

          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.roomLocation}>Location: {alert.roomName}</Text>
        </View>

        {/* 2. Possible Reason */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>POSSIBLE REASON</Text>
          <Text style={styles.sectionBody}>
            {alert.category === 'UNOCCUPIED_WASTAGE'
              ? 'Active loads detected while sensors report zero room occupancy.'
              : alert.category === 'ABNORMAL_SPIKE'
              ? 'Measured active load exceeded normal circuit thresholds.'
              : alert.category === 'OVERLOAD_RISK'
              ? 'Continuous high current draw approaching safety trip limits.'
              : 'Sensors or controller offline or failed to report heartbeat.'}
          </Text>
        </View>

        {/* 3. Recommended Action */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>RECOMMENDED ACTION</Text>
          <Text style={styles.sectionBody}>{alert.recommendedAction}</Text>
        </View>

        {/* 4. Action Buttons */}
        <View style={styles.actions}>
          {!alert.isAcknowledged && (
            <Button
              title="Acknowledge"
              onPress={handleAcknowledge}
              variant="outline"
              style={styles.actionBtn}
            />
          )}

          <Button
            title="Resolve"
            onPress={handleResolve}
            loading={resolving}
            variant="primary"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  cardCrit: {
    borderColor: '#FECACA',
    backgroundColor: '#FFF9F9',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
  timestamp: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  alertTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.heroNavy,
    marginBottom: Spacing.xs,
  },
  roomLocation: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  sectionBody: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
