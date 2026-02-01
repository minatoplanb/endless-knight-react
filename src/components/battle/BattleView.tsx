import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, ImageSourcePropType } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale, SCREEN } from '../../constants/theme';
import { HealthBar } from './HealthBar';
import { CharacterSprite } from './CharacterSprite';
import { DamagePopupItem } from './DamagePopup';

// Background images
const BACKGROUNDS: { [key: string]: ImageSourcePropType } = {
  forest: require('../../../assets/images/backgrounds/forest.png'),
  forest_autumn: require('../../../assets/images/backgrounds/forest_autumn.png'),
  forest_winter: require('../../../assets/images/backgrounds/forest_winter.png'),
  desert: require('../../../assets/images/backgrounds/desert.png'),
  dark_forest: require('../../../assets/images/backgrounds/dark_forest.png'),
  hell: require('../../../assets/images/backgrounds/hell.png'),
  hell_dark: require('../../../assets/images/backgrounds/hell_dark.png'),
};

// Enemy types by stage range
const ENEMY_TYPES = [
  'slime_green', 'slime_blue', 'rat', 'bat', 'mushroom',
  'slime_red', 'goblin', 'skeleton', 'orc', 'zombie',
  'skeleton_red', 'skeleton_gold', 'mimic',
];

// Get enemy type based on stage
const getEnemyType = (stage: number): string => {
  const index = (stage - 1) % ENEMY_TYPES.length;
  return ENEMY_TYPES[index];
};

// Get background based on stage
const getBackground = (stage: number): ImageSourcePropType => {
  if (stage <= 10) return BACKGROUNDS.forest;
  if (stage <= 20) return BACKGROUNDS.forest_autumn;
  if (stage <= 30) return BACKGROUNDS.forest_winter;
  if (stage <= 40) return BACKGROUNDS.desert;
  if (stage <= 50) return BACKGROUNDS.dark_forest;
  if (stage <= 60) return BACKGROUNDS.hell;
  return BACKGROUNDS.hell_dark;
};

// Get enemy display name
const getEnemyName = (type: string): string => {
  const names: { [key: string]: string } = {
    slime_green: '綠史萊姆',
    slime_blue: '藍史萊姆',
    slime_red: '紅史萊姆',
    goblin: '哥布林',
    skeleton: '骷髏',
    skeleton_red: '紅骷髏',
    skeleton_gold: '金骷髏',
    zombie: '殭屍',
    orc: '獸人',
    bat: '蝙蝠',
    rat: '巨鼠',
    mushroom: '毒蘑菇',
    mimic: '寶箱怪',
  };
  return names[type] || type;
};

export const BattleView = React.memo(() => {
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.currentEnemy);
  const damagePopups = useGameStore((state) => state.damagePopups);
  const removeDamagePopup = useGameStore((state) => state.removeDamagePopup);
  const stage = useGameStore((state) => state.stage);

  const [playerHurt, setPlayerHurt] = useState(false);
  const [enemyHurt, setEnemyHurt] = useState(false);
  const [prevPlayerHp, setPrevPlayerHp] = useState(player.currentHp);
  const [prevEnemyHp, setPrevEnemyHp] = useState(enemy?.currentHp ?? 0);

  // Detect damage
  useEffect(() => {
    if (player.currentHp < prevPlayerHp) {
      setPlayerHurt(true);
      setTimeout(() => setPlayerHurt(false), 200);
    }
    setPrevPlayerHp(player.currentHp);
  }, [player.currentHp]);

  useEffect(() => {
    if (enemy && enemy.currentHp < prevEnemyHp) {
      setEnemyHurt(true);
      setTimeout(() => setEnemyHurt(false), 200);
    }
    setPrevEnemyHp(enemy?.currentHp ?? 0);
  }, [enemy?.currentHp]);

  const currentEnemyType = getEnemyType(stage.currentStage);
  const currentBackground = getBackground(stage.currentStage);

  return (
    <View style={styles.container}>
      {/* Background */}
      <ImageBackground
        source={currentBackground}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Battle area */}
        <View style={styles.battleArea}>
          {/* Player */}
          <View style={styles.characterContainer}>
            <Text style={styles.characterLabel}>騎士</Text>
            <CharacterSprite
              isPlayer={true}
              isHurt={playerHurt}
              isDead={player.currentHp <= 0}
            />
            <View style={styles.healthBarContainer}>
              <HealthBar
                currentHp={player.currentHp}
                maxHp={player.maxHp}
                width={scale(120)}
              />
            </View>
          </View>

          {/* VS indicator */}
          {!stage.isTraveling && enemy && (
            <Text style={styles.vsText}>VS</Text>
          )}

          {/* Enemy */}
          <View style={styles.characterContainer}>
            {enemy && !stage.isTraveling ? (
              <>
                <Text style={styles.characterLabel}>{getEnemyName(currentEnemyType)}</Text>
                <CharacterSprite
                  isPlayer={false}
                  isHurt={enemyHurt}
                  isDead={enemy.currentHp <= 0}
                  enemyType={currentEnemyType}
                />
                <View style={styles.healthBarContainer}>
                  <HealthBar
                    currentHp={enemy.currentHp}
                    maxHp={enemy.maxHp}
                    width={scale(120)}
                  />
                </View>
              </>
            ) : (
              <View style={styles.emptyEnemy}>
                <Text style={styles.emptyText}>...</Text>
              </View>
            )}
          </View>
        </View>

        {/* Damage popups */}
        <View style={styles.popupContainer}>
          {damagePopups.map((popup) => (
            <View
              key={popup.id}
              style={[
                styles.popupWrapper,
                {
                  left: popup.isPlayerDamage ? '25%' : '75%',
                },
              ]}
            >
              <DamagePopupItem
                value={popup.value}
                isCrit={popup.isCrit}
                isPlayerDamage={popup.isPlayerDamage}
                onComplete={() => removeDamagePopup(popup.id)}
              />
            </View>
          ))}
        </View>
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 3,
    position: 'relative',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  battleArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  characterContainer: {
    alignItems: 'center',
    minWidth: scale(120),
  },
  characterLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: 'bold',
  },
  healthBarContainer: {
    marginTop: SPACING.sm,
  },
  vsText: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textDim,
    fontWeight: 'bold',
  },
  emptyEnemy: {
    width: scale(80),
    height: scale(80),
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  emptyText: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textDim,
  },
  popupContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  popupWrapper: {
    position: 'absolute',
    top: '40%',
    transform: [{ translateX: -20 }],
  },
});
