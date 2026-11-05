import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, Icon, useToast } from '../../components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      showToast('Please enter your username and password.', 'warning', 3000, 'Required Fields');
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      showToast('Welcome back to Smart Energy Manager', 'success', 2500, 'Signed In');
    } catch (err: any) {
      showToast(err.message || 'Invalid username or password.', 'error', 3500, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset backgroundColor={Colors.background}>
      <AppKeyboardAwareView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerArea}>
          <View style={styles.brandIcon}>
            <Icon name="bolt" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Smart Energy Manager</Text>
          <Text style={styles.subtitle}>Unified Energy Monitoring & IoT Portal</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.formTitle}>Sign In</Text>

          <Input
            label="Username or Email"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="Enter your username or email"
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
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>Don't have an account? Create one</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.footerNote}>
          <Icon name="shield" size={14} color={Colors.textMuted} />
          <Text style={styles.footerText}>
            Secure JWT authentication with email verification.
          </Text>
        </View>
      </AppKeyboardAwareView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 4,
  },
  card: {
    padding: Spacing.lg,
  },
  formTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
    marginBottom: Spacing.md,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.lg,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: Spacing.xs,
  },
  registerBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: Spacing.md,
  },
  registerBtnText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    gap: 6,
  },
  footerText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
