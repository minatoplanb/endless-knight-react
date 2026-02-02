import { EquipmentSlotType, Rarity, EquipmentStats } from '../types';

// Base equipment definitions
export interface BaseEquipment {
  id: string;
  name: string;
  slot: EquipmentSlotType;
  icon: string;
  baseStats: EquipmentStats;
}

// Rarity multipliers for stats
export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  uncommon: 1.3,
  rare: 1.6,
  epic: 2.0,
  legendary: 2.5,
};

// Drop rate for each rarity (must sum to 1)
export const RARITY_DROP_RATES: Record<Rarity, number> = {
  common: 0.50,
  uncommon: 0.30,
  rare: 0.15,
  epic: 0.04,
  legendary: 0.01,
};

// Base drop chance per enemy kill (increases with stage)
// Like Melvor Idle: drops should be rare and meaningful
export const BASE_DROP_CHANCE = 0.01; // 1%
export const DROP_CHANCE_PER_STAGE = 0.0002; // +0.02% per stage
export const MAX_DROP_CHANCE = 0.05; // 5% max

// Boss guaranteed drop
export const BOSS_DROP_CHANCE = 1.0; // 100%
export const BOSS_RARITY_BOOST = 0.5; // Shift rarity distribution up

// Inventory limits
export const MAX_INVENTORY_SIZE = 50; // Legacy constant, use getBackpackCapacity() instead

// Backpack upgrade settings
export const BACKPACK_BASE_CAPACITY = 50;
export const BACKPACK_CAPACITY_PER_LEVEL = 20;
export const BACKPACK_MAX_LEVEL = 10;
export const BACKPACK_UPGRADE_BASE_COST = 200;
export const BACKPACK_UPGRADE_COST_MULTIPLIER = 1.5;

// Weapons
export const WEAPONS: BaseEquipment[] = [
  {
    id: 'sword_basic',
    name: '鐵劍',
    slot: 'weapon',
    icon: 'sword_basic',
    baseStats: { atk: 5 },
  },
  {
    id: 'sword_iron',
    name: '精鐵長劍',
    slot: 'weapon',
    icon: 'sword_iron',
    baseStats: { atk: 8, critChance: 0.02 },
  },
  {
    id: 'axe',
    name: '戰斧',
    slot: 'weapon',
    icon: 'axe',
    baseStats: { atk: 12, attackSpeed: -0.1 },
  },
  {
    id: 'bow',
    name: '獵弓',
    slot: 'weapon',
    icon: 'bow',
    baseStats: { atk: 6, critChance: 0.05, attackSpeed: 0.1 },
  },
  {
    id: 'staff',
    name: '法杖',
    slot: 'weapon',
    icon: 'staff',
    baseStats: { atk: 4, critMultiplier: 0.3 },
  },
];

// Helmets
export const HELMETS: BaseEquipment[] = [
  {
    id: 'helmet_iron',
    name: '鐵頭盔',
    slot: 'helmet',
    icon: 'helmet',
    baseStats: { def: 3, maxHp: 10 },
  },
  {
    id: 'helmet_steel',
    name: '鋼盔',
    slot: 'helmet',
    icon: 'helmet',
    baseStats: { def: 5, maxHp: 20 },
  },
];

// Armor
export const ARMORS: BaseEquipment[] = [
  {
    id: 'armor_leather',
    name: '皮甲',
    slot: 'armor',
    icon: 'armor',
    baseStats: { def: 3, maxHp: 15 },
  },
  {
    id: 'armor_chain',
    name: '鎖子甲',
    slot: 'armor',
    icon: 'armor',
    baseStats: { def: 6, maxHp: 25 },
  },
  {
    id: 'armor_plate',
    name: '板甲',
    slot: 'armor',
    icon: 'armor',
    baseStats: { def: 10, maxHp: 40, attackSpeed: -0.05 },
  },
];

// Shields
export const SHIELDS: BaseEquipment[] = [
  {
    id: 'shield_wood',
    name: '木盾',
    slot: 'shield',
    icon: 'shield',
    baseStats: { def: 4 },
  },
  {
    id: 'shield_iron',
    name: '鐵盾',
    slot: 'shield',
    icon: 'shield',
    baseStats: { def: 7, maxHp: 15 },
  },
  {
    id: 'shield_tower',
    name: '塔盾',
    slot: 'shield',
    icon: 'shield',
    baseStats: { def: 12, maxHp: 30, attackSpeed: -0.1 },
  },
];

// Rings
export const RINGS: BaseEquipment[] = [
  {
    id: 'ring_power',
    name: '力量之戒',
    slot: 'ring',
    icon: 'ring',
    baseStats: { atk: 3 },
  },
  {
    id: 'ring_vitality',
    name: '活力之戒',
    slot: 'ring',
    icon: 'ring',
    baseStats: { maxHp: 25 },
  },
  {
    id: 'ring_haste',
    name: '迅捷之戒',
    slot: 'ring',
    icon: 'ring',
    baseStats: { attackSpeed: 0.1 },
  },
  {
    id: 'ring_precision',
    name: '精準之戒',
    slot: 'ring',
    icon: 'ring',
    baseStats: { critChance: 0.05 },
  },
];

// Amulets
export const AMULETS: BaseEquipment[] = [
  {
    id: 'amulet_strength',
    name: '力量護符',
    slot: 'amulet',
    icon: 'amulet',
    baseStats: { atk: 4, maxHp: 10 },
  },
  {
    id: 'amulet_protection',
    name: '守護護符',
    slot: 'amulet',
    icon: 'amulet',
    baseStats: { def: 4, maxHp: 20 },
  },
  {
    id: 'amulet_fury',
    name: '狂怒護符',
    slot: 'amulet',
    icon: 'amulet',
    baseStats: { critChance: 0.03, critMultiplier: 0.2 },
  },
];

// All equipment by slot for easy lookup
export const EQUIPMENT_BY_SLOT: Record<EquipmentSlotType, BaseEquipment[]> = {
  weapon: WEAPONS,
  helmet: HELMETS,
  armor: ARMORS,
  shield: SHIELDS,
  ring: RINGS,
  amulet: AMULETS,
};

// Get all equipment
export const ALL_EQUIPMENT: BaseEquipment[] = [
  ...WEAPONS,
  ...HELMETS,
  ...ARMORS,
  ...SHIELDS,
  ...RINGS,
  ...AMULETS,
];

// Crafted equipment definitions (for crafting system)
export const CRAFTED_EQUIPMENT: Record<string, BaseEquipment> = {
  // Forge
  crafted_sword_1: { id: 'crafted_sword_1', name: '鍛造鐵劍', slot: 'weapon', icon: 'sword_basic', baseStats: { atk: 6 } },
  crafted_sword_2: { id: 'crafted_sword_2', name: '鍛造鋼劍', slot: 'weapon', icon: 'sword_iron', baseStats: { atk: 10, critChance: 0.02 } },
  crafted_armor_1: { id: 'crafted_armor_1', name: '鍛造鐵甲', slot: 'armor', icon: 'armor', baseStats: { def: 5, maxHp: 20 } },
  crafted_armor_2: { id: 'crafted_armor_2', name: '鍛造鋼甲', slot: 'armor', icon: 'armor', baseStats: { def: 8, maxHp: 35 } },
  crafted_helmet_1: { id: 'crafted_helmet_1', name: '鍛造鐵盔', slot: 'helmet', icon: 'helmet', baseStats: { def: 4, maxHp: 15 } },
  crafted_shield_1: { id: 'crafted_shield_1', name: '鍛造鐵盾', slot: 'shield', icon: 'shield', baseStats: { def: 6, maxHp: 10 } },
  crafted_axe_1: { id: 'crafted_axe_1', name: '鍛造戰斧', slot: 'weapon', icon: 'axe', baseStats: { atk: 14, attackSpeed: -0.1 } },
  // Fletching
  crafted_bow_1: { id: 'crafted_bow_1', name: '製作短弓', slot: 'weapon', icon: 'bow', baseStats: { atk: 5, critChance: 0.04, attackSpeed: 0.1 } },
  crafted_bow_2: { id: 'crafted_bow_2', name: '製作長弓', slot: 'weapon', icon: 'bow', baseStats: { atk: 8, critChance: 0.06, attackSpeed: 0.15 } },
  crafted_leather_1: { id: 'crafted_leather_1', name: '製作皮甲', slot: 'armor', icon: 'armor', baseStats: { def: 3, maxHp: 15, attackSpeed: 0.05 } },
  crafted_leather_2: { id: 'crafted_leather_2', name: '製作獵人甲', slot: 'armor', icon: 'armor', baseStats: { def: 5, maxHp: 25, attackSpeed: 0.08 } },
  crafted_staff_1: { id: 'crafted_staff_1', name: '製作木杖', slot: 'weapon', icon: 'staff', baseStats: { atk: 4, critMultiplier: 0.3 } },
  crafted_staff_2: { id: 'crafted_staff_2', name: '製作魔法杖', slot: 'weapon', icon: 'staff', baseStats: { atk: 7, critMultiplier: 0.5 } },
  crafted_ring_1: { id: 'crafted_ring_1', name: '製作木戒', slot: 'ring', icon: 'ring', baseStats: { maxHp: 15 } },
  // Alchemy
  crafted_amulet_1: { id: 'crafted_amulet_1', name: '草藥護符', slot: 'amulet', icon: 'amulet', baseStats: { maxHp: 30, def: 2 } },
};

// Get crafted equipment by ID
export const getCraftedEquipment = (id: string): BaseEquipment | undefined => {
  return CRAFTED_EQUIPMENT[id];
};

// Slot display names (Chinese)
export const SLOT_NAMES: Record<EquipmentSlotType, string> = {
  weapon: '武器',
  helmet: '頭盔',
  armor: '盔甲',
  shield: '盾牌',
  ring: '戒指',
  amulet: '護符',
};

// Rarity display names (Chinese)
export const RARITY_NAMES: Record<Rarity, string> = {
  common: '普通',
  uncommon: '優良',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

// Level scaling for item stats
export const ITEM_LEVEL_MULTIPLIER = 0.05; // +5% per item level

// Sell price multipliers by rarity
export const SELL_PRICE_BY_RARITY: Record<Rarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 75,
  epic: 200,
  legendary: 500,
};

// Calculate sell price for an item
export const getSellPrice = (item: { rarity: Rarity; level: number }): number => {
  const basePrice = SELL_PRICE_BY_RARITY[item.rarity];
  return Math.floor(basePrice * (1 + item.level * 0.1));
};
