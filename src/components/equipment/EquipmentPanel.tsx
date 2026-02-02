import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, EquipmentSlotType } from '../../types';
import { EquipmentSlot } from './EquipmentSlot';
import { ItemDetail } from './ItemDetail';

const SLOT_ORDER: EquipmentSlotType[] = ['helmet', 'amulet', 'weapon', 'armor', 'shield', 'ring'];

export const EquipmentPanel = React.memo(() => {
  const equipment = useGameStore((state) => state.equipment);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlotType | null>(null);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const handleSlotPress = useCallback((slot: EquipmentSlotType, item: Equipment | null) => {
    if (selectedSlot === slot) {
      setSelectedSlot(null);
      setSelectedItem(null);
    } else {
      setSelectedSlot(slot);
      setSelectedItem(item);
    }
  }, [selectedSlot]);

  const handleUnequip = useCallback(() => {
    if (selectedSlot) {
      unequipItem(selectedSlot);
      setSelectedSlot(null);
      setSelectedItem(null);
    }
  }, [selectedSlot, unequipItem]);

  const handleCloseDetail = useCallback(() => {
    setSelectedSlot(null);
    setSelectedItem(null);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>裝備</Text>
      <View style={styles.slotsGrid}>
        {/* Top row: helmet, amulet */}
        <View style={styles.row}>
          <EquipmentSlot
            slot="helmet"
            item={equipment.helmet}
            onPress={handleSlotPress}
            selected={selectedSlot === 'helmet'}
          />
          <EquipmentSlot
            slot="amulet"
            item={equipment.amulet}
            onPress={handleSlotPress}
            selected={selectedSlot === 'amulet'}
          />
        </View>
        {/* Middle row: weapon, armor, shield */}
        <View style={styles.row}>
          <EquipmentSlot
            slot="weapon"
            item={equipment.weapon}
            onPress={handleSlotPress}
            selected={selectedSlot === 'weapon'}
          />
          <EquipmentSlot
            slot="armor"
            item={equipment.armor}
            onPress={handleSlotPress}
            selected={selectedSlot === 'armor'}
          />
          <EquipmentSlot
            slot="shield"
            item={equipment.shield}
            onPress={handleSlotPress}
            selected={selectedSlot === 'shield'}
          />
        </View>
        {/* Bottom row: ring */}
        <View style={styles.row}>
          <EquipmentSlot
            slot="ring"
            item={equipment.ring}
            onPress={handleSlotPress}
            selected={selectedSlot === 'ring'}
          />
        </View>
      </View>

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onUnequip={handleUnequip}
          onClose={handleCloseDetail}
          showUnequip
        />
      )}
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
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  slotsGrid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
