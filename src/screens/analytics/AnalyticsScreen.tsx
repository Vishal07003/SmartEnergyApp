import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Card, AppScreenContainer } from '../../components/common';

export const AnalyticsScreen: React.FC = () => {
  return (
    <AppScreenContainer applyTopInset applyBottomInset={false} backgroundColor={Colors.background}>
      <View style={styles.container}>
        <Card>
          <Text style={styles.title}>Energy Analytics & Savings</Text>
          <Text style={styles.subtitle}>Periodic Consumption & Load Governance</Text>
        </Card>
      </View>
    </AppScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.base,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.navy,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
