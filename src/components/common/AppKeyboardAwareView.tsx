import React, { useRef, useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  ViewStyle,
  KeyboardEvent,
  View,
  findNodeHandle,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface AppKeyboardAwareViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  keyboardVerticalOffset?: number;
  bounces?: boolean;
  extraScrollHeight?: number;
}

export const AppKeyboardAwareView: React.FC<AppKeyboardAwareViewProps> = ({
  children,
  style,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  bounces = false,
  extraScrollHeight = 120,
}) => {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [keyboardSpace, setKeyboardSpace] = useState<number>(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const scrollToFocusedInput = () => {
      const currentlyFocusedInput = TextInput.State?.currentlyFocusedInput
        ? TextInput.State.currentlyFocusedInput()
        : TextInput.State?.currentlyFocusedField
        ? TextInput.State.currentlyFocusedField()
        : null;

      if (!currentlyFocusedInput || !scrollRef.current) {
        return;
      }

      const scrollResponder = (scrollRef.current as any)?.getScrollResponder?.();
      if (scrollResponder && typeof scrollResponder.scrollResponderScrollNativeHandleToKeyboard === 'function') {
        const nodeHandle =
          typeof currentlyFocusedInput === 'number'
            ? currentlyFocusedInput
            : findNodeHandle(currentlyFocusedInput as any);

        if (nodeHandle) {
          scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
            nodeHandle,
            extraScrollHeight,
            true
          );
        }
      }
    };

    const onKeyboardShow = (e: KeyboardEvent) => {
      const height = e.endCoordinates.height;
      setKeyboardSpace(height);
      // Give layout a frame to apply dynamic padding, then scroll focused input above keyboard
      setTimeout(scrollToFocusedInput, 100);
    };

    const onKeyboardHide = () => {
      setKeyboardSpace(0);
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [extraScrollHeight]);

  const defaultOffset =
    Platform.OS === 'ios' ? insets.top + keyboardVerticalOffset : keyboardVerticalOffset;

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={defaultOffset}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.innerWrapper}>
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              contentContainerStyle,
              // Generous bottom clearance when keyboard is active
              {
                paddingBottom:
                  (contentContainerStyle?.paddingBottom
                    ? Number(contentContainerStyle.paddingBottom)
                    : 24) + (keyboardSpace > 0 ? keyboardSpace + extraScrollHeight : 24),
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={bounces}
          >
            {children}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  innerWrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
