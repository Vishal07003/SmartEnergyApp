import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  User,
  KeyRound,
  Bell,
  ShieldAlert,
  HelpCircle,
  FileText,
  Info,
  LogOut,
  ChevronRight,
  UserCheck,
} from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer, useToast } from '../../components/common';
import { liveApi } from '../../services/api';
import { StaffUser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RootStackParamList } from '../../navigation/types';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user: authUser, logout, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [user, setUser] = useState<StaffUser | null>(authUser);
  const [systemNotif, setSystemNotif] = useState(authUser?.notificationsEnabled ?? true);
  const [aiAlerts, setAiAlerts] = useState(authUser?.alertPushEnabled ?? true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setSystemNotif(authUser.notificationsEnabled);
      setAiAlerts(authUser.alertPushEnabled);
    } else {
      liveApi
        .getStaffProfile()
        .then(u => {
          setUser(u);
          setSystemNotif(u.notificationsEnabled);
          setAiAlerts(u.alertPushEnabled);
        })
        .catch(() => {});
    }
  }, [authUser]);

  const handleToggleSystemNotif = async (newValue: boolean) => {
    setSystemNotif(newValue);
    setSavingPrefs(true);
    try {
      await liveApi.updateStaffProfile({
        profile: {
          notifications_enabled: newValue,
        },
      });
      await refreshProfile();
      showToast(
        newValue ? 'System notifications enabled' : 'System notifications disabled',
        'info'
      );
    } catch {
      setSystemNotif(!newValue);
      showToast('Failed to update notification preference', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleToggleAiAlerts = async (newValue: boolean) => {
    setAiAlerts(newValue);
    setSavingPrefs(true);
    try {
      await liveApi.updateStaffProfile({
        profile: {
          alert_push_enabled: newValue,
        },
      });
      await refreshProfile();
      showToast(
        newValue ? 'AI critical alerts enabled' : 'AI critical alerts disabled',
        'info'
      );
    } catch {
      setAiAlerts(!newValue);
      showToast('Failed to update alert preference', 'error');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Smart Energy Manager?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Account</Text>
        </View>

        {/* 1. Account Summary Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <User size={26} color={Colors.primary} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.name || (user?.username ? user.username : 'Smart Energy Manager User')}
              </Text>
              <Text style={styles.userEmail}>{user?.email || 'user@institution.edu'}</Text>
              <Text style={styles.userSubtitle}>Smart Energy Manager User</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalInfo')}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </Card>

        {/* 2. Account Section */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PersonalInfo')}
          >
            <View style={styles.menuLeft}>
              <UserCheck size={18} color={Colors.navy} />
              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>Personal Information</Text>
                <Text style={styles.menuSub}>Username, name & email address</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={styles.menuLeft}>
              <KeyRound size={18} color={Colors.navy} />
              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>Change Password</Text>
                <Text style={styles.menuSub}>Update credentials & password security</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textSubtle} />
          </TouchableOpacity>
        </Card>

        {/* 3. Preferences Section */}
        <Text style={styles.sectionHeader}>PREFERENCES</Text>
        <Card style={styles.menuCard}>
          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Bell size={18} color={Colors.navy} />
              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>System Notifications</Text>
                <Text style={styles.menuSub}>Relay switches & gateway telemetry updates</Text>
              </View>
            </View>
            <Switch
              value={systemNotif}
              disabled={savingPrefs}
              onValueChange={handleToggleSystemNotif}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={systemNotif ? Colors.primary : Colors.textSubtle}
            />
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <ShieldAlert size={18} color={Colors.navy} />
              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>AI Critical Alerts</Text>
                <Text style={styles.menuSub}>Unoccupied load wastage & consumption spikes</Text>
              </View>
            </View>
            <Switch
              value={aiAlerts}
              disabled={savingPrefs}
              onValueChange={handleToggleAiAlerts}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={aiAlerts ? Colors.primary : Colors.textSubtle}
            />
          </View>
        </Card>

        {/* 4. Support & Information */}
        <Text style={styles.sectionHeader}>SUPPORT & INFORMATION</Text>
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.menuLeft}>
              <HelpCircle size={18} color={Colors.navy} />
              <Text style={styles.menuLabel}>Help & Campus Support</Text>
            </View>
            <ChevronRight size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.menuLeft}>
              <FileText size={18} color={Colors.navy} />
              <Text style={styles.menuLabel}>Privacy Policy</Text>
            </View>
            <ChevronRight size={18} color={Colors.textSubtle} />
          </TouchableOpacity>

          <View style={styles.itemDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuLeft}>
              <Info size={18} color={Colors.navy} />
              <View style={styles.menuTextGroup}>
                <Text style={styles.menuLabel}>About Smart Energy Manager</Text>
                <Text style={styles.menuSub}>Version 1.0.0 (Build 2026.11)</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textSubtle} />
          </TouchableOpacity>
        </Card>

        {/* 5. Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.8}
          onPress={handleSignOut}
        >
          <LogOut size={16} color={Colors.danger} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerBuild}>Smart Energy Manager • IoT Telemetry v1.0</Text>
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
    marginBottom: Spacing.xs,
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  profileCard: {
    padding: Spacing.base,
    marginBottom: Spacing.sm,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  profileInfo: {
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
  userSubtitle: {
    fontSize: Typography.sizes.xxs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  editBtn: {
    marginTop: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  editBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.navyDark,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuTextGroup: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  menuLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMain,
    
  },
  menuSub: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginLeft: 48,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    minHeight: 48,
  },
  signOutText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.danger,
    marginLeft: Spacing.xs,
  },
  footerBuild: {
    textAlign: 'center',
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
    marginTop: Spacing.lg,
  },
});
