import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { ResourceType } from '../../types';
import { RESOURCES, ALL_RESOURCES, RESOURCE_CAP_UPGRADE, getResourceCapUpgradeCost } from '../../data/resources';
import { useGameStore } from '../../store/useGameStore';
import { PressableButton } from '../common/PressableButton';
import { formatNumber } from '../../utils/format';
import { useTranslation } from '../../locales';

interface ResourceItemProps {
  resourceType: ResourceType;
}

const ResourceItem = React.memo(({ resourceType }: ResourceItemProps) => {
  const amount = useGameStore((state) => state.gathering.resources[resourceType]);
  const cap = useGameStore((state) => state.gathering.resourceCaps[resourceType]);
  const resourceDef = RESOURCES[resourceType];

  const isFull = amount >= cap;

  return (
    <View style={styles.resourceItem}>
      <Text style={styles.resourceIcon}>{resourceDef.icon}</Text>
      <Text style={[styles.resourceText, isFull && styles.resourceFull]}>
        {amount}/{cap}
      </Text>
    </View>
  );
});

export const ResourceBar = React.memo(() => {
  const { t, locale } = useTranslation();
  const resourceCapLevel = useGameStore((state) => state.gathering.resourceCapLevel ?? 0);
  const gold = useGameStore((state) => state.gold);
  const upgradeResourceCap = useGameStore((state) => state.upgradeResourceCap);

  const currentLevel = resourceCapLevel ?? 0;
  const upgradeCost = getResourceCapUpgradeCost(currentLevel);
  const isMaxLevel = currentLevel >= RESOURCE_CAP_UPGRADE.maxLevel;
  const canAfford = gold >= upgradeCost;

  const handleUpgrade = useCallback(() => {
    upgradeResourceCap();
  }, [upgradeResourceCap]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {locale === 'zh' ? '資源倉庫' : 'Storage'}
        </Text>
        <Text style={styles.levelText}>
          {locale === 'zh' ? `等級 ${currentLevel}/${RESOURCE_CAP_UPGRADE.maxLevel}` : `Lv ${currentLevel}/${RESOURCE_CAP_UPGRADE.maxLevel}`}
        </Text>
      </View>
      <View style={styles.resourceGrid}>
        {ALL_RESOURCES.map((resourceType) => (
          <ResourceItem key={resourceType} resourceType={resourceType} />
        ))}
      </View>
      {!isMaxLevel && (
        <PressableButton
          onPress={handleUpgrade}
          disabled={!canAfford}
          variant="primary"
          size="small"
          style={styles.upgradeButton}
        >
          <Text style={styles.upgradeText}>
            {locale === 'zh' ? `📦 擴充容量 (+250)` : `📦 Expand (+250)`}
          </Text>
          <Text style={[styles.upgradeCost, !canAfford && styles.costDisabled]}>
            💰 {formatNumber(upgradeCost)}
          </Text>
        </PressableButton>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(8),
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
  },
  levelText: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.xs,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.xs,
  },
  resourceIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  resourceText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  resourceFull: {
    color: COLORS.textGold,
  },
  upgradeButton: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  upgradeText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  upgradeCost: {
    color: COLORS.textGold,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  costDisabled: {
    color: COLORS.textDim,
  },
});
