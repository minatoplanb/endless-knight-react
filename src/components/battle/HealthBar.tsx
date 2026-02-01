import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, FONT_SIZES, scale } from '../../constants/theme';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  width?: number;
  height?: number;
  showText?: boolean;
}

export const HealthBar = React.memo<HealthBarProps>(
  ({ currentHp, maxHp, width = scale(150), height = scale(16), showText = true }) => {
    const hpPercent = Math.max(0, Math.min(1, currentHp / maxHp));

    const getHpColor = () => {
      if (hpPercent > 0.5) return COLORS.hpFull;
      if (hpPercent > 0.25) return COLORS.hpMid;
      return COLORS.hpLow;
    };

    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.background}>
          <View
            style={[
              styles.fill,
              {
                width: `${hpPercent * 100}%`,
                backgroundColor: getHpColor(),
              },
            ]}
          />
        </View>
        {showText && (
          <View style={styles.textContainer}>
            <Text style={styles.text}>
              {Math.floor(currentHp)} / {maxHp}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    flex: 1,
    backgroundColor: COLORS.hpBg,
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: scale(4),
  },
  textContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
