import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { UpgradeButton } from './UpgradeButton';
import { UpgradeType } from '../../types';

const UPGRADE_TYPES: UpgradeType[] = ['hp', 'atk', 'def', 'speed', 'crit'];

export const UpgradePanel = React.memo(() => {
  const gold = useGameStore((state) => state.gold);
  const upgrades = useGameStore((state) => state.upgrades);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);
  const getUpgradeCost = useGameStore((state) => state.getUpgradeCost);

  const handleUpgrade = useCallback((type: UpgradeType) => {
    buyUpgrade(type);
  }, [buyUpgrade]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>升級</Text>
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
