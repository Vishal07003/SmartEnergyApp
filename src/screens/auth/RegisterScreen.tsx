import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  findNodeHandle,
  Keyboard,
  Platform,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, Icon, useToast } from '../../components/common';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [keyboardSpace, setKeyboardSpace] = useState(0);

  const { register } = useAuth();
  const { showToast } = useToast();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      setKeyboardSpace(e.endCoordinates.height);
    };
    const onHide = () => {
      setKeyboardSpace(0);
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const handleFocus = (event: any, extraOffset = 140) => {
    const target = event.target;
    if (!target || !scrollRef.current) {
      return;
    }
    const responder = (scrollRef.current as any)?.getScrollResponder?.();
    if (responder && typeof responder.scrollResponderScrollNativeHandleToKeyboard === 'function') {
      const nodeHandle = typeof target === 'number' ? target : findNodeHandle(target);
      if (nodeHandle) {
        responder.scrollResponderScrollNativeHandleToKeyboard(nodeHandle, extraOffset, true);
      }
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      showToast('Username, email, and password are required.', 'warning', 3000, 'Required Fields');
      return;
    }

    if (password !== passwordConfirm) {
      showToast('The passwords entered do not match.', 'error', 3000, 'Password Mismatch');
      return;
    }

    setLoading(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password,
        password_confirm: passwordConfirm,
      });
      showToast('Welcome to Smart Energy Manager!', 'success', 3000, 'Account Created');
    } catch (err: any) {
      showToast(err.message || 'Unable to register account.', 'error', 3500, 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset backgroundColor={Colors.background}>
      {/* Fixed top header with Back to Sign In button outside the ScrollView */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>‹ Back to Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Vertical Form ScrollView */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: keyboardSpace > 0 ? keyboardSpace + 120 : 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerArea}>
          <View style={styles.brandIcon}>
            <Icon name="bolt" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Self-registration for Smart Energy Manager</Text>
        </View>

        <Card style={styles.card}>
          <Input
            label="Username *"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholder="e.g. jdoe"
            onFocus={e => handleFocus(e, 100)}
          />

          <Input
            label="Email Address *"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="user@example.com"
            onFocus={e => handleFocus(e, 100)}
          />

          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="John"
            onFocus={e => handleFocus(e, 120)}
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Doe"
            onFocus={e => handleFocus(e, 120)}
          />

          <Input
            label="Password *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Minimum 8 characters"
            onFocus={e => handleFocus(e, 150)}
          />

          <Input
            label="Confirm Password *"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry
            placeholder="Confirm password"
            onFocus={e => handleFocus(e, 160)}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.xs,
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
  submitBtn: {
    marginTop: Spacing.md,
  },
});
