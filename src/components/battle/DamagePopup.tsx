import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZES, scale } from '../../constants/theme';

interface DamagePopupProps {
  value: number;
  isCrit: boolean;
  isPlayerDamage: boolean;
  onComplete: () => void;
}

export const DamagePopupItem = React.memo<DamagePopupProps>(
  ({ value, isCrit, isPlayerDamage, onComplete }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;
    const scale = useRef(new Animated.Value(isCrit ? 1.5 : 1)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: isCrit ? 1 : 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(onComplete);
    }, []);

    const textColor = isPlayerDamage ? COLORS.damage : isCrit ? COLORS.crit : COLORS.text;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: isCrit ? FONT_SIZES.xxl : FONT_SIZES.xl,
            },
          ]}
        >
          {isPlayerDamage ? '-' : ''}{value}
          {isCrit && '!'}
        </Text>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  text: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
