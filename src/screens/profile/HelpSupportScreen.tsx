import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card, AppScreenContainer } from '../../components/common';
import { ArrowLeft, HelpCircle, Mail, Phone, Cpu, Zap, BellRing, ShieldCheck } from 'lucide-react-native';

export const HelpSupportScreen: React.FC = () => {
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
        <Text style={styles.topTitle}>Help & Campus Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <HelpCircle size={24} color={Colors.primary} />
            </View>
            <View style={styles.headerTextGroup}>
              <Text style={styles.cardTitle}>Campus Support Desk</Text>
              <Text style={styles.cardSub}>Facility Energy Operations</Text>
            </View>
          </View>

          <Text style={styles.bodyText}>
            For inquiries regarding telemetry sensor deployment, hardware node pairing, or room occupancy calibration, contact the campus facility management desk.
          </Text>

          <View style={styles.contactList}>
            <TouchableOpacity
              style={styles.contactItem}
              activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:energy-support@institution.edu')}
            >
              <Mail size={18} color={Colors.navy} />
              <View style={styles.contactTexts}>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>energy-support@institution.edu</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <View style={styles.contactItem}>
              <Phone size={18} color={Colors.navy} />
              <View style={styles.contactTexts}>
                <Text style={styles.contactLabel}>Internal Facility Extension</Text>
                <Text style={styles.contactValue}>Ext. 4200 (Academic Engineering Complex)</Text>
              </View>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>APPLICATION USAGE GUIDANCE</Text>

        <Card style={styles.card}>
          <View style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Zap size={18} color={Colors.primary} />
            </View>
            <View style={styles.guideText}>
              <Text style={styles.guideHeading}>Energy Monitoring</Text>
              <Text style={styles.guideDesc}>
                View real-time campus power usage and historical consumption graphs across buildings and individual rooms.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <Cpu size={18} color={Colors.navy} />
            </View>
            <View style={styles.guideText}>
              <Text style={styles.guideHeading}>Device Control & Safety Locks</Text>
              <Text style={styles.guideDesc}>
                Control relay channels safely when devices are ONLINE. Safety-locked circuits prevent accidental shut-off of mission-critical hardware.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.guideItem}>
            <View style={styles.guideIcon}>
              <BellRing size={18} color={Colors.warning} />
            </View>
            <View style={styles.guideText}>
              <Text style={styles.guideHeading}>AI Anomaly Alerts</Text>
              <Text style={styles.guideDesc}>
                Machine learning detects unoccupied active loads and power anomalies automatically to prevent facility energy wastage.
              </Text>
            </View>
          </View>
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
    marginBottom: Spacing.md,
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
  bodyText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  contactList: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    minHeight: 48,
  },
  contactTexts: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  contactLabel: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
    fontWeight: Typography.weights.semibold,
  },
  contactValue: {
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
  sectionTitle: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  guideIcon: {
    marginTop: 2,
    marginRight: Spacing.md,
  },
  guideText: {
    flex: 1,
  },
  guideHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textMain,
  },
  guideDesc: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
});

