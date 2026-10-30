import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

export type IconName =
  | 'bell'
  | 'user'
  | 'bolt'
  | 'room'
  | 'device'
  | 'analytics'
  | 'warning'
  | 'check'
  | 'power'
  | 'wifi'
  | 'chevron-right'
  | 'sun'
  | 'wind'
  | 'thermometer'
  | 'shield';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#25364A',
  style,
}) => {
  // Pure lightweight geometric vector glyphs for zero-native-dependency stability
  const renderGlyph = () => {
    switch (name) {
      case 'bell':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.6,
                height: size * 0.55,
                borderTopLeftRadius: size * 0.3,
                borderTopRightRadius: size * 0.3,
                borderWidth: 1.8,
                borderColor: color,
                borderBottomWidth: 0,
              }}
            />
            <View
              style={{
                width: size * 0.8,
                height: 2,
                backgroundColor: color,
                borderRadius: 1,
              }}
            />
            <View
              style={{
                width: size * 0.25,
                height: 2.5,
                backgroundColor: color,
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                marginTop: 1,
              }}
            />
          </View>
        );

      case 'bolt':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.3,
                height: size * 0.5,
                borderLeftWidth: 2,
                borderBottomWidth: 2,
                borderColor: color,
                transform: [{ skewX: '-25deg' }],
              }}
            />
          </View>
        );

      case 'wifi':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.8,
                height: size * 0.8,
                borderRadius: size * 0.4,
                borderWidth: 1.8,
                borderColor: color,
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                transform: [{ rotate: '-45deg' }],
              }}
            />
            <View
              style={{
                position: 'absolute',
                width: size * 0.25,
                height: size * 0.25,
                borderRadius: size * 0.125,
                backgroundColor: color,
                bottom: size * 0.15,
              }}
            />
          </View>
        );

      case 'power':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.75,
                height: size * 0.75,
                borderRadius: size * 0.375,
                borderWidth: 1.8,
                borderColor: color,
                borderTopColor: 'transparent',
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: size * 0.12,
                width: 2,
                height: size * 0.38,
                backgroundColor: color,
                borderRadius: 1,
              }}
            />
          </View>
        );

      case 'chevron-right':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.4,
                height: size * 0.4,
                borderTopWidth: 2,
                borderRightWidth: 2,
                borderColor: color,
                transform: [{ rotate: '45deg' }],
              }}
            />
          </View>
        );

      case 'user':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.45,
                height: size * 0.45,
                borderRadius: size * 0.225,
                borderWidth: 1.8,
                borderColor: color,
              }}
            />
            <View
              style={{
                width: size * 0.75,
                height: size * 0.3,
                borderTopLeftRadius: size * 0.25,
                borderTopRightRadius: size * 0.25,
                borderWidth: 1.8,
                borderColor: color,
                borderBottomWidth: 0,
                marginTop: 1,
              }}
            />
          </View>
        );

      case 'warning':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderLeftWidth: size * 0.4,
                borderRightWidth: size * 0.4,
                borderBottomWidth: size * 0.75,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderBottomColor: color,
              }}
            />
          </View>
        );

      case 'thermometer':
        return (
          <View style={[styles.center, { width: size, height: size }]}>
            <View
              style={{
                width: size * 0.25,
                height: size * 0.55,
                borderWidth: 1.6,
                borderColor: color,
                borderTopLeftRadius: size * 0.125,
                borderTopRightRadius: size * 0.125,
                borderBottomWidth: 0,
              }}
            />
            <View
              style={{
                width: size * 0.45,
                height: size * 0.45,
                borderRadius: size * 0.225,
                backgroundColor: color,
                marginTop: -size * 0.1,
              }}
            />
          </View>
        );

      default:
        return (
          <View
            style={[
              {
                width: size * 0.5,
                height: size * 0.5,
                borderRadius: size * 0.25,
                backgroundColor: color,
              },
            ]}
          />
        );
    }
  };

  return <View style={[styles.container, style]}>{renderGlyph()}</View>;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

