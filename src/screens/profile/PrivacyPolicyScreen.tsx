import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer } from '../../components/common';
import { ArrowLeft, Shield, Lock, Database, EyeOff } from 'lucide-react-native';

export const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation();

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
        <Text style={styles.topTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Shield size={24} color={Colors.primary} />
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.cardTitle}>Data Privacy & Telemetry</Text>
              <Text style={styles.cardSub}>Effective Date: Academic Year 2026</Text>
            </View>
          </View>

          <Text style={styles.introText}>
            Smart Energy Manager operates strictly as an institutional facility monitoring and energy optimization platform. This policy outlines how telemetry and account data are processed.
          </Text>
        </Card>

        <Text style={styles.sectionHeader}>COLLECTION & PROCESSING</Text>

        <Card style={styles.card}>
          <View style={styles.policyItem}>
            <Database size={18} color={Colors.navy} style={styles.policyIcon} />
            <View style={styles.policyTexts}>
              <Text style={styles.policyHeading}>1. Telemetry & Sensor Data</Text>
              <Text style={styles.policyBody}>
                The application records electrical parameters (voltage, current, power watts, power factor) and environmental measurements (PIR motion, temperature, humidity, ambient lux). These signals are used solely for occupancy estimation and energy reduction.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.policyItem}>
            <EyeOff size={18} color={Colors.navy} style={styles.policyIcon} />
            <View style={styles.policyTexts}>
              <Text style={styles.policyHeading}>2. No Biometric or Audio Surveillance</Text>
              <Text style={styles.policyBody}>
                Hardware nodes and PIR sensors detect binary infrared movement signatures only. No cameras, microphones, biometric trackers, or audio monitoring equipment are deployed or stored.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.policyItem}>
            <Lock size={18} color={Colors.navy} style={styles.policyIcon} />
            <View style={styles.policyTexts}>
              <Text style={styles.policyHeading}>3. Account Credentials & Security</Text>
              <Text style={styles.policyBody}>
                User authentication is governed by Django SimpleJWT tokens with hashed credentials. Each user account operates with individual data isolation and cannot access another user's private settings.
              </Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionHeader}>DATA RETENTION</Text>

        <Card style={styles.card}>
          <Text style={styles.policyBody}>
            Energy telemetry readings are periodically aggregated for analytics and capacity planning. Historical logs are stored on secure local campus database instances and never transmitted to unauthorized commercial third parties.
          </Text>
        </Card>
      </ScrollView>
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
    paddingBottom: Spacing.xl,
  },
  card: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  headerTextGroup: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  cardSub: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  introText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  policyIcon: {
    marginTop: 2,
    marginRight: Spacing.md,
  },
  policyTexts: {
    flex: 1,
  },
  policyHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  policyBody: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.sm,
  },
});

