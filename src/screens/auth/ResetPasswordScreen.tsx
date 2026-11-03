import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, Icon } from '../../components/common';
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

  const handleUpdatePassword = async () => {
    if (!token.trim() || !newPassword.trim()) {
      Alert.alert('Required', 'Please complete all required security fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
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
      Alert.alert(
        'Password Updated',
        'Your password has been updated successfully. Please sign in.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Invalid or expired token.');
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

