import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { Equipment, Rarity } from '../../types';
import { ItemDetail } from './ItemDetail';
import { getSellPrice } from '../../data/equipment';

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

const InventoryItem = React.memo(
  ({
    item,
    onPress,
    selected,
  }: {
    item: Equipment;
    onPress: (item: Equipment) => void;
    selected: boolean;
  }) => {
    const handlePress = useCallback(() => {
      onPress(item);
    }, [item, onPress]);

    const rarityColor = RARITY_COLORS[item.rarity];
    const iconSource = EQUIPMENT_ICONS[item.icon];

    return (
      <Pressable
        style={({ pressed }) => [
          styles.itemSlot,
          { borderColor: rarityColor },
          selected && styles.itemSelected,
          pressed && styles.itemPressed,
        ]}
        onPress={handlePress}
      >
        {iconSource && (
          <Image source={iconSource} style={styles.itemIcon} resizeMode="contain" />
        )}
        <Text style={[styles.levelBadge, { backgroundColor: rarityColor }]}>
          {item.level}
        </Text>
        {item.enhancementLevel > 0 && (
          <Text style={styles.enhanceBadge}>+{item.enhancementLevel}</Text>
        )}
      </Pressable>
    );
  }
);

export const InventoryGrid = React.memo(() => {
  const inventory = useGameStore((state) => state.inventory);
  const equipment = useGameStore((state) => state.equipment);
  const equipItem = useGameStore((state) => state.equipItem);
  const removeFromInventory = useGameStore((state) => state.removeFromInventory);
  const sellItem = useGameStore((state) => state.sellItem);
  const getBackpackCapacity = useGameStore((state) => state.getBackpackCapacity);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const capacity = getBackpackCapacity();

  const handleItemPress = useCallback(
    (item: Equipment) => {
      if (selectedItem?.id === item.id) {
        setSelectedItem(null);
      } else {
        setSelectedItem(item);
      }
    },
    [selectedItem]
  );

  const handleEquip = useCallback(() => {
    if (selectedItem) {
      equipItem(selectedItem);
      setSelectedItem(null);
    }
  }, [selectedItem, equipItem]);

  const handleDiscard = useCallback(() => {
    if (selectedItem) {
      removeFromInventory(selectedItem.id);
      setSelectedItem(null);
    }
  }, [selectedItem, removeFromInventory]);

  const handleSell = useCallback(() => {
    if (selectedItem) {
      sellItem(selectedItem.id);
      setSelectedItem(null);
    }
  }, [selectedItem, sellItem]);

  const handleCloseDetail = useCallback(() => {
    setSelectedItem(null);
  }, []);

  const currentEquipped = selectedItem ? equipment[selectedItem.slot] : null;

  const renderItem = useCallback(
    ({ item }: { item: Equipment }) => (
      <InventoryItem
        item={item}
        onPress={handleItemPress}
        selected={selectedItem?.id === item.id}
      />
    ),
    [handleItemPress, selectedItem]
  );

  const keyExtractor = useCallback((item: Equipment) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>背包</Text>
        <Text style={styles.count}>
          {inventory.length}/{capacity}
        </Text>
      </View>

      {inventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>背包是空的</Text>
          <Text style={styles.emptySubtext}>擊敗敵人獲取裝備</Text>
        </View>
      ) : (
        <FlatList
          data={inventory}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={5}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          onEquip={handleEquip}
          onSell={handleSell}
          onDiscard={handleDiscard}
          onClose={handleCloseDetail}
          showEquip
          showSell
          showDiscard
          showEnhance
          sellPrice={getSellPrice(selectedItem)}
          compareWith={currentEquipped}
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
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  count: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
  },
  gridContent: {
    paddingBottom: SPACING.md,
  },
  row: {
    justifyContent: 'flex-start',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  itemSlot: {
    width: scale(56),
    height: scale(56),
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemSelected: {
    borderWidth: 3,
    backgroundColor: COLORS.bg,
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemIcon: {
    width: scale(40),
    height: scale(40),
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
  enhanceBadge: {
    position: 'absolute',
    top: scale(2),
    left: scale(2),
    paddingHorizontal: scale(3),
    paddingVertical: scale(1),
    borderRadius: scale(4),
    fontSize: FONT_SIZES.xs,
    color: COLORS.bg,
    fontWeight: 'bold',
    backgroundColor: COLORS.textGold,
    overflow: 'hidden',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
});
