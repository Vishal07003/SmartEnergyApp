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

      {/* Title & Description */}
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {alert.description}
      </Text>

      {/* Reason Pill & Action */}
      <View style={styles.actionRow}>
        {alert.powerWastageEstimateWatts ? (
          <View style={styles.impactPill}>
            <Text style={styles.impactText}>~{alert.powerWastageEstimateWatts}W Waste</Text>
          </View>
        ) : (
          <View style={styles.impactPill}>
            <Text style={styles.impactText}>PIR Confirms Vacancy</Text>
          </View>
        )}

        <Button
          title={isCritical ? 'Turn Off Appliances' : 'Inspect Sensor'}
          onPress={() => onTakeAction(alert)}
          variant={isCritical ? 'secondary' : 'outline'}
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
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
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
    marginBottom: Spacing.xs,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    fontWeight: Typography.weights.medium,
  },
  actionBtn: {
    height: 36,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  actionBtnText: {
    fontSize: Typography.sizes.xs,
  },
});

