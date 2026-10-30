import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { User, Bell, Shield, LogOut } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer, Button } from '../../components/common';
import { mockApi } from '../../services/api';
import { StaffUser } from '../../types';

export const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [notif, setNotif] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  useEffect(() => {
    mockApi.getStaffProfile().then(u => {
      setUser(u);
      setNotif(u.notificationsEnabled);
      setPushAlerts(u.alertPushEnabled);
    });
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Sign out of Smart Energy Manager?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Staff Profile</Text>
        </View>

        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <User size={24} color={Colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Staff User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <Text style={styles.userDept}>{user?.department}</Text>
            </View>
          </View>
        </Card>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Bell size={16} color={Colors.navy} />
              <Text style={styles.settingText}>System Notifications</Text>
            </View>
            <Switch
              value={notif}
              onValueChange={setNotif}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notif ? Colors.primary : Colors.textSubtle}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabelRow}>
              <Shield size={16} color={Colors.navy} />
              <Text style={styles.settingText}>AI Critical Spikes Alert</Text>
            </View>
            <Switch
              value={pushAlerts}
              onValueChange={setPushAlerts}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={pushAlerts ? Colors.primary : Colors.textSubtle}
            />
          </View>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutBtn}
        />
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
  header: {
    marginBottom: Spacing.sm,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  userCard: {
    padding: Spacing.base,
    marginBottom: Spacing.xs,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  userEmail: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  userDept: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
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
  settingsCard: {
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textMain,
    marginLeft: Spacing.sm,
  },
  logoutBtn: {
    height: 44,
    borderRadius: BorderRadius.md,
  },
});
