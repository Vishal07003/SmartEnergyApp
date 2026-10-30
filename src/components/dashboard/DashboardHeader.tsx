import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Zap, Bell, User } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

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
  assignedBlock,
  gatewayStatus,
  alertCount,
  onPressAlerts,
  onPressProfile,
}) => {
  return (
    <View style={styles.container}>
      {/* Top Bar: Brand & Quick Icons */}
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <View style={styles.brandBadge}>
            <Zap size={14} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.appTitle}>Smart Energy Manager</Text>
            <Text style={styles.campusTag}>{assignedBlock}</Text>
          </View>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onPressAlerts}
            activeOpacity={0.7}
          >
            <Bell size={18} color={Colors.navy} />
            {alertCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>{alertCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onPressProfile}
            activeOpacity={0.8}
          >
            <User size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting Banner */}
      <View style={styles.greetingSection}>
        <Text style={styles.greetingText}>Good Morning, {staffName}</Text>
        <View style={styles.gatewayPill}>
          <View style={styles.statusDot} />
          <Text style={styles.gatewayText}>{gatewayStatus}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
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
    borderRadius: BorderRadius.xs,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.danger,
    width: 16,
    height: 16,
    borderRadius: 8,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingSection: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  gatewayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 5,
  },
  gatewayText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
  },
});
