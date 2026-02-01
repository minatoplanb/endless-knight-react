import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale, SCREEN } from '../../constants/theme';
import { HealthBar } from './HealthBar';
import { CharacterSprite } from './CharacterSprite';
import { DamagePopupItem } from './DamagePopup';

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

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <View style={styles.ground} />
      </View>

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
              <Text style={styles.characterLabel}>{enemy.name}</Text>
              <CharacterSprite
                isPlayer={false}
                isHurt={enemyHurt}
                isDead={enemy.currentHp <= 0}
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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 3,
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bgLight,
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: '#2a2a4e',
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
