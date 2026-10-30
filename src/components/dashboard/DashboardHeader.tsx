import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Icon } from '../common/Icon';

interface DashboardHeaderProps {
  staffName: string;
  department: string;
  assignedBlock: string;
  gatewayStatus: string;
  alertCount: number;
  onPressAlerts: () => void;
  onPressProfile: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  staffName,
  department,
  assignedBlock,
  gatewayStatus,
  alertCount,
  onPressAlerts,
  onPressProfile,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Bar: App Title & Icons */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.brandBadge}>
            <Icon name="bolt" size={14} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.appTitle}>Smart Energy Manager</Text>
            <Text style={styles.campusTag}>{assignedBlock}</Text>
          </View>
        </View>

        <View style={styles.rightIcons}>
          {/* AI Alerts Bell with Badge */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onPressAlerts}
            activeOpacity={0.7}
          >
            <Icon name="bell" size={20} color={Colors.navy} />
            {alertCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{alertCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Profile Avatar Button */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onPressProfile}
            activeOpacity={0.8}
          >
            <Icon name="user" size={18} color={Colors.navy} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Banner */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Good Morning, {staffName}</Text>
        <Text style={styles.deptText}>{department}</Text>
      </View>

      {/* ESP32 Synced Gateway Pill */}
      <View style={styles.gatewayPill}>
        <View style={styles.statusDot} />
        <Text style={styles.gatewayText}>{gatewayStatus}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  appTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  campusTag: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  notificationCount: {
    color: Colors.textInverse,
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginTop: Spacing.md,
  },
  greetingText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  deptText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  gatewayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 6,
  },
  gatewayText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
  },
});

