import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, Button, Input, AppScreenContainer, AppKeyboardAwareView, useToast } from '../../components/common';
import { liveApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, User, Mail } from 'lucide-react-native';

export const PersonalInfoScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [username] = useState(user?.username || '');
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(
    user?.name && user.name.split(' ').length > 1
      ? user.name.split(' ').slice(1).join(' ')
      : ''
  );
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSave = async () => {
    setErrors({});
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return;
    }

    setLoading(true);
    try {
      await liveApi.updateStaffProfile({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      await refreshProfile();
      showToast('Profile updated successfully', 'success');
      navigation.goBack();
    } catch (err: any) {
      const msg = err.data?.email
        ? Array.isArray(err.data.email)
          ? err.data.email[0]
          : err.data.email
        : err.message || 'Failed to update profile information';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreenContainer applyTopInset applyBottomInset backgroundColor={Colors.background}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.navy} />
          <Text style={styles.backText}>Account</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Personal Information</Text>
        <View style={{ width: 40 }} />
      </View>

      <AppKeyboardAwareView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Input
            label="Username (Read-Only)"
            value={username}
            editable={false}
            containerStyle={styles.disabledInput}
          />

          <Input
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Your first name"
          />

          <Input
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Your last name"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="user@example.com"
            error={errors.email}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </Card>
      </AppKeyboardAwareView>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 48,
    paddingRight: Spacing.sm,
  },
  backText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.navy,
  },
  topTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  card: {
    padding: Spacing.lg,
  },
  disabledInput: {
    opacity: 0.75,
  },
  saveBtn: {
    marginTop: Spacing.md,
  },
});

