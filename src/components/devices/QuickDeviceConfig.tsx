import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface QuickDeviceConfigProps {
  onSaveToESP32?: (lux: number, timer: number) => void;
}

export const QuickDeviceConfig: React.FC<QuickDeviceConfigProps> = ({ onSaveToESP32 }) => {
  const [luxThreshold, setLuxThreshold] = useState<number>(400);
  const [timerMinutes, setTimerMinutes] = useState<number>(15);

  const handleSave = () => {
    Alert.alert(
      'Simulate ESP32 Parameter Sync',
      `[MOCK DEMO] Save automation policy parameters to connected ESP32 clusters?\n\n• Lux Ambient Dimming Threshold: ${luxThreshold} Lux\n• Vacancy Inactivity Cutoff Timer: ${timerMinutes} mins\n\nParameters are queued for the next MQTT downlink cycle.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save to ESP32 Nodes',
          onPress: () => {
            if (onSaveToESP32) onSaveToESP32(luxThreshold, timerMinutes);
            Alert.alert(
              'Configuration Deployed (Demo)',
              `Parameters synchronized across 5 active ESP32 nodes.\nTarget firmware ACK confirmed.`
            );
          },
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Global ESP32 Policy Configuration</Text>
        <View style={styles.activePill}>
          <Text style={styles.activePillText}>Policy Active</Text>
        </View>
      </View>

      {/* Lux Stepper Slider Alternative */}
      <View style={styles.settingBlock}>
        <View style={styles.settingLabelRow}>
          <Text style={styles.settingLabel}>Lux Auto-Dimming Threshold</Text>
          <Text style={styles.settingValue}>{luxThreshold} Lux</Text>
        </View>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setLuxThreshold(prev => Math.max(200, prev - 50))}
          >
            <Text style={styles.stepperBtnText}>- 50</Text>
          </TouchableOpacity>
          <Text style={styles.stepperNote}>
            {luxThreshold >= 450 ? 'Aggressive Dimming' : 'Standard Daylight Balance'}
          </Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setLuxThreshold(prev => Math.min(800, prev + 50))}
          >
            <Text style={styles.stepperBtnText}>+ 50</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vacancy Cutoff Timer Stepper */}
      <View style={styles.settingBlock}>
        <View style={styles.settingLabelRow}>
          <Text style={styles.settingLabel}>Vacancy Inactivity Off-Timer</Text>
          <Text style={styles.settingValue}>{timerMinutes} min</Text>
        </View>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setTimerMinutes(prev => Math.max(5, prev - 5))}
          >
            <Text style={styles.stepperBtnText}>- 5m</Text>
          </TouchableOpacity>
          <Text style={styles.stepperNote}>
            Idle transition delay before relay cutoff
          </Text>
          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={() => setTimerMinutes(prev => Math.min(60, prev + 5))}
          >
            <Text style={styles.stepperBtnText}>+ 5m</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        title="Save Parameters to ESP32"
        onPress={handleSave}
        variant="primary"
        style={styles.saveBtn}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  activePill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  activePillText: {
    fontSize: Typography.sizes.xxs,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryDark,
  },
  settingBlock: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  settingLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  settingLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMain,
    fontWeight: Typography.weights.medium,
  },
  settingValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepperBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  stepperBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
  },
  stepperNote: {
    fontSize: Typography.sizes.xxs,
    color: Colors.textMuted,
  },
  saveBtn: {
    height: 44,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
});

