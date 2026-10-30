import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button } from '../common/Button';
import { AIAlert } from '../../types';

interface DetailedAlertCardProps {
  alert: AIAlert;
  onPress: (alert: AIAlert) => void;
  onAcknowledge: (alert: AIAlert) => void;
  onResolve: (alert: AIAlert) => void;
  style?: ViewStyle;
}

export const DetailedAlertCard: React.FC<DetailedAlertCardProps> = ({
  alert,
  onPress,
  onAcknowledge,
  onResolve,
  style,
}) => {
  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';
  const isResolved = alert.status === 'RESOLVED';

  const renderSeverityIcon = () => {
    if (isResolved) return <CheckCircle2 size={16} color={Colors.success} />;
    if (isCritical) return <AlertCircle size={16} color={Colors.danger} />;
    if (isWarning) return <AlertTriangle size={16} color={Colors.warning} />;
    return <Info size={16} color={Colors.navy} />;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => onPress(alert)}
      style={[
        styles.card,
        isCritical ? styles.criticalCard : isWarning ? styles.warningCard : styles.normalCard,
        isResolved ? styles.resolvedCard : null,
        style,
      ]}
    >
      {/* Top Header: Severity Tag, Alert ID, Timestamp */}
      <View style={styles.topRow}>
        <View style={styles.severityTag}>
          {renderSeverityIcon()}
          <Text
            style={[
              styles.severityText,
              isCritical
                ? styles.textCritical
                : isWarning
                ? styles.textWarning
                : isResolved
                ? styles.textResolved
                : styles.textInfo,
            ]}
          >
            {isResolved ? 'RESOLVED' : alert.severity}
          </Text>
        </View>

        <Text style={styles.idText}>
          {alert.id} • {alert.timestamp}
        </Text>
      </View>

      {/* Alert Title & Room Context */}
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.roomSubtitle}>
        {alert.roomName} {alert.deviceName ? `• ${alert.deviceName}` : ''}
      </Text>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {alert.description}
      </Text>

      {/* Detected Sensor Readout Pill Strip */}
      <View style={styles.sensorPillsRow}>
        {alert.powerWastageEstimateWatts ? (
          <View style={styles.pillWastage}>
            <Text style={styles.pillWastageText}>~{alert.powerWastageEstimateWatts}W Wastage</Text>
          </View>
        ) : null}

        <View style={styles.pillSensor}>
          <Text style={styles.pillSensorText}>
            PIR: {alert.sensorSnapshot.motionDetected ? 'Movement' : 'No Motion'}
          </Text>
        </View>

        <View style={styles.pillSensor}>
          <Text style={styles.pillSensorText}>
            {(alert.aiConfidenceScore * 100).toFixed(0)}% AI Conf.
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View style={styles.actionRow}>
        <Text style={styles.detailsPrompt}>Tap for Sensor Telemetry ›</Text>

        <View style={styles.btnGroup}>
          {!isResolved && !alert.isAcknowledged && (
            <Button
              title="Acknowledge"
              onPress={() => onAcknowledge(alert)}
              variant="outline"
              style={styles.ackBtn}
              textStyle={styles.btnText}
            />
          )}

          {!isResolved && (
            <Button
              title="Resolve"
              onPress={() => onResolve(alert)}
              variant={isCritical ? 'danger' : 'primary'}
              style={styles.resolveBtn}
              textStyle={styles.btnText}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  criticalCard: {
    borderColor: '#FED7D7',
    backgroundColor: '#FFFBFB',
  },
  warningCard: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  normalCard: {
    borderColor: Colors.border,
  },
  resolvedCard: {
    borderColor: '#C6F6D5',
    backgroundColor: '#F0FFF4',
    opacity: 0.88,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  severityTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  severityText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  textCritical: {
    color: Colors.danger,
  },
  textWarning: {
    color: Colors.warning,
  },
  textInfo: {
    color: Colors.navy,
  },
  textResolved: {
    color: Colors.success,
  },
  idText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    marginBottom: 2,
  },
  roomSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.primaryDark,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  sensorPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  pillWastage: {
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: 4,
  },
  pillWastageText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
  },
  pillSensor: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: 4,
  },
  pillSensorText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMain,
    fontWeight: Typography.weights.medium,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  detailsPrompt: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ackBtn: {
    height: 32,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
  },
  resolveBtn: {
    height: 32,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  btnText: {
    fontSize: Typography.sizes.xxs,
  },
});

