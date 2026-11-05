import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, Icon, useToast, useDialog } from '../../components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { liveApi } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const email = route.params?.email || '';
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { showDialog } = useDialog();

  const handleUpdatePassword = async () => {
    if (!token.trim() || !newPassword.trim()) {
      showToast('Please complete all required security fields.', 'warning', 3000, 'Incomplete Fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New password and confirmation do not match.', 'error', 3000, 'Password Mismatch');
      return;
    }

    setLoading(true);
    try {
      await liveApi.resetPassword({
        email,
        token: token.trim(),
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      });
      showDialog({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been updated successfully. Please sign in.',
        actions: [{ text: 'Sign In', style: 'default', onPress: () => navigation.navigate('Login') }],
      });
    } catch (err: any) {
      showToast(err.message || 'Invalid or expired token.', 'error', 3500, 'Update Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset backgroundColor={Colors.background}>
      <AppKeyboardAwareView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <View style={styles.headerArea}>
          <View style={styles.brandIcon}>
            <Icon name="bolt" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit verification code dispatched to {route.params?.email || 'your email'}.
          </Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Verification Code (OTP)"
            value={token}
            onChangeText={setToken}
            keyboardType="number-pad"
            placeholder="e.g. 749201"
            maxLength={6}
          />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            placeholder="Minimum 8 characters"
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Re-enter new password"
          />

          <Button
            title="Update Credentials"
            onPress={handleUpdatePassword}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>
      </AppKeyboardAwareView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    justifyContent: 'center',
    minHeight: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.base,
  },
  backButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
  },
  submitBtn: {
    height: 50,
    marginTop: Spacing.sm,
  },
});

