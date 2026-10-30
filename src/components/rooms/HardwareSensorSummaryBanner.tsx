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
      <View style={styles.contentRow}>
        <View style={styles.leftInfo}>
          <Cpu size={15} color="#34D399" />
          <Text style={styles.title}>ESP32 Sensor Array</Text>
          <View style={styles.bullet} />
          <Text style={styles.nodeCount}>{totalSensors} Nodes Online</Text>
        </View>
        <Text style={styles.confidenceScore}>{overallConfidence}% Conf.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.heroNavy,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textInverse,
    marginLeft: 6,
  },
  bullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  nodeCount: {
    fontSize: Typography.sizes.xxs,
    color: '#94A3B8',
  },
  confidenceScore: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: '#34D399',
  },
});
