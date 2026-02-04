import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { UpgradeButton } from './UpgradeButton';
import { UpgradeType } from '../../types';
import { useTranslation } from '../../locales';

const UPGRADE_TYPES: UpgradeType[] = ['hp', 'atk', 'def', 'speed', 'crit'];

// Calculate which upgrade is most recommended based on player stats
const getRecommendedUpgrade = (
  upgrades: Record<UpgradeType, number>,
  playerHp: number,
  maxHp: number,
  deaths: number
): UpgradeType => {
  // If player dies a lot, recommend HP or DEF
  if (deaths > 5 && playerHp < maxHp * 0.5) {
    // If HP level is lower than DEF level, recommend HP
    return upgrades.hp <= upgrades.def ? 'hp' : 'def';
  }

  // For early game (low total upgrades), recommend ATK for faster progression
  const totalLevels = Object.values(upgrades).reduce((a, b) => a + b, 0);
  if (totalLevels < 20) {
    return 'atk';
  }

  // Find the lowest upgraded stat (most value from upgrade)
  let lowestType: UpgradeType = 'atk';
  let lowestLevel = upgrades.atk;

  for (const type of UPGRADE_TYPES) {
    if (upgrades[type] < lowestLevel) {
      lowestLevel = upgrades[type];
      lowestType = type;
    }
  }

  return lowestType;
};

export const UpgradePanel = React.memo(() => {
  const { t } = useTranslation();
  const gold = useGameStore((state) => state.gold);
  const upgrades = useGameStore((state) => state.upgrades);
  const player = useGameStore((state) => state.player);
  const statistics = useGameStore((state) => state.statistics);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const getUpgradeCost = useGameStore((state) => state.getUpgradeCost);

  const recommendedUpgrade = useMemo(
    () => getRecommendedUpgrade(upgrades, player.currentHp, player.maxHp, statistics.totalDeaths),
    [upgrades, player.currentHp, player.maxHp, statistics.totalDeaths]
  );

  const handleUpgrade = useCallback((type: UpgradeType) => {
    buyUpgrade(type);
  }, [buyUpgrade]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('battle.upgrade')}</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {UPGRADE_TYPES.map((type) => (
          <UpgradeButton
            key={type}
            type={type}
            level={upgrades[type]}
            cost={getUpgradeCost(type)}
            currentGold={gold}
            onPress={handleUpgrade}
            isRecommended={type === recommendedUpgrade}
          />
        ))}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 2,
    backgroundColor: COLORS.panel,
    borderTopWidth: 2,
    borderTopColor: COLORS.bgLight,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});
