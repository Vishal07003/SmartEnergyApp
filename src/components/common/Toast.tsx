import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({ message, type, duration });
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [fadeAnim]);

  const getBackgroundColor = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return Colors.primary;
      case 'error':
        return Colors.danger;
      case 'info':
      default:
        return Colors.navyDark;
    }
  };

  const getIcon = (type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="#FFFFFF" />;
      case 'error':
        return <AlertCircle size={18} color="#FFFFFF" />;
      case 'info':
      default:
        return <Info size={18} color="#FFFFFF" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            { backgroundColor: getBackgroundColor(toast.type), opacity: fadeAnim },
          ]}
          pointerEvents="none"
        >
          {getIcon(toast.type)}
          <Text style={styles.toastText}>{toast.message}</Text>
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
    top: 54,
    left: Spacing.base,
    right: Spacing.base,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    gap: Spacing.sm,
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});

