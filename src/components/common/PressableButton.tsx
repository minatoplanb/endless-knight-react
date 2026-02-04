import React, { useRef, useCallback, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { audioManager } from '../../lib/audio';

interface PressableButtonProps {
  onPress: () => void;
  title?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

// Variant colors with hover/pressed states
const VARIANT_STYLES = {
  primary: {
    bg: COLORS.buttonPrimary,
    border: '#5577cc',
    borderBottom: '#3355aa',
    hoverBg: '#5577cc',
  },
  success: {
    bg: COLORS.buttonSuccess,
    border: '#55cc55',
    borderBottom: '#338833',
    hoverBg: '#55bb55',
  },
  danger: {
    bg: COLORS.hpLow,
    border: '#ff6666',
    borderBottom: '#cc4444',
    hoverBg: '#ff5555',
  },
  secondary: {
    bg: COLORS.bgLight,
    border: COLORS.textDim,
    borderBottom: '#444466',
    hoverBg: '#252550',
  },
};

export const PressableButton: React.FC<PressableButtonProps> = ({
  onPress,
  title,
  children,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = useCallback(() => {
    setIsPressed(true);
    if (!disabled) {
      audioManager.playClick();
    }
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim, disabled]);

  const handlePressOut = useCallback(() => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onPress();
    }
  }, [disabled, onPress]);

  const variantStyle = VARIANT_STYLES[variant];

  const sizeStyles: Record<string, { paddingVertical: number; paddingHorizontal: number; fontSize: number }> = {
    small: {
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      fontSize: FONT_SIZES.sm,
    },
    medium: {
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.lg,
      fontSize: FONT_SIZES.md,
    },
    large: {
      paddingVertical: SPACING.lg,
      paddingHorizontal: SPACING.xl,
      fontSize: FONT_SIZES.lg,
    },
  };

  const currentSizeStyle = sizeStyles[size];

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      {(state) => {
        const hovered = Platform.OS === 'web' && (state as any).hovered;
        return (
          <Animated.View
            style={[
              styles.button,
              {
                backgroundColor: hovered && !disabled ? variantStyle.hoverBg : variantStyle.bg,
                borderColor: variantStyle.border,
                borderBottomColor: variantStyle.borderBottom,
                paddingVertical: currentSizeStyle.paddingVertical,
                paddingHorizontal: currentSizeStyle.paddingHorizontal,
                opacity: disabled ? 0.5 : 1,
                transform: [{ scale: scaleAnim }],
                // Pressed effect: reduce bottom border to simulate pushing down
                borderBottomWidth: isPressed && !disabled ? 2 : 4,
                marginTop: isPressed && !disabled ? 2 : 0,
              },
              style,
            ]}
          >
            {children || (
              <Text
                style={[
                  styles.text,
                  { fontSize: currentSizeStyle.fontSize },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </Animated.View>
        );
      }}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: scale(8),
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PressableButton;
