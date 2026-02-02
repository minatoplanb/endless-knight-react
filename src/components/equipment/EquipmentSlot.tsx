import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, EquipmentSlotType, Rarity } from '../../types';
import { SLOT_NAMES } from '../../data/equipment';

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

interface EquipmentSlotProps {
  slot: EquipmentSlotType;
  item: Equipment | null;
  onPress: (slot: EquipmentSlotType, item: Equipment | null) => void;
  selected?: boolean;
}

export const EquipmentSlot = React.memo(
  ({ slot, item, onPress, selected }: EquipmentSlotProps) => {
    const handlePress = useCallback(() => {
      onPress(slot, item);
    }, [slot, item, onPress]);

    const rarityColor = item ? RARITY_COLORS[item.rarity] : COLORS.textDim;
    const iconSource = item ? EQUIPMENT_ICONS[item.icon] : null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.container,
          { borderColor: rarityColor },
          selected && styles.selected,
          pressed && styles.pressed,
        ]}
        onPress={handlePress}
      >
        {iconSource ? (
          <Image source={iconSource} style={styles.icon} resizeMode="contain" />
        ) : (
          <View style={styles.emptySlot}>
            <Text style={styles.emptyText}>{SLOT_NAMES[slot]}</Text>
          </View>
        )}
        {item && (
          <Text
            style={[styles.levelBadge, { backgroundColor: rarityColor }]}
            numberOfLines={1}
          >
            {item.level}
          </Text>
        )}
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: scale(64),
    height: scale(64),
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: SPACING.xs,
  },
  selected: {
    borderWidth: 3,
    backgroundColor: COLORS.panel,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: scale(48),
    height: scale(48),
  },
  emptySlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: scale(2),
    right: scale(2),
    paddingHorizontal: scale(4),
    paddingVertical: scale(1),
    borderRadius: scale(4),
    fontSize: FONT_SIZES.xs,
    color: COLORS.bg,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});
