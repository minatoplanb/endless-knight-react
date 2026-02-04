import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale, PIXEL_ART_IMAGE_STYLE, EQUIPMENT_EMOJI } from '../../constants/theme';
import { Equipment, Rarity, EquipmentSlotType } from '../../types';
import { ItemDetail } from './ItemDetail';
import { getSellPrice } from '../../data/equipment';
import { useTranslation } from '../../locales';

// Filter and sort types
type SlotFilter = 'all' | EquipmentSlotType;
type RarityFilter = 'all' | Rarity;
type SortOption = 'level_desc' | 'level_asc' | 'rarity_desc' | 'enhance_desc';

const SLOT_FILTERS: { value: SlotFilter; label: string; icon: string }[] = [
  { value: 'all', label: '全部', icon: '📦' },
  { value: 'weapon', label: '武器', icon: '⚔️' },
  { value: 'helmet', label: '頭盔', icon: '🪖' },
  { value: 'armor', label: '盔甲', icon: '🛡️' },
  { value: 'shield', label: '盾牌', icon: '🔰' },
  { value: 'ring', label: '戒指', icon: '💍' },
  { value: 'amulet', label: '項鏈', icon: '📿' },
];

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'level_desc', label: '等級 ↓' },
  { value: 'level_asc', label: '等級 ↑' },
  { value: 'rarity_desc', label: '稀有度 ↓' },
  { value: 'enhance_desc', label: '強化 ↓' },
];

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
          Platform.OS === 'web' ? (
            <Image source={iconSource} style={[styles.itemIcon, PIXEL_ART_IMAGE_STYLE]} resizeMode="contain" />
          ) : (
            <Text style={styles.itemIconEmoji}>{EQUIPMENT_EMOJI[item.icon] ?? '❓'}</Text>
          )
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
  const { t, locale } = useTranslation();
  const inventory = useGameStore((state) => state.inventory);
  const equipment = useGameStore((state) => state.equipment);
  const equipItem = useGameStore((state) => state.equipItem);
  const removeFromInventory = useGameStore((state) => state.removeFromInventory);
  const sellItem = useGameStore((state) => state.sellItem);
  const getBackpackCapacity = useGameStore((state) => state.getBackpackCapacity);
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  // Filter and sort state
  const [slotFilter, setSlotFilter] = useState<SlotFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('level_desc');
  const [showFilters, setShowFilters] = useState(false);

  const capacity = getBackpackCapacity();

  // Apply filters and sorting
  const filteredAndSortedInventory = useMemo(() => {
    let items = [...inventory];

    // Apply slot filter
    if (slotFilter !== 'all') {
      items = items.filter(item => item.slot === slotFilter);
    }

    // Apply sorting
    items.sort((a, b) => {
      switch (sortOption) {
        case 'level_desc':
          return b.level - a.level;
        case 'level_asc':
          return a.level - b.level;
        case 'rarity_desc':
          return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity);
        case 'enhance_desc':
          return b.enhancementLevel - a.enhancementLevel;
        default:
          return 0;
      }
    });

    return items;
  }, [inventory, slotFilter, sortOption]);

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

  // 把背包物品切成每列 5 個，用普通 View 排版，避免 FlatList + ScrollView 的警告
  const rows = useMemo(() => {
    const result: Equipment[][] = [];
    for (let i = 0; i < filteredAndSortedInventory.length; i += 5) {
      result.push(filteredAndSortedInventory.slice(i, i + 5));
    }
    return result;
  }, [filteredAndSortedInventory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{locale === 'zh' ? '背包' : 'Backpack'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterToggleText}>🔍</Text>
          </TouchableOpacity>
          <Text style={styles.count}>
            {filteredAndSortedInventory.length}/{inventory.length}/{capacity}
          </Text>
        </View>
      </View>

      {/* Filter Controls */}
      {showFilters && (
        <View style={styles.filterContainer}>
          {/* Slot Filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{locale === 'zh' ? '類型' : 'Type'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {SLOT_FILTERS.map((filter) => (
                  <TouchableOpacity
                    key={filter.value}
                    style={[
                      styles.filterChip,
                      slotFilter === filter.value && styles.filterChipActive,
                    ]}
                    onPress={() => setSlotFilter(filter.value)}
                  >
                    <Text style={styles.filterChipIcon}>{filter.icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Sort Options */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{locale === 'zh' ? '排序' : 'Sort'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortChip,
                      sortOption === option.value && styles.sortChipActive,
                    ]}
                    onPress={() => setSortOption(option.value)}
                  >
                    <Text
                      style={[
                        styles.sortChipText,
                        sortOption === option.value && styles.sortChipTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {filteredAndSortedInventory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>背包是空的</Text>
          <Text style={styles.emptySubtext}>擊敗敵人獲取裝備</Text>
        </View>
      ) : (
        <View style={styles.gridContent}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onPress={handleItemPress}
                  selected={selectedItem?.id === item.id}
                />
              ))}
            </View>
          ))}
        </View>
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
    marginBottom: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  count: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  filterToggle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(6),
    backgroundColor: COLORS.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterToggleActive: {
    backgroundColor: COLORS.buttonPrimary,
  },
  filterToggleText: {
    fontSize: scale(14),
  },
  filterContainer: {
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  filterSection: {
    marginBottom: SPACING.xs,
  },
  filterLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginBottom: SPACING.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterChip: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(6),
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    borderColor: COLORS.buttonPrimary,
    backgroundColor: 'rgba(68, 102, 170, 0.3)',
  },
  filterChipIcon: {
    fontSize: scale(16),
  },
  sortChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: scale(12),
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortChipActive: {
    borderColor: COLORS.textGold,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
  },
  sortChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
  },
  sortChipTextActive: {
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  gridContent: {
    paddingBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
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
  itemIconEmoji: {
    fontSize: scale(24),
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
