import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { BACKPACK_MAX_LEVEL } from '../../data/equipment';

export const BackpackUpgradePanel = React.memo(() => {
  const gold = useGameStore((state) => state.gold);
  const backpackLevel = useGameStore((state) => state.backpackLevel);
  const inventory = useGameStore((state) => state.inventory);
  const getBackpackCapacity = useGameStore((state) => state.getBackpackCapacity);
  const getBackpackUpgradeCost = useGameStore((state) => state.getBackpackUpgradeCost);
  const buyBackpackUpgrade = useGameStore((state) => state.buyBackpackUpgrade);

  const capacity = getBackpackCapacity();
  const cost = getBackpackUpgradeCost();
  const usedSlots = inventory.length;
  const isMaxLevel = backpackLevel >= BACKPACK_MAX_LEVEL;
  const canAfford = gold >= cost;
  const canUpgrade = !isMaxLevel && canAfford;

  const usagePercent = capacity > 0 ? (usedSlots / capacity) * 100 : 0;

  const handleUpgrade = () => {
    if (canUpgrade) {
      buyBackpackUpgrade();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>背包容量</Text>
        <Text style={styles.levelText}>
          Lv.{backpackLevel}/{BACKPACK_MAX_LEVEL}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.min(usagePercent, 100)}%` },
              usagePercent >= 90 && styles.progressWarning,
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {usedSlots} / {capacity}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.upgradeButton,
          !canUpgrade && styles.buttonDisabled,
          pressed && canUpgrade && styles.buttonPressed,
        ]}
        onPress={handleUpgrade}
        disabled={!canUpgrade}
      >
        {isMaxLevel ? (
          <Text style={styles.buttonText}>已滿級</Text>
        ) : (
          <>
            <Text style={styles.buttonText}>升級 +20 格</Text>
            <Text style={[styles.costText, !canAfford && styles.costInsufficient]}>
              {cost} 金幣
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  levelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBg: {
    flex: 1,
    height: scale(16),
    backgroundColor: COLORS.hpBg,
    borderRadius: scale(8),
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: scale(8),
  },
  progressWarning: {
    backgroundColor: COLORS.hpLow,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    minWidth: scale(60),
    textAlign: 'right',
  },
  upgradeButton: {
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: scale(8),
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  costText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
  },
  costInsufficient: {
    color: COLORS.hpLow,
  },
});
