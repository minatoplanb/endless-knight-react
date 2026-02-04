import React, { useRef, useCallback } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
  Text,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';

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

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
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

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: COLORS.buttonPrimary,
      borderColor: '#5577cc',
    },
    success: {
      backgroundColor: COLORS.buttonSuccess,
      borderColor: '#55cc55',
    },
    danger: {
      backgroundColor: COLORS.hpLow,
      borderColor: '#ff6666',
    },
    secondary: {
      backgroundColor: COLORS.bgLight,
      borderColor: COLORS.textDim,
    },
  };

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
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          variantStyles[variant],
          {
            paddingVertical: currentSizeStyle.paddingVertical,
            paddingHorizontal: currentSizeStyle.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
            transform: [{ scale: scaleAnim }],
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
    </TouchableWithoutFeedback>
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
