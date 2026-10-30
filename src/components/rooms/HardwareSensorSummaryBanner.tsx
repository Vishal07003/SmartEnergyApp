import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cpu } from 'lucide-react-native';
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
          <Cpu size={14} color="#34D399" />
          <Text style={styles.hardwareTitle}>ESP32 Sensor Array</Text>
        </View>
        <Text style={styles.confidenceScore}>{overallConfidence}% ML Confidence</Text>
      </View>
      <Text style={styles.statusText}>
        {totalSensors} Nodes Online • PIR, Lux, Sound, Temp & CT Clamp Fusion
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hardwareTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  confidenceScore: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
  },
  statusText: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
  },
});
