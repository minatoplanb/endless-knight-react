import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, EquipmentSlotType } from '../../types';
import { EquipmentSlot } from './EquipmentSlot';
import { ItemDetail } from './ItemDetail';
import { PressableButton } from '../common/PressableButton';

const SLOT_ORDER: EquipmentSlotType[] = ['helmet', 'amulet', 'weapon', 'armor', 'shield', 'ring'];

export const EquipmentPanel = React.memo(() => {
  const equipment = useGameStore((state) => state.equipment);
  const inventory = useGameStore((state) => state.inventory);
  const unequipItem = useGameStore((state) => state.unequipItem);
  const enhanceAllEquipped = useGameStore((state) => state.enhanceAllEquipped);
  const autoEquipBest = useGameStore((state) => state.autoEquipBest);
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

  const handleEnhanceAll = useCallback(() => {
    const equippedCount = Object.values(equipment).filter(Boolean).length;
    if (equippedCount === 0) {
      Alert.alert('沒有裝備', '請先裝備一些物品');
      return;
    }

    Alert.alert(
      '強化全部裝備',
      `確定要強化所有已裝備的 ${equippedCount} 件物品嗎？\n\n每件物品將消耗各自的強化費用。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '強化全部',
          onPress: () => {
            const result = enhanceAllEquipped();
            Alert.alert('強化結果', result.summary);
          },
        },
      ]
    );
  }, [equipment, enhanceAllEquipped]);

  const handleAutoEquip = useCallback(() => {
    if (inventory.length === 0) {
      Alert.alert('背包空空', '背包裡沒有裝備');
      return;
    }

    const result = autoEquipBest();
    Alert.alert('自動裝備', result.message);
  }, [inventory, autoEquipBest]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>裝備</Text>
        <View style={styles.headerButtons}>
          <PressableButton
            onPress={handleAutoEquip}
            title="🎯 最佳裝備"
            variant="success"
            size="small"
            style={styles.headerButton}
          />
          <PressableButton
            onPress={handleEnhanceAll}
            title="⬆️ 強化全部"
            variant="primary"
            size="small"
          />
        </View>
      </View>
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
          showEnhance
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  headerButton: {
    marginRight: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  slotsGrid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
