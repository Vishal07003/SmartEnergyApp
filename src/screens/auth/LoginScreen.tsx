import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, Icon } from '../../components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('evelyn.reed@institution.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Handled by root or demo transition
      Alert.alert('Authenticated', 'Welcome back, Dr. Evelyn Reed.');
    }, 600);
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset backgroundColor={Colors.background}>
      <AppKeyboardAwareView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
          <View style={styles.brandIcon}>
            <Icon name="bolt" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Smart Energy Manager</Text>
          <Text style={styles.subtitle}>Institutional Staff & IoT Telemetry Portal</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.formTitle}>Staff Sign In</Text>

          <Input
            label="Institutional Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="staff@institution.edu"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />

          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In to Dashboard"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>

        <View style={styles.footerNote}>
          <Icon name="shield" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Restricted to authorized faculty, lab technicians & staff.
          </Text>
        </View>
      </AppKeyboardAwareView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    justifyContent: 'center',
    padding: Spacing.lg,
    minHeight: '100%',
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
  },
  card: {
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    marginBottom: Spacing.base,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.base,
    marginTop: -Spacing.xs,
  },
  forgotText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  submitBtn: {
    height: 50,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    marginLeft: Spacing.xs,
  },
});
