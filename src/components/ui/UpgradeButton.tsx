import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale, LAYOUT } from '../../constants/theme';
import { formatNumber } from '../../utils/format';
import { UpgradeType } from '../../types';
import { useTranslation } from '../../locales';
import { audioManager } from '../../lib/audio';

interface UpgradeButtonProps {
  type: UpgradeType;
  level: number;
  cost: number;
  currentGold: number;
  onPress: (type: UpgradeType) => void;
  isRecommended?: boolean;
}

const UPGRADE_KEYS: Record<UpgradeType, { labelKey: string; descKey: string; icon: string }> = {
  hp: { labelKey: 'battle.upgradeHp', descKey: 'battle.hpDesc', icon: '❤️' },
  atk: { labelKey: 'battle.upgradeAtk', descKey: 'battle.atkDesc', icon: '⚔️' },
  def: { labelKey: 'battle.upgradeDef', descKey: 'battle.defDesc', icon: '🛡️' },
  speed: { labelKey: 'battle.upgradeSpeed', descKey: 'battle.speedDesc', icon: '⚡' },
  crit: { labelKey: 'battle.upgradeCrit', descKey: 'battle.critDesc', icon: '💥' },
};

export const UpgradeButton = React.memo<UpgradeButtonProps>(
  ({ type, level, cost, currentGold, onPress, isRecommended }) => {
    const { t } = useTranslation();
    const canAfford = currentGold >= cost;
    const info = UPGRADE_KEYS[type];

    const handlePress = useCallback(() => {
      if (canAfford) {
        audioManager.playSuccess();
        onPress(type);
      } else {
        audioManager.playError();
      }
    }, [canAfford, onPress, type]);

    return (
      <Pressable onPress={handlePress}>
        {(state) => {
          const hovered = Platform.OS === 'web' && (state as any).hovered;
          return (
            <View
              style={[
                styles.container,
                !canAfford && styles.disabled,
                canAfford && hovered && styles.hovered,
                canAfford && state.pressed && styles.pressed,
                isRecommended && canAfford && styles.recommended,
              ]}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{info.icon}</Text>
              </View>

              <View style={styles.infoContainer}>
                <View style={styles.headerRow}>
                  <Text style={styles.label}>{t(info.labelKey)}</Text>
                  <Text style={styles.level}>{t('common.lv')}{level}</Text>
                  {isRecommended && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>{t('battle.recommended')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.description}>{t(info.descKey)}</Text>
              </View>

              <View style={styles.costContainer}>
                <Text style={[styles.cost, !canAfford && styles.costDisabled]}>
                  💰 {formatNumber(cost)}
                </Text>
              </View>
            </View>
          );
        }}
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
    borderWidth: 2,
    borderColor: '#5577cc',
    borderBottomWidth: 4,
    borderBottomColor: '#3355aa',
  },
  disabled: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: '#444466',
    borderBottomColor: '#222233',
    opacity: 0.7,
  },
  hovered: {
    backgroundColor: '#5577cc',
    borderColor: '#6688dd',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    borderBottomWidth: 2,
    marginTop: 2,
  },
  recommended: {
    borderColor: '#22c55e',
    borderBottomColor: '#1a9e4a',
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
