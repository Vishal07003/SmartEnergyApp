import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, Icon, useToast, useDialog } from '../../components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { liveApi } from '../../services/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { showDialog } = useDialog();

  const handleResetRequest = async () => {
    if (!email.trim()) {
      showToast('Please enter your registered email address.', 'warning', 3000, 'Required Field');
      return;
    }
    setLoading(true);
    try {
      const resp = await liveApi.forgotPassword(email.trim());
      showDialog({
        type: 'info',
        title: 'Recovery Email Sent',
        message: resp.detail || 'If an account exists for this email, password recovery instructions have been sent.',
        actions: [
          {
            text: 'Proceed to Reset',
            style: 'default',
            onPress: () => navigation.navigate('ResetPassword', { email: email.trim() }),
          },
        ],
      });
    } catch (err: any) {
      showToast(err.message || 'Unable to process reset request.', 'error', 3500, 'Request Failed');
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
          <Text style={styles.backButtonText}>‹ Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.headerArea}>
          <View style={styles.brandIcon}>
            <Icon name="shield" size={24} color={Colors.navy} />
          </View>
          <Text style={styles.title}>Account Recovery</Text>
          <Text style={styles.subtitle}>
            Enter your institutional email to verify identity and reset your credentials.
          </Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Registered Staff Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="staff@institution.edu"
          />

          <Button
            title="Send Verification Code"
            onPress={handleResetRequest}
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
    backgroundColor: Colors.infoLight,
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

