import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, title?: string) => void;
  showToastWithOptions: (options: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const insets = useSafeAreaInsets();

  const translateYAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: -60,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [opacityAnim, translateYAnim]);

  const showToastWithOptions = useCallback(
    (options: ToastOptions) => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setToast(options);
      translateYAnim.setValue(-60);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(translateYAnim, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const duration = options.duration ?? 3500;
      hideTimerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacityAnim, translateYAnim]
  );

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500, title?: string) => {
      showToastWithOptions({ message, type, duration, title });
    },
    [showToastWithOptions]
  );

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const getTheme = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return {
          bg: '#FFFFFF',
          borderColor: '#A7F3D0',
          iconBg: '#E6F4EA',
          icon: <CheckCircle2 size={20} color={Colors.primary} />,
          titleColor: Colors.primaryDark,
          barColor: Colors.primary,
        };
      case 'error':
        return {
          bg: '#FFFFFF',
          borderColor: '#FECACA',
          iconBg: '#FEE2E2',
          icon: <AlertCircle size={20} color={Colors.danger} />,
          titleColor: Colors.danger,
          barColor: Colors.danger,
        };
      case 'warning':
        return {
          bg: '#FFFFFF',
          borderColor: '#FDE68A',
          iconBg: '#FEF3E2',
          icon: <AlertTriangle size={20} color={Colors.warning} />,
          titleColor: '#B45309',
          barColor: Colors.warning,
        };
      case 'info':
      default:
        return {
          bg: '#FFFFFF',
          borderColor: '#BAE6FD',
          iconBg: '#E0F2FE',
          icon: <Info size={20} color="#0284C7" />,
          titleColor: '#0369A1',
          barColor: '#0284C7',
        };
    }
  };

  const activeTheme = toast ? getTheme(toast.type) : null;
  const topInset = Math.max(insets.top, Platform.OS === 'android' ? 12 : 16);

  return (
    <ToastContext.Provider value={{ showToast, showToastWithOptions, hideToast }}>
      {children}
      {toast && activeTheme && (
        <Animated.View
          style={[
            styles.toastContainer,
            Shadows.card,
            {
              top: topInset + 8,
              backgroundColor: activeTheme.bg,
              borderColor: activeTheme.borderColor,
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Accent vertical bar */}
          <View style={[styles.accentBar, { backgroundColor: activeTheme.barColor }]} />

          {/* Icon in soft circular badge */}
          <View style={[styles.iconBadge, { backgroundColor: activeTheme.iconBg }]}>
            {activeTheme.icon}
          </View>

          {/* Message Content */}
          <View style={styles.textContainer}>
            {toast.title ? (
              <Text style={[styles.toastTitle, { color: activeTheme.titleColor }]} numberOfLines={1}>
                {toast.title}
              </Text>
            ) : null}
            <Text style={styles.toastMessage} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 99999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  toastTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  toastMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMain,
    lineHeight: 18,
    fontWeight: Typography.weights.medium,
  },
});
