import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, ResourceType } from '../../types';
import {
  MAX_ENHANCEMENT_LEVEL,
  getEnhancementSuccessRate,
  isMaxEnhancement,
} from '../../data/enhancement';

const RESOURCE_NAMES: Record<ResourceType, string> = {
  ore: '礦石',
  wood: '木材',
  fish: '魚獲',
  herb: '草藥',
};

interface EnhancePanelProps {
  item: Equipment;
  onEnhanced?: () => void;
}

export const EnhancePanel = React.memo(({ item, onEnhanced }: EnhancePanelProps) => {
  const gold = useGameStore((state) => state.gold);
  const resources = useGameStore((state) => state.gathering.resources);
  const canEnhance = useGameStore((state) => state.canEnhanceEquipment);
  const getEnhancementCost = useGameStore((state) => state.getEnhancementCost);
  const enhanceEquipment = useGameStore((state) => state.enhanceEquipment);

  const currentLevel = item.enhancementLevel || 0;
  const maxLevel = MAX_ENHANCEMENT_LEVEL[item.rarity];
  const isMax = isMaxEnhancement(item.rarity, currentLevel);
  const successRate = getEnhancementSuccessRate(currentLevel);
  const cost = getEnhancementCost(item.id);
  const canAfford = canEnhance(item.id);

  const handleEnhance = useCallback(() => {
    const result = enhanceEquipment(item.id);
    Alert.alert(
      result.success ? '強化成功' : '強化結果',
      result.message,
      [{ text: '確定', onPress: onEnhanced }]
    );
  }, [item.id, enhanceEquipment, onEnhanced]);

  if (isMax) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>裝備強化</Text>
          <Text style={styles.levelText}>+{currentLevel} (已滿)</Text>
        </View>
        <Text style={styles.maxText}>已達最大強化等級！</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>裝備強化</Text>
        <Text style={styles.levelText}>
          +{currentLevel} → +{currentLevel + 1}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>成功率</Text>
        <Text style={[styles.infoValue, { color: successRate >= 0.7 ? COLORS.hpFull : successRate >= 0.5 ? COLORS.textGold : COLORS.hpLow }]}>
          {Math.round(successRate * 100)}%
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>最大等級</Text>
        <Text style={styles.infoValue}>+{maxLevel}</Text>
      </View>

      {cost && (
        <View style={styles.costSection}>
          <Text style={styles.costTitle}>強化費用</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>💰 金幣</Text>
            <Text style={[styles.costValue, gold < cost.gold && styles.costInsufficient]}>
              {cost.gold} ({gold})
            </Text>
          </View>
          {Object.entries(cost.resources).map(([resource, amount]) => (
            <View key={resource} style={styles.costRow}>
              <Text style={styles.costLabel}>{RESOURCE_NAMES[resource as ResourceType]}</Text>
              <Text
                style={[
                  styles.costValue,
                  resources[resource as ResourceType] < amount && styles.costInsufficient,
                ]}
              >
                {amount} ({resources[resource as ResourceType]})
              </Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.enhanceButton,
          !canAfford && styles.buttonDisabled,
          pressed && canAfford && styles.buttonPressed,
        ]}
        onPress={handleEnhance}
        disabled={!canAfford}
      >
        <Text style={styles.buttonText}>
          {canAfford ? '強化' : '資源不足'}
        </Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    padding: SPACING.md,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.textGold,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  levelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  maxText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  costSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.panel,
  },
  costTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginBottom: SPACING.xs,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  costLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  costValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.hpFull,
  },
  costInsufficient: {
    color: COLORS.hpLow,
  },
  enhanceButton: {
    backgroundColor: COLORS.textGold,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: scale(6),
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.bg,
    fontWeight: 'bold',
  },
});
