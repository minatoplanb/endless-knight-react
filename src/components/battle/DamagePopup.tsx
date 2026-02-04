import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, scale as themeScale } from '../../constants/theme';

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
    const scale = useRef(new Animated.Value(isCrit ? 2.0 : 1)).current;
    // Shake effect for crits - horizontal oscillation
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const animations = [
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
      ];

      // Add shake animation for crits
      if (isCrit) {
        animations.push(
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: 8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -8,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 6,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: -6,
              duration: 50,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 50,
              useNativeDriver: true,
            }),
          ])
        );
      }

      Animated.parallel(animations).start(onComplete);
    }, []);

    const textColor = isPlayerDamage ? COLORS.damage : isCrit ? COLORS.crit : COLORS.text;

    return (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { translateX }, { scale }],
            opacity,
          },
        ]}
      >
        {/* CRIT label above damage number */}
        {isCrit && !isPlayerDamage && (
          <Text style={styles.critLabel}>CRIT!</Text>
        )}
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
          {isCrit && !isPlayerDamage && '💥'}
        </Text>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
    alignItems: 'center',
  },
  critLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#ffd700',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 2,
  },
  text: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});
