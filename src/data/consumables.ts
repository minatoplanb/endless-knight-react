// Consumables System - Food and Potions

export type ConsumableType = 'food' | 'potion';

export type BuffType = 'atk' | 'def' | 'attackSpeed' | 'critChance';

export interface Consumable {
  id: string;
  name: string;
  description: string;
  type: ConsumableType;
  icon: string;
  stackable: boolean;
  maxStack: number;
  // Effect
  effect: ConsumableEffect;
}

export type ConsumableEffect =
  | { type: 'heal'; amount: number }
  | { type: 'buff'; buffType: BuffType; multiplier: number; duration: number };

// Active buff state
export interface ActiveBuff {
  id: string;
  buffType: BuffType;
  multiplier: number; // e.g., 1.2 for +20%
  expiresAt: number; // timestamp
  sourceId: string; // consumable id that created this buff
}

// ========== CONSUMABLE DEFINITIONS ==========

export const CONSUMABLES: Record<string, Consumable> = {
  // ========== FOOD (healing) ==========
  food_fish_1: {
    id: 'food_fish_1',
    name: '烤魚',
    description: '恢復 30 HP',
    type: 'food',
    icon: '🐟',
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal', amount: 30 },
  },
  food_stew_1: {
    id: 'food_stew_1',
    name: '魚湯',
    description: '恢復 60 HP',
    type: 'food',
    icon: '🍲',
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal', amount: 60 },
  },
  food_feast_1: {
    id: 'food_feast_1',
    name: '豪華大餐',
    description: '恢復 100 HP',
    type: 'food',
    icon: '🍽️',
    stackable: true,
    maxStack: 99,
    effect: { type: 'heal', amount: 100 },
  },

  // ========== POTIONS (buffs) ==========
  potion_strength_1: {
    id: 'potion_strength_1',
    name: '力量藥水',
    description: 'ATK +20% (60秒)',
    type: 'potion',
    icon: '💪',
    stackable: true,
    maxStack: 20,
    effect: { type: 'buff', buffType: 'atk', multiplier: 1.2, duration: 60000 },
  },
  potion_defense_1: {
    id: 'potion_defense_1',
    name: '防禦藥水',
    description: 'DEF +20% (60秒)',
    type: 'potion',
    icon: '🛡️',
    stackable: true,
    maxStack: 20,
    effect: { type: 'buff', buffType: 'def', multiplier: 1.2, duration: 60000 },
  },
  potion_speed_1: {
    id: 'potion_speed_1',
    name: '速度藥水',
    description: '攻速 +20% (60秒)',
    type: 'potion',
    icon: '⚡',
    stackable: true,
    maxStack: 20,
    effect: { type: 'buff', buffType: 'attackSpeed', multiplier: 1.2, duration: 60000 },
  },
  potion_healing_1: {
    id: 'potion_healing_1',
    name: '治療藥水',
    description: '立即恢復 50 HP',
    type: 'potion',
    icon: '❤️',
    stackable: true,
    maxStack: 20,
    effect: { type: 'heal', amount: 50 },
  },
};

// ========== HELPER FUNCTIONS ==========

export const getConsumableById = (id: string): Consumable | undefined => {
  return CONSUMABLES[id];
};

export const isHealingItem = (consumable: Consumable): boolean => {
  return consumable.effect.type === 'heal';
};

export const isBuffItem = (consumable: Consumable): boolean => {
  return consumable.effect.type === 'buff';
};

// Get healing amount from a consumable (returns 0 if not a healing item)
export const getHealAmount = (consumable: Consumable): number => {
  if (consumable.effect.type === 'heal') {
    return consumable.effect.amount;
  }
  return 0;
};
