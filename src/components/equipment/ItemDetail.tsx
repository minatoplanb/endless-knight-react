import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, Rarity } from '../../types';
import { RARITY_NAMES, SLOT_NAMES } from '../../data/equipment';

const RARITY_COLORS: Record<Rarity, string> = {
  common: COLORS.common,
  uncommon: COLORS.uncommon,
  rare: COLORS.rare,
  epic: COLORS.epic,
  legendary: COLORS.legendary,
};

const EQUIPMENT_ICONS: Record<string, any> = {
  sword_basic: require('../../../assets/icons/sword_basic.png'),
  sword_iron: require('../../../assets/icons/sword_iron.png'),
  axe: require('../../../assets/icons/axe.png'),
  bow: require('../../../assets/icons/bow.png'),
  staff: require('../../../assets/icons/staff.png'),
  helmet: require('../../../assets/icons/helmet.png'),
  armor: require('../../../assets/icons/armor.png'),
  shield: require('../../../assets/icons/shield.png'),
  ring: require('../../../assets/icons/ring.png'),
  amulet: require('../../../assets/icons/amulet.png'),
  gloves: require('../../../assets/icons/gloves.png'),
  boots: require('../../../assets/icons/boots.png'),
};

const formatStat = (key: string, value: number): string => {
  const sign = value >= 0 ? '+' : '';
  switch (key) {
    case 'atk':
      return `${sign}${value} 攻擊`;
    case 'def':
      return `${sign}${value} 防禦`;
    case 'maxHp':
      return `${sign}${value} 生命`;
    case 'attackSpeed':
      return `${sign}${(value * 100).toFixed(0)}% 攻速`;
    case 'critChance':
      return `${sign}${(value * 100).toFixed(1)}% 暴擊`;
    case 'critMultiplier':
      return `${sign}${(value * 100).toFixed(0)}% 暴傷`;
    default:
      return `${sign}${value}`;
  }
};

interface ItemDetailProps {
  item: Equipment;
  onEquip?: () => void;
  onUnequip?: () => void;
  onDiscard?: () => void;
  onClose?: () => void;
  showEquip?: boolean;
  showUnequip?: boolean;
  showDiscard?: boolean;
  compareWith?: Equipment | null;
}

export const ItemDetail = React.memo(
  ({
    item,
    onEquip,
    onUnequip,
    onDiscard,
    onClose,
    showEquip,
    showUnequip,
    showDiscard,
    compareWith,
  }: ItemDetailProps) => {
    const rarityColor = RARITY_COLORS[item.rarity];
    const iconSource = EQUIPMENT_ICONS[item.icon];

    return (
      <View style={[styles.container, { borderColor: rarityColor }]}>
        <View style={styles.header}>
          {iconSource && (
            <Image source={iconSource} style={styles.icon} resizeMode="contain" />
          )}
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: rarityColor }]}>{item.name}</Text>
            <Text style={styles.meta}>
              {RARITY_NAMES[item.rarity]} {SLOT_NAMES[item.slot]} Lv.{item.level}
            </Text>
          </View>
          {onClose && (
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsContainer}>
          {Object.entries(item.stats).map(([key, value]) => {
            if (value === 0) return null;
            const compareValue = compareWith?.stats[key as keyof typeof item.stats];
            const diff = compareValue ? value - compareValue : 0;

            return (
              <View key={key} style={styles.statRow}>
                <Text
                  style={[
                    styles.statText,
                    { color: value > 0 ? COLORS.hpFull : COLORS.hpLow },
                  ]}
                >
                  {formatStat(key, value)}
                </Text>
                {diff !== 0 && (
                  <Text
                    style={[
                      styles.diffText,
                      { color: diff > 0 ? COLORS.hpFull : COLORS.hpLow },
                    ]}
                  >
                    ({diff > 0 ? '+' : ''}{key === 'attackSpeed' || key === 'critChance' || key === 'critMultiplier'
                      ? `${(diff * 100).toFixed(1)}%`
                      : diff})
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.buttonRow}>
          {showEquip && onEquip && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.equipButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onEquip}
            >
              <Text style={styles.buttonText}>裝備</Text>
            </Pressable>
          )}
          {showUnequip && onUnequip && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.unequipButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onUnequip}
            >
              <Text style={styles.buttonText}>卸下</Text>
            </Pressable>
          )}
          {showDiscard && onDiscard && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.discardButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDiscard}
            >
              <Text style={styles.buttonText}>丟棄</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(12),
    padding: SPACING.md,
    marginTop: SPACING.md,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    width: scale(48),
    height: scale(48),
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  statText: {
    fontSize: FONT_SIZES.md,
  },
  diffText: {
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  button: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: scale(6),
  },
  equipButton: {
    backgroundColor: COLORS.buttonSuccess,
  },
  unequipButton: {
    backgroundColor: COLORS.buttonPrimary,
  },
  discardButton: {
    backgroundColor: COLORS.buttonDanger,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
