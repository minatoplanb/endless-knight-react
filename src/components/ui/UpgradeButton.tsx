import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale, LAYOUT } from '../../constants/theme';
import { formatNumber } from '../../utils/format';
import { UpgradeType } from '../../types';

interface UpgradeButtonProps {
  type: UpgradeType;
  level: number;
  cost: number;
  currentGold: number;
  onPress: (type: UpgradeType) => void;
  isRecommended?: boolean;
}

const UPGRADE_INFO: Record<UpgradeType, { label: string; icon: string; description: string }> = {
  hp: { label: 'HP', icon: '❤️', description: '+15 生命' },
  atk: { label: 'ATK', icon: '⚔️', description: '+5 攻擊' },
  def: { label: 'DEF', icon: '🛡️', description: '+3 防禦' },
  speed: { label: 'SPD', icon: '⚡', description: '+5% 攻速' },
  crit: { label: 'CRIT', icon: '💥', description: '+0.5% 暴擊' },
};

export const UpgradeButton = React.memo<UpgradeButtonProps>(
  ({ type, level, cost, currentGold, onPress, isRecommended }) => {
    const canAfford = currentGold >= cost;
    const info = UPGRADE_INFO[type];

    const handlePress = useCallback(() => {
      if (canAfford) {
        onPress(type);
      }
    }, [canAfford, onPress, type]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          !canAfford && styles.disabled,
          pressed && canAfford && styles.pressed,
          isRecommended && canAfford && styles.recommended,
        ]}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{info.icon}</Text>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>{info.label}</Text>
            <Text style={styles.level}>Lv.{level}</Text>
            {isRecommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>推薦</Text>
              </View>
            )}
          </View>
          <Text style={styles.description}>{info.description}</Text>
        </View>

        <View style={styles.costContainer}>
          <Text style={[styles.cost, !canAfford && styles.costDisabled]}>
            💰 {formatNumber(cost)}
          </Text>
        </View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: scale(8),
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: LAYOUT.minTouchSize,
  },
  disabled: {
    backgroundColor: COLORS.buttonDisabled,
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  recommended: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  recommendedBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 1,
    borderRadius: scale(4),
    marginLeft: SPACING.xs,
  },
  recommendedText: {
    fontSize: FONT_SIZES.xs - 2,
    color: '#fff',
    fontWeight: 'bold',
  },
  iconContainer: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: FONT_SIZES.xl,
  },
  infoContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
  },
  level: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  costContainer: {
    paddingLeft: SPACING.md,
  },
  cost: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  costDisabled: {
    color: COLORS.textDim,
  },
});
