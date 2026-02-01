import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, scale } from '../../constants/theme';

interface CharacterSpriteProps {
  isPlayer?: boolean;
  isHurt?: boolean;
  isDead?: boolean;
  size?: number;
}

export const CharacterSprite = React.memo<CharacterSpriteProps>(
  ({ isPlayer = true, isHurt = false, isDead = false, size = scale(80) }) => {
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const hurtAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isHurt) {
        // Flash red when hurt
        Animated.sequence([
          Animated.timing(hurtAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(hurtAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: false,
          }),
        ]).start();
      }
    }, [isHurt]);

    useEffect(() => {
      if (isDead) {
        // Fade out when dead
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        opacityAnim.setValue(1);
      }
    }, [isDead]);

    const backgroundColor = hurtAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [isPlayer ? COLORS.buttonPrimary : COLORS.buttonDanger, COLORS.damage],
    });

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            opacity: opacityAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.sprite,
            {
              backgroundColor,
              width: size,
              height: size,
            },
          ]}
        >
          <View style={[styles.face, { top: size * 0.2 }]}>
            <View style={[styles.eye, { marginRight: size * 0.15 }]} />
            <View style={styles.eye} />
          </View>
          <View
            style={[
              styles.mouth,
              {
                top: size * 0.55,
                width: size * 0.3,
                height: size * 0.1,
              },
            ]}
          />
        </Animated.View>
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sprite: {
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  face: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  eye: {
    width: scale(10),
    height: scale(10),
    backgroundColor: COLORS.text,
    borderRadius: scale(5),
  },
  mouth: {
    position: 'absolute',
    backgroundColor: COLORS.bg,
    borderRadius: scale(4),
  },
});
