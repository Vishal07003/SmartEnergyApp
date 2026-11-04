import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer } from '../../components/common';
import { ArrowLeft, Zap, Layers, Server, Activity } from 'lucide-react-native';

export const AboutScreen: React.FC = () => {
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
        <Text style={styles.topTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandHero}>
          <View style={styles.heroIcon}>
            <Zap size={32} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Smart Energy Manager</Text>
          <Text style={styles.heroVersion}>Version 1.0.0 (Build 2026.11)</Text>
          <Text style={styles.heroTag}>Campus IoT Energy & Facility Platform</Text>
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>PLATFORM OVERVIEW</Text>
          <Text style={styles.bodyText}>
            Smart Energy Manager is an end-to-end intelligent IoT monitoring and automation system designed for academic institutions and campus facilities. It pairs edge hardware controllers (ESP32 microcontrollers, current transducers, and environmental sensors) with machine learning inference to eliminate wasted electrical energy in unoccupied classrooms, laboratories, and lecture halls.
          </Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>SYSTEM ARCHITECTURE</Text>

          <View style={styles.specRow}>
            <Layers size={18} color={Colors.navy} />
            <View style={styles.specTexts}>
              <Text style={styles.specLabel}>Mobile Client</Text>
              <Text style={styles.specValue}>React Native 0.88 • Android 16 Verified</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Server size={18} color={Colors.navy} />
            <View style={styles.specTexts}>
              <Text style={styles.specLabel}>Backend Core</Text>
              <Text style={styles.specValue}>Django 5.1 REST Framework • PostgreSQL</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.specRow}>
            <Activity size={18} color={Colors.primary} />
            <View style={styles.specTexts}>
              <Text style={styles.specLabel}>Telemetry Ingestion</Text>
              <Text style={styles.specValue}>MQTT Broker & REST Gateway</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.footerNote}>
          © 2026 Academic Engineering Complex. All rights reserved.
        </Text>
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
  brandHero: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  heroVersion: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  heroTag: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    marginTop: 4,
  },
  card: {
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  bodyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 20,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  specTexts: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  specLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
  specValue: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    fontWeight: Typography.weights.bold,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: Typography.sizes.xxs,
    color: Colors.textSubtle,
    marginTop: Spacing.md,
  },
});

