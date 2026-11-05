import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  BackHandler,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react-native';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface DialogAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface DialogOptions {
  title: string;
  message: string;
  type?: DialogType;
  actions?: DialogAction[];
  cancelable?: boolean;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialogState, setDialogState] = useState<DialogOptions | null>(null);
  const [visible, setVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const hideDialog = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 160,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setDialogState(null);
    });
  }, [opacityAnim, scaleAnim]);

  const showDialog = useCallback(
    (options: DialogOptions) => {
      setDialogState(options);
      setVisible(true);
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [opacityAnim, scaleAnim]
  );

  // Handle hardware back button on Android
  useEffect(() => {
    if (!visible) return;
    const backAction = () => {
      if (dialogState?.cancelable !== false) {
        hideDialog();
        return true;
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [visible, dialogState, hideDialog]);

  const getIcon = (type: DialogType = 'info') => {
    switch (type) {
      case 'success':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E6F4EA' }]}>
            <CheckCircle2 size={28} color={Colors.primary} />
          </View>
        );
      case 'error':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <AlertCircle size={28} color={Colors.danger} />
          </View>
        );
      case 'warning':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FEF3E2' }]}>
            <AlertTriangle size={28} color={Colors.warning} />
          </View>
        );
      case 'info':
      default:
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Info size={28} color="#0284C7" />
          </View>
        );
    }
  };

  const defaultActions: DialogAction[] = [{ text: 'OK', style: 'default' }];
  const actions = dialogState?.actions && dialogState.actions.length > 0 ? dialogState.actions : defaultActions;

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {visible && dialogState && (
        <Modal
          transparent
          visible={visible}
          animationType="none"
          onRequestClose={() => {
            if (dialogState.cancelable !== false) {
              hideDialog();
            }
          }}
        >
          <View style={styles.backdrop}>
            {/* Backdrop touchable to dismiss if cancelable */}
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => {
                if (dialogState.cancelable !== false) {
                  hideDialog();
                }
              }}
            />

            <Animated.View
              style={[
                styles.dialogBox,
                Shadows.modal,
                {
                  opacity: opacityAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {/* Optional top-right close cross */}
              {dialogState.cancelable !== false && (
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={hideDialog}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={18} color={Colors.textSubtle} />
                </TouchableOpacity>
              )}

              {/* Icon */}
              <View style={styles.iconContainer}>{getIcon(dialogState.type)}</View>

              {/* Title & Message */}
              <Text style={styles.dialogTitle}>{dialogState.title}</Text>
              <Text style={styles.dialogMessage}>{dialogState.message}</Text>

              {/* Actions */}
              <View style={[styles.actionRow, actions.length > 2 && styles.actionColumn]}>
                {actions.map((act, idx) => {
                  const isCancel = act.style === 'cancel';
                  const isDestructive = act.style === 'destructive';

                  return (
                    <TouchableOpacity
                      key={idx}
                      activeOpacity={0.8}
                      style={[
                        styles.actionButton,
                        isCancel && styles.cancelButton,
                        isDestructive && styles.destructiveButton,
                        !isCancel && !isDestructive && styles.primaryButton,
                        actions.length > 2 && { width: '100%' },
                      ]}
                      onPress={() => {
                        hideDialog();
                        if (act.onPress) {
                          act.onPress();
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.actionText,
                          isCancel && styles.cancelText,
                          isDestructive && styles.destructiveText,
                          !isCancel && !isDestructive && styles.primaryText,
                        ]}
                      >
                        {act.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 23, 38, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialogBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    padding: Spacing.xs,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.navyDark,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  dialogMessage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
    justifyContent: 'flex-end',
  },
  actionColumn: {
    flexDirection: 'column',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  destructiveButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  cancelText: {
    color: Colors.textMain,
  },
  destructiveText: {
    color: Colors.danger,
  },
});

