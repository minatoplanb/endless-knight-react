import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, ImageSourcePropType } from 'react-native';
import { scale } from '../../constants/theme';
import { CombatStyle, COMBAT_STYLE_TINTS } from '../../data/combatStyles';

// Image imports - can add more player sprites later
const PLAYER_IMAGE = require('../../../assets/images/player/warrior.png');
// TODO: Add different sprites for each combat style
// const PLAYER_IMAGES: Record<CombatStyle, ImageSourcePropType> = {
//   melee: require('../../../assets/images/player/warrior.png'),
//   ranged: require('../../../assets/images/player/archer.png'),
//   magic: require('../../../assets/images/player/mage.png'),
// };
const ENEMY_IMAGES: { [key: string]: ImageSourcePropType } = {
  slime_green: require('../../../assets/images/enemies/slime_green.png'),
  slime_blue: require('../../../assets/images/enemies/slime_blue.png'),
  slime_red: require('../../../assets/images/enemies/slime_red.png'),
  goblin: require('../../../assets/images/enemies/goblin.png'),
  skeleton: require('../../../assets/images/enemies/skeleton.png'),
  skeleton_red: require('../../../assets/images/enemies/skeleton_red.png'),
  skeleton_gold: require('../../../assets/images/enemies/skeleton_gold.png'),
  zombie: require('../../../assets/images/enemies/zombie.png'),
  orc: require('../../../assets/images/enemies/orc.png'),
  bat: require('../../../assets/images/enemies/bat.png'),
  rat: require('../../../assets/images/enemies/rat.png'),
  mushroom: require('../../../assets/images/enemies/mushroom.png'),
  mimic: require('../../../assets/images/enemies/mimic.png'),
};

// Get enemy image based on type
export const getEnemyImage = (enemyType: string): ImageSourcePropType => {
  return ENEMY_IMAGES[enemyType] || ENEMY_IMAGES.slime_green;
};

// Sprites that are ALREADY facing left (don't need to be flipped)
// Most sprites face right and need flipping to face left
const SPRITES_FACING_LEFT = ['rat', 'mushroom'];

interface CharacterSpriteProps {
  isPlayer?: boolean;
  isHurt?: boolean;
  isDead?: boolean;
  size?: number;
  enemyType?: string;
  isBoss?: boolean;
  combatStyle?: CombatStyle;
}

export const CharacterSprite = React.memo<CharacterSpriteProps>(
  ({ isPlayer = true, isHurt = false, isDead = false, size = scale(100), enemyType = 'slime_green', isBoss = false, combatStyle = 'melee' }) => {
    // Bosses are 50% larger
    const actualSize = isBoss ? size * 1.5 : size;
    const opacityAnim = useRef(new Animated.Value(1)).current;
    const tintAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (isHurt) {
        // Flash when hurt
        Animated.sequence([
          Animated.timing(tintAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(tintAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
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

    const imageSource = isPlayer ? PLAYER_IMAGE : getEnemyImage(enemyType);

    // Player faces RIGHT (→) - original sprite already faces right, no flip needed
    // Enemies face LEFT (←) - most sprites face right and need flipping
    // Exception: some sprites already face left, don't flip those
    const shouldFlip = !isPlayer && !SPRITES_FACING_LEFT.includes(enemyType);

    return (
      <Animated.View
        style={[
          styles.container,
          {
            width: actualSize,
            height: actualSize,
            opacity: opacityAnim,
          },
          isBoss && styles.bossContainer,
        ]}
      >
        <Image
          source={imageSource}
          style={[
            styles.sprite,
            {
              width: actualSize,
              height: actualSize,
              transform: shouldFlip ? [{ scaleX: -1 }] : [],
            },
          ]}
          resizeMode="contain"
        />
        {/* Combat style tint for player */}
        {isPlayer && (
          <View
            style={[
              styles.styleTint,
              {
                width: actualSize,
                height: actualSize,
                backgroundColor: COMBAT_STYLE_TINTS[combatStyle],
              },
            ]}
          />
        )}
        {/* Hurt overlay */}
        <Animated.View
          style={[
            styles.hurtOverlay,
            {
              width: actualSize,
              height: actualSize,
              opacity: tintAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        />
        {/* Boss indicator removed - was causing visual issues */}
      </Animated.View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bossContainer: {
    // Boss has a subtle shadow effect
  },
  sprite: {
    // Image styles
  },
  hurtOverlay: {
    position: 'absolute',
    backgroundColor: '#ff0000',
    borderRadius: scale(8),
  },
  styleTint: {
    position: 'absolute',
    opacity: 0.15,
    borderRadius: scale(8),
  },
});
