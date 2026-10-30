import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface AppScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  applyTopInset?: boolean;
  applyBottomInset?: boolean;
  statusBarStyle?: 'dark-content' | 'light-content';
}

export const AppScreenContainer: React.FC<AppScreenContainerProps> = ({
  children,
  style,
  backgroundColor = Colors.background,
  applyTopInset = true,
  applyBottomInset = false, // false by default when bottom tab bar handles its own insets
  statusBarStyle = 'dark-content',
}) => {
  const insets: EdgeInsets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: applyTopInset ? insets.top : 0,
          paddingBottom: applyBottomInset ? insets.bottom : 0,
        },
        style,
      ]}
    >
      <StatusBar barStyle={statusBarStyle} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
