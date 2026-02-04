// Crafting System - Convert gathered resources into useful items
// Melvor Idle inspired: Equipment primarily from crafting, enemies drop materials

import { ResourceType, CraftingCategory, MonsterPartType } from '../types';
import { EquipmentSlotType, Rarity } from '../types';

// Crafted item type
export type CraftedItemType = 'equipment' | 'consumable' | 'tool';

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
  // Monster part costs (new!)
  partCosts?: Partial<Record<MonsterPartType, number>>;
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
    partCosts: { common_part: 5 },
    goldCost: 300,
    outputId: 'crafted_sword_2',
    outputAmount: 1,
    levelRequired: 3,
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
    partCosts: { common_part: 8 },
    goldCost: 500,
    outputId: 'crafted_armor_2',
    outputAmount: 1,
    levelRequired: 3,
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
    partCosts: { common_part: 6, rare_part: 1 },
    goldCost: 400,
    outputId: 'crafted_axe_1',
    outputAmount: 1,
    levelRequired: 5,
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
    partCosts: { common_part: 5 },
    goldCost: 300,
    outputId: 'crafted_bow_2',
    outputAmount: 1,
    levelRequired: 3,
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
    partCosts: { common_part: 8 },
    goldCost: 400,
    outputId: 'crafted_leather_2',
    outputAmount: 1,
    levelRequired: 3,
  },
  {
    id: 'wooden_staff',
    name: '木杖',
    description: '基礎的法杖',
    category: 'fletching',
    itemType: 'equipment',
    icon: '🔮',
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
    icon: '🔮',
    costs: { wood: 70, herb: 25 },
    partCosts: { common_part: 6, rare_part: 1 },
    goldCost: 500,
    outputId: 'crafted_staff_2',
    outputAmount: 1,
    levelRequired: 5,
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

  // ========== TOOLS (gathering boost) ==========
  // Iron Pickaxe - Ore gathering +25%
  {
    id: 'iron_pickaxe',
    name: '鐵鎬',
    description: '礦石採集速度 +25%',
    category: 'forge',
    itemType: 'tool',
    icon: '⛏️',
    costs: { ore: 30 },
    goldCost: 500,
    outputId: 'tool_pickaxe_1',
    outputAmount: 1,
    levelRequired: 1,
  },
  // Steel Pickaxe - Ore gathering +50%
  {
    id: 'steel_pickaxe',
    name: '鋼鎬',
    description: '礦石採集速度 +50%',
    category: 'forge',
    itemType: 'tool',
    icon: '⛏️',
    costs: { ore: 80 },
    goldCost: 2000,
    outputId: 'tool_pickaxe_2',
    outputAmount: 1,
    levelRequired: 5,
  },
  // Woodcutting Axe - Wood gathering +25%
  {
    id: 'woodcutting_axe',
    name: '伐木斧',
    description: '木材採集速度 +25%',
    category: 'fletching',
    itemType: 'tool',
    icon: '🪓',
    costs: { wood: 30 },
    goldCost: 500,
    outputId: 'tool_axe_1',
    outputAmount: 1,
    levelRequired: 1,
  },
  // Fine Woodcutting Axe - Wood gathering +50%
  {
    id: 'fine_woodcutting_axe',
    name: '精鋼斧',
    description: '木材採集速度 +50%',
    category: 'fletching',
    itemType: 'tool',
    icon: '🪓',
    costs: { wood: 80 },
    goldCost: 2000,
    outputId: 'tool_axe_2',
    outputAmount: 1,
    levelRequired: 5,
  },
  // Fishing Rod - Fish gathering +25%
  {
    id: 'fishing_rod',
    name: '釣竿',
    description: '魚獲採集速度 +25%',
    category: 'cooking',
    itemType: 'tool',
    icon: '🎣',
    costs: { wood: 30, fish: 20 },
    goldCost: 500,
    outputId: 'tool_rod_1',
    outputAmount: 1,
    levelRequired: 1,
  },
  // Fine Fishing Rod - Fish gathering +50%
  {
    id: 'fine_fishing_rod',
    name: '精良釣竿',
    description: '魚獲採集速度 +50%',
    category: 'cooking',
    itemType: 'tool',
    icon: '🎣',
    costs: { wood: 80, fish: 50 },
    goldCost: 2000,
    outputId: 'tool_rod_2',
    outputAmount: 1,
    levelRequired: 5,
  },
  // Sickle - Herb gathering +25%
  {
    id: 'sickle',
    name: '鐮刀',
    description: '草藥採集速度 +25%',
    category: 'alchemy',
    itemType: 'tool',
    icon: '🌿',
    costs: { ore: 20, wood: 20 },
    goldCost: 500,
    outputId: 'tool_sickle_1',
    outputAmount: 1,
    levelRequired: 1,
  },
  // Fine Sickle - Herb gathering +50%
  {
    id: 'fine_sickle',
    name: '精良鐮刀',
    description: '草藥採集速度 +50%',
    category: 'alchemy',
    itemType: 'tool',
    icon: '🌿',
    costs: { ore: 50, wood: 50 },
    goldCost: 2000,
    outputId: 'tool_sickle_2',
    outputAmount: 1,
    levelRequired: 5,
  },

  // ========== AFFIX EQUIPMENT (special effects) ==========
  // Gold Find Ring
  {
    id: 'gold_ring',
    name: '財富戒指',
    description: '金幣掉落 +20%',
    category: 'forge',
    itemType: 'equipment',
    icon: '💰',
    costs: { ore: 50 },
    partCosts: { rare_part: 3 },
    goldCost: 1000,
    outputId: 'crafted_gold_ring',
    outputAmount: 1,
    levelRequired: 5,
  },
  // Life Steal Amulet
  {
    id: 'vampire_amulet',
    name: '吸血護符',
    description: '攻擊回復 3% 傷害為 HP',
    category: 'alchemy',
    itemType: 'equipment',
    icon: '🧛',
    costs: { herb: 60, fish: 20 },
    partCosts: { rare_part: 5 },
    goldCost: 1500,
    outputId: 'crafted_vampire_amulet',
    outputAmount: 1,
    levelRequired: 7,
  },
  // Thorns Shield
  {
    id: 'thorns_shield',
    name: '荊棘盾',
    description: '受擊反彈 15% 傷害',
    category: 'forge',
    itemType: 'equipment',
    icon: '🛡️',
    costs: { ore: 70, herb: 20 },
    partCosts: { rare_part: 5 },
    goldCost: 1500,
    outputId: 'crafted_thorns_shield',
    outputAmount: 1,
    levelRequired: 7,
  },
  // Boss Slayer Sword
  {
    id: 'boss_slayer_sword',
    name: '屠龍劍',
    description: '對 Boss +25% 傷害',
    category: 'forge',
    itemType: 'equipment',
    icon: '🗡️',
    costs: { ore: 100, wood: 30 },
    partCosts: { rare_part: 5, boss_part: 2 },
    goldCost: 3000,
    outputId: 'crafted_boss_sword',
    outputAmount: 1,
    levelRequired: 10,
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
  gold: number,
  monsterParts?: Record<MonsterPartType, number>
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

  // Check monster parts
  if (recipe.partCosts && monsterParts) {
    for (const [part, amount] of Object.entries(recipe.partCosts)) {
      if ((monsterParts[part as MonsterPartType] || 0) < amount) {
        return false;
      }
    }
  }

  return true;
};

// ========== CRAFTING LEVEL SYSTEM ==========

// XP required to reach next level
export const getCraftingXpRequired = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level));
};

// XP gained from crafting a recipe
export const getRecipeXp = (recipe: Recipe): number => {
  // XP = total resource cost * 5 + gold cost / 10
  let resourceXp = 0;
  for (const amount of Object.values(recipe.costs)) {
    resourceXp += (amount || 0) * 5;
  }
  const goldXp = (recipe.goldCost || 0) / 10;
  return Math.floor(resourceXp + goldXp);
};

// Crafting level bonuses
export const CRAFTING_LEVEL_EFFECTS = {
  qualityBonusPerLevel: 0.05, // +5% item quality per level
  doubleOutputLevel: 15,      // Level 15: 10% chance double output
  doubleOutputChance: 0.10,
  resourceSaveLevel: 20,      // Level 20: 20% chance to save resources
  resourceSaveChance: 0.20,
};

// Check if recipe is unlocked based on crafting level
export const isRecipeUnlocked = (recipe: Recipe, craftingLevel: number): boolean => {
  const required = recipe.levelRequired || 1;
  return craftingLevel >= required;
};
