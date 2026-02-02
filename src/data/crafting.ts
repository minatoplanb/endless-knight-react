// Crafting System - Convert gathered resources into useful items

import { ResourceType } from '../types';
import { EquipmentSlotType, Rarity } from '../types';

// Crafting category
export type CraftingCategory = 'forge' | 'fletching' | 'cooking' | 'alchemy';

// Crafted item type
export type CraftedItemType = 'equipment' | 'consumable';

// Base recipe interface
export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: CraftingCategory;
  itemType: CraftedItemType;
  icon: string;
  // Resource costs
  costs: Partial<Record<ResourceType, number>>;
  // Gold cost (optional)
  goldCost?: number;
  // Output - either equipment template or consumable id
  outputId: string;
  // How many items produced per craft
  outputAmount: number;
  // Level requirement (for future use)
  levelRequired?: number;
}

// Crafting category info
export interface CraftingCategoryInfo {
  id: CraftingCategory;
  name: string;
  icon: string;
  description: string;
  primaryResource: ResourceType;
}

export const CRAFTING_CATEGORIES: Record<CraftingCategory, CraftingCategoryInfo> = {
  forge: {
    id: 'forge',
    name: '鍛造',
    icon: '🔨',
    description: '使用礦石鍛造武器和重甲',
    primaryResource: 'ore',
  },
  fletching: {
    id: 'fletching',
    name: '製箭',
    icon: '🏹',
    description: '使用木材製作弓箭和輕甲',
    primaryResource: 'wood',
  },
  cooking: {
    id: 'cooking',
    name: '烹飪',
    icon: '🍖',
    description: '使用魚獲烹飪恢復食物',
    primaryResource: 'fish',
  },
  alchemy: {
    id: 'alchemy',
    name: '煉金',
    icon: '🧪',
    description: '使用草藥調製增益藥水',
    primaryResource: 'herb',
  },
};

// ========== RECIPES ==========

export const RECIPES: Recipe[] = [
  // ========== FORGE (ore -> weapons/heavy armor) ==========
  {
    id: 'iron_sword',
    name: '鐵劍',
    description: '基礎的近戰武器',
    category: 'forge',
    itemType: 'equipment',
    icon: '⚔️',
    costs: { ore: 20 },
    goldCost: 100,
    outputId: 'crafted_sword_1',
    outputAmount: 1,
  },
  {
    id: 'steel_sword',
    name: '鋼劍',
    description: '更強的近戰武器',
    category: 'forge',
    itemType: 'equipment',
    icon: '⚔️',
    costs: { ore: 50 },
    goldCost: 300,
    outputId: 'crafted_sword_2',
    outputAmount: 1,
  },
  {
    id: 'iron_armor',
    name: '鐵甲',
    description: '堅固的重甲',
    category: 'forge',
    itemType: 'equipment',
    icon: '🛡️',
    costs: { ore: 30 },
    goldCost: 150,
    outputId: 'crafted_armor_1',
    outputAmount: 1,
  },
  {
    id: 'steel_armor',
    name: '鋼甲',
    description: '更堅固的重甲',
    category: 'forge',
    itemType: 'equipment',
    icon: '🛡️',
    costs: { ore: 80 },
    goldCost: 500,
    outputId: 'crafted_armor_2',
    outputAmount: 1,
  },
  {
    id: 'iron_helmet',
    name: '鐵盔',
    description: '基礎的頭盔',
    category: 'forge',
    itemType: 'equipment',
    icon: '⛑️',
    costs: { ore: 25 },
    goldCost: 120,
    outputId: 'crafted_helmet_1',
    outputAmount: 1,
  },
  {
    id: 'iron_shield',
    name: '鐵盾',
    description: '堅固的盾牌',
    category: 'forge',
    itemType: 'equipment',
    icon: '🛡️',
    costs: { ore: 35 },
    goldCost: 180,
    outputId: 'crafted_shield_1',
    outputAmount: 1,
  },
  {
    id: 'battle_axe',
    name: '戰斧',
    description: '高傷害近戰武器',
    category: 'forge',
    itemType: 'equipment',
    icon: '🪓',
    costs: { ore: 60, wood: 10 },
    goldCost: 400,
    outputId: 'crafted_axe_1',
    outputAmount: 1,
  },

  // ========== FLETCHING (wood -> ranged weapons/light armor) ==========
  {
    id: 'short_bow',
    name: '短弓',
    description: '基礎的遠程武器',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🏹',
    costs: { wood: 20 },
    goldCost: 100,
    outputId: 'crafted_bow_1',
    outputAmount: 1,
  },
  {
    id: 'long_bow',
    name: '長弓',
    description: '更強的遠程武器',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🏹',
    costs: { wood: 50 },
    goldCost: 300,
    outputId: 'crafted_bow_2',
    outputAmount: 1,
  },
  {
    id: 'leather_armor',
    name: '皮甲',
    description: '輕便的護甲',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🥋',
    costs: { wood: 25, herb: 5 },
    goldCost: 120,
    outputId: 'crafted_leather_1',
    outputAmount: 1,
  },
  {
    id: 'hunter_armor',
    name: '獵人甲',
    description: '高品質輕甲',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🥋',
    costs: { wood: 60, herb: 15 },
    goldCost: 400,
    outputId: 'crafted_leather_2',
    outputAmount: 1,
  },
  {
    id: 'wooden_staff',
    name: '木杖',
    description: '基礎的法杖',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🪄',
    costs: { wood: 30, herb: 10 },
    goldCost: 150,
    outputId: 'crafted_staff_1',
    outputAmount: 1,
  },
  {
    id: 'magic_staff',
    name: '魔法杖',
    description: '強力的法杖',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🪄',
    costs: { wood: 70, herb: 25 },
    goldCost: 500,
    outputId: 'crafted_staff_2',
    outputAmount: 1,
  },
  {
    id: 'wooden_ring',
    name: '木戒指',
    description: '簡單的戒指',
    category: 'fletching',
    itemType: 'equipment',
    icon: '💍',
    costs: { wood: 15 },
    goldCost: 80,
    outputId: 'crafted_ring_1',
    outputAmount: 1,
  },

  // ========== COOKING (fish -> food) ==========
  {
    id: 'grilled_fish',
    name: '烤魚',
    description: '恢復 30 HP',
    category: 'cooking',
    itemType: 'consumable',
    icon: '🐟',
    costs: { fish: 5 },
    outputId: 'food_fish_1',
    outputAmount: 3,
  },
  {
    id: 'fish_stew',
    name: '魚湯',
    description: '恢復 60 HP',
    category: 'cooking',
    itemType: 'consumable',
    icon: '🍲',
    costs: { fish: 10, herb: 2 },
    outputId: 'food_stew_1',
    outputAmount: 2,
  },
  {
    id: 'deluxe_feast',
    name: '豪華大餐',
    description: '恢復 100 HP',
    category: 'cooking',
    itemType: 'consumable',
    icon: '🍽️',
    costs: { fish: 20, herb: 5, wood: 3 },
    goldCost: 50,
    outputId: 'food_feast_1',
    outputAmount: 1,
  },

  // ========== ALCHEMY (herb -> potions) ==========
  {
    id: 'strength_potion',
    name: '力量藥水',
    description: 'ATK +20% (60秒)',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '💪',
    costs: { herb: 10 },
    outputId: 'potion_strength_1',
    outputAmount: 2,
  },
  {
    id: 'defense_potion',
    name: '防禦藥水',
    description: 'DEF +20% (60秒)',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '🛡️',
    costs: { herb: 10 },
    outputId: 'potion_defense_1',
    outputAmount: 2,
  },
  {
    id: 'speed_potion',
    name: '速度藥水',
    description: '攻速 +20% (60秒)',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '⚡',
    costs: { herb: 10 },
    outputId: 'potion_speed_1',
    outputAmount: 2,
  },
  {
    id: 'healing_potion',
    name: '治療藥水',
    description: '立即恢復 50 HP',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '❤️',
    costs: { herb: 15, fish: 5 },
    outputId: 'potion_healing_1',
    outputAmount: 2,
  },
  {
    id: 'crit_potion',
    name: '暴擊藥水',
    description: '暴擊率 +15% (60秒)',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '💥',
    costs: { herb: 15 },
    outputId: 'potion_crit_1',
    outputAmount: 2,
  },
  {
    id: 'greater_healing_potion',
    name: '大型治療藥水',
    description: '立即恢復 100 HP',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '❤️‍🔥',
    costs: { herb: 30, fish: 10 },
    goldCost: 100,
    outputId: 'potion_healing_2',
    outputAmount: 2,
  },
  {
    id: 'mega_strength_potion',
    name: '超級力量藥水',
    description: 'ATK +40% (60秒)',
    category: 'alchemy',
    itemType: 'consumable',
    icon: '💪',
    costs: { herb: 25, ore: 5 },
    goldCost: 150,
    outputId: 'potion_strength_2',
    outputAmount: 1,
  },
  {
    id: 'herbal_amulet',
    name: '草藥護符',
    description: '提供生命加成的護符',
    category: 'alchemy',
    itemType: 'equipment',
    icon: '📿',
    costs: { herb: 40, wood: 10 },
    goldCost: 200,
    outputId: 'crafted_amulet_1',
    outputAmount: 1,
  },
];

// ========== HELPER FUNCTIONS ==========

export const getRecipeById = (id: string): Recipe | undefined => {
  return RECIPES.find((r) => r.id === id);
};

export const getRecipesByCategory = (category: CraftingCategory): Recipe[] => {
  return RECIPES.filter((r) => r.category === category);
};

export const ALL_CATEGORIES: CraftingCategory[] = ['forge', 'fletching', 'cooking', 'alchemy'];

// Check if player can afford a recipe
export const canAffordRecipe = (
  recipe: Recipe,
  resources: Record<ResourceType, number>,
  gold: number
): boolean => {
  // Check gold
  if (recipe.goldCost && gold < recipe.goldCost) {
    return false;
  }

  // Check resources
  for (const [resource, amount] of Object.entries(recipe.costs)) {
    if (resources[resource as ResourceType] < amount) {
      return false;
    }
  }

  return true;
};
