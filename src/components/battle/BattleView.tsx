import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Platform } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale, SCREEN } from '../../constants/theme';
import { HealthBar } from './HealthBar';
import { CharacterSprite } from './CharacterSprite';
import { DamagePopupItem } from './DamagePopup';
import { LootNotificationItem } from './LootNotification';
import { getAreaById, AreaEnemy } from '../../data/areas';
import { COMBAT_STYLES, hasAdvantage, CombatStyle } from '../../data/combatStyles';
import { useTranslation } from '../../locales';

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

// Get background from area data or fallback
const getBackgroundForArea = (areaId: string): ImageSourcePropType => {
  const area = getAreaById(areaId);
  if (area && BACKGROUNDS[area.background]) {
    return BACKGROUNDS[area.background];
  }
  return BACKGROUNDS.forest; // default fallback
};

// Find enemy sprite from area by enemy name
const findEnemySpriteByName = (areaId: string, enemyName: string): string => {
  const area = getAreaById(areaId);
  if (area) {
    const areaEnemy = area.enemies.find((e) => e.name === enemyName);
    if (areaEnemy) {
      return areaEnemy.sprite;
    }
  }
  // Fallback: try to find a matching sprite from the name
  const nameToSprite: { [key: string]: string } = {
    '綠史萊姆': 'slime_green',
    '藍史萊姆': 'slime_blue',
    '紅史萊姆': 'slime_red',
    '哥布林': 'goblin',
    '骷髏': 'skeleton',
    '紅骷髏': 'skeleton_red',
    '金骷髏': 'skeleton_gold',
    '殭屍': 'zombie',
    '獸人': 'orc',
    '蝙蝠': 'bat',
    '巨鼠': 'rat',
    '毒蘑菇': 'mushroom',
    '寶箱怪': 'mimic',
  };
  return nameToSprite[enemyName] || 'slime_green';
};

// Combat Style Effectiveness Indicator
const CombatStyleIndicator = React.memo<{ playerStyle: CombatStyle; enemyStyle: CombatStyle }>(
  ({ playerStyle, enemyStyle }) => {
    const playerInfo = COMBAT_STYLES[playerStyle];
    const enemyInfo = COMBAT_STYLES[enemyStyle];
    const playerHasAdvantage = hasAdvantage(playerStyle, enemyStyle);
    const enemyHasAdvantage = hasAdvantage(enemyStyle, playerStyle);

    let statusText = '中立';
    let statusColor = COLORS.textDim;
    let statusIcon = '⚖️';

    if (playerHasAdvantage) {
      statusText = '優勢 2倍傷害';
      statusColor = '#22c55e';
      statusIcon = '⬆️';
    } else if (enemyHasAdvantage) {
      statusText = '劣勢 受2倍傷害';
      statusColor = '#ef4444';
      statusIcon = '⬇️';
    }

    return (
      <View style={styleIndicatorStyles.container}>
        <View style={styleIndicatorStyles.row}>
          <Text style={[styleIndicatorStyles.icon, { color: playerInfo.color }]}>
            {playerInfo.icon}
          </Text>
          <Text style={styleIndicatorStyles.vs}>vs</Text>
          <Text style={[styleIndicatorStyles.icon, { color: enemyInfo.color }]}>
            {enemyInfo.icon}
          </Text>
        </View>
        <View style={[styleIndicatorStyles.statusBadge, { backgroundColor: statusColor + '30' }]}>
          <Text style={[styleIndicatorStyles.statusText, { color: statusColor }]}>
            {statusIcon} {statusText}
          </Text>
        </View>
      </View>
    );
  }
);

const styleIndicatorStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: SPACING.sm,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(12),
  },
  icon: {
    fontSize: FONT_SIZES.md,
  },
  vs: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginHorizontal: SPACING.sm,
  },
  statusBadge: {
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: scale(8),
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
});

export const BattleView = React.memo(() => {
  const { t, getDataName } = useTranslation();
  const player = useGameStore((state) => state.player);
  const enemy = useGameStore((state) => state.currentEnemy);
  const damagePopups = useGameStore((state) => state.damagePopups);
  const removeDamagePopup = useGameStore((state) => state.removeDamagePopup);
  const lootNotifications = useGameStore((state) => state.lootNotifications);
  const removeLootNotification = useGameStore((state) => state.removeLootNotification);
  const stage = useGameStore((state) => state.stage);
  const playerCombatStyle = useGameStore((state) => state.combatStyle);
  const killStreak = useGameStore((state) => state.statistics.currentKillStreak);

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

  // Get background and enemy sprite from area data
  const currentBackground = useMemo(
    () => getBackgroundForArea(stage.currentAreaId),
    [stage.currentAreaId]
  );
  // Use sprite from enemy data directly
  const currentEnemyType = useMemo(
    () => (enemy?.sprite || findEnemySpriteByName(stage.currentAreaId, enemy?.name || '')),
    [enemy?.sprite, enemy?.name, stage.currentAreaId]
  );
  const isBoss = enemy?.isBoss || false;

  return (
    <View style={styles.container}>
      {/* Background Image - absolute positioned */}
      <Image
        source={currentBackground}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Combat Style Indicator */}
      {enemy && !stage.isTraveling && (
        <CombatStyleIndicator
          playerStyle={playerCombatStyle}
          enemyStyle={enemy.combatStyle}
        />
      )}

      {/* Kill Streak Badge - only show if streak >= 5 */}
      {killStreak >= 5 && !stage.isTraveling && (
        <View style={styles.killStreakContainer}>
          <Text style={styles.killStreakText}>🔥 {killStreak}</Text>
        </View>
      )}

      {/* Traveling Indicator - centered overlay */}
      {stage.isTraveling && (
        <View style={styles.travelingOverlay}>
          <View style={styles.travelingCard}>
            <Text style={styles.travelingEmoji}>🚶‍♂️</Text>
            <Text style={styles.travelingLabel}>{t('battle.traveling')}</Text>
            <View style={styles.travelingProgressOuter}>
              <View
                style={[
                  styles.travelingProgressInner,
                  { width: `${stage.travelProgress}%` },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* Battle area - on top of background */}
      <View style={styles.battleArea}>
          {/* Player */}
          <View style={styles.characterContainer}>
            <Text style={styles.characterLabel}>{t('battle.warrior')}</Text>
            <CharacterSprite
              isPlayer={true}
              isHurt={playerHurt}
              isDead={player.currentHp <= 0}
              combatStyle={playerCombatStyle}
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
                {isBoss && (
                  <Text style={styles.bossTitle}>{enemy.bossTitle}</Text>
                )}
                <Text style={[styles.characterLabel, isBoss && styles.bossLabel]}>
                  {isBoss ? `👑 ${getDataName('boss', enemy.id, enemy.name)}` : getDataName('enemy', enemy.id, enemy.name)}
                </Text>
                <CharacterSprite
                  isPlayer={false}
                  isHurt={enemyHurt}
                  isDead={enemy.currentHp <= 0}
                  enemyType={currentEnemyType}
                  isBoss={isBoss}
                />
                <View style={styles.healthBarContainer}>
                  <HealthBar
                    currentHp={enemy.currentHp}
                    maxHp={enemy.maxHp}
                    width={scale(isBoss ? 140 : 120)}
                    isBoss={isBoss}
                  />
                </View>
              </>
            ) : (
              <View style={styles.travelingPlaceholder} />
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
              isAdvantage={popup.isAdvantage}
              onComplete={() => removeDamagePopup(popup.id)}
            />
          </View>
        ))}
      </View>

      {/* Loot notifications */}
      <View style={styles.lootContainer}>
        {lootNotifications.map((notification) => (
          <LootNotificationItem
            key={notification.id}
            icon={notification.icon}
            text={notification.text}
            color={notification.color}
            onComplete={() => removeLootNotification(notification.id)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 3,
    backgroundColor: '#1a3a1a', // Fallback forest color
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  battleArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    zIndex: 1,
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
  bossLabel: {
    fontSize: FONT_SIZES.md,
    color: '#fbbf24',
  },
  bossTitle: {
    fontSize: FONT_SIZES.xs,
    color: '#ef4444',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  healthBarContainer: {
    marginTop: SPACING.sm,
  },
  vsText: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.textDim,
    fontWeight: 'bold',
  },
  travelingContainer: {
    width: scale(100),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: scale(12),
    padding: SPACING.md,
  },
  travelingIcon: {
    fontSize: FONT_SIZES.xxl,
    marginBottom: SPACING.xs,
  },
  travelingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginBottom: SPACING.sm,
  },
  travelingProgressContainer: {
    width: '100%',
    height: scale(4),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: scale(2),
    overflow: 'hidden',
  },
  travelingProgressBar: {
    height: '100%',
    backgroundColor: COLORS.textGold,
    borderRadius: scale(2),
  },
  travelingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  travelingCard: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: scale(16),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  travelingEmoji: {
    fontSize: scale(32),
    marginBottom: SPACING.sm,
  },
  travelingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  travelingProgressOuter: {
    width: scale(120),
    height: scale(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: scale(3),
    overflow: 'hidden',
  },
  travelingProgressInner: {
    height: '100%',
    backgroundColor: COLORS.textGold,
    borderRadius: scale(3),
  },
  travelingPlaceholder: {
    width: scale(120),
    height: scale(100),
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
  lootContainer: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  killStreakContainer: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.md,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: scale(12),
    zIndex: 10,
  },
  killStreakText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
