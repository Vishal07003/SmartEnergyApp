import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface HardwareSensorSummaryBannerProps {
  totalSensors: number;
  overallConfidence: number;
}

export const HardwareSensorSummaryBanner: React.FC<HardwareSensorSummaryBannerProps> = ({
  totalSensors = 18,
  overallConfidence = 96.2,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.hardwareBadge}>
          <View style={styles.livePulse} />
          <Text style={styles.hardwareTitle}>ESP32 Multi-Sensor Array</Text>
        </View>
        <Text style={styles.confidenceScore}>{overallConfidence}% Confidence</Text>
      </View>
      <Text style={styles.sensorDescription}>
        PIR Motion • Lux Illuminance • Sound & Acoustics • Temp & Humidity • CT Clamp Current
      </Text>
      <View style={styles.bottomStatus}>
        <Text style={styles.statusText}>
          {totalSensors} Monitored Sensor Nodes Online • Multi-Sensor Fusion Active
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.card,
    padding: Spacing.base,
    marginBottom: Spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
    marginRight: 6,
  },
  hardwareTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    letterSpacing: 0.5,
  },
  confidenceScore: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
  },
  sensorDescription: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
    lineHeight: 16,
    marginVertical: 4,
  },
  bottomStatus: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: Typography.sizes.xxs,
    color: '#E2E8F0',
    fontWeight: Typography.weights.medium,
  },
});

