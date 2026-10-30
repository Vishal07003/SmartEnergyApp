import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Button } from '../common/Button';
import { AIAlert } from '../../types';

interface AIInterventionCardProps {
  alert: AIAlert;
  onTakeAction: (alert: AIAlert) => void;
  style?: ViewStyle;
}

export const AIInterventionCard: React.FC<AIInterventionCardProps> = ({
  alert,
  onTakeAction,
  style,
}) => {
  const isCritical = alert.severity === 'CRITICAL';

  return (
    <View style={[styles.card, isCritical ? styles.criticalBorder : styles.warningBorder, style]}>
      {/* Header Tag & Room */}
      <View style={styles.topRow}>
        <View style={[styles.badge, isCritical ? styles.criticalBadge : styles.warningBadge]}>
          <Text style={[styles.badgeText, isCritical ? styles.criticalText : styles.warningText]}>
            {alert.severity}
          </Text>
        </View>
        <Text style={styles.roomName}>{alert.roomName}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>{alert.title}</Text>

      {/* Impact & Quick Action Row */}
      <View style={styles.actionRow}>
        <Text style={styles.impactText}>
          {alert.powerWastageEstimateWatts ? `~${alert.powerWastageEstimateWatts} W Waste` : 'Zero Occupancy'}
        </Text>

        <Button
          title={isCritical ? 'Turn Off' : 'Inspect'}
          onPress={() => onTakeAction(alert)}
          variant={isCritical ? 'danger' : 'outline'}
          style={styles.actionBtn}
          textStyle={styles.actionBtnText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  criticalBorder: {
    borderColor: '#FED7D7',
    backgroundColor: '#FFFBFB',
  },
  warningBorder: {
    borderColor: '#FEEBC8',
    backgroundColor: '#FFFCF8',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  criticalBadge: {
    backgroundColor: Colors.dangerLight,
  },
  warningBadge: {
    backgroundColor: Colors.warningLight,
  },
  badgeText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.5,
  },
  criticalText: {
    color: Colors.danger,
  },
  warningText: {
    color: Colors.warning,
  },
  roomName: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    marginBottom: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  impactText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.medium,
  },
  actionBtn: {
    height: 30,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  actionBtnText: {
    fontSize: Typography.sizes.xxs,
  },
});
