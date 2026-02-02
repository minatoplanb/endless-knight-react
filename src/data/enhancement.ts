// Equipment Enhancement System
// Upgrade equipment using resources to increase stats

import { ResourceType, Rarity, EquipmentSlotType } from '../types';

// Maximum enhancement level by rarity
export const MAX_ENHANCEMENT_LEVEL: Record<Rarity, number> = {
  common: 5,
  uncommon: 7,
  rare: 10,
  epic: 12,
  legendary: 15,
};

// Base resource cost for enhancement (multiplied by current level)
export const ENHANCEMENT_BASE_COST: Record<EquipmentSlotType, Partial<Record<ResourceType, number>>> = {
  weapon: { ore: 5, wood: 2 },
  helmet: { ore: 3 },
  armor: { ore: 4, wood: 1 },
  shield: { ore: 4 },
  ring: { ore: 2, herb: 2 },
  amulet: { herb: 4, fish: 1 },
};

// Gold cost multiplier by rarity
export const ENHANCEMENT_GOLD_MULTIPLIER: Record<Rarity, number> = {
  common: 20,
  uncommon: 40,
  rare: 80,
  epic: 150,
  legendary: 300,
};

// Stat increase per enhancement level (percentage)
export const ENHANCEMENT_STAT_BONUS = 0.10; // +10% per level

// Success rate decreases with level
export const getEnhancementSuccessRate = (currentLevel: number): number => {
  // Level 0->1: 100%, Level 1->2: 95%, etc.
  // Minimum 50% success rate
  return Math.max(0.5, 1 - currentLevel * 0.05);
};

// Calculate resource cost for enhancement
export const getEnhancementCost = (
  slot: EquipmentSlotType,
  rarity: Rarity,
  currentLevel: number
): { resources: Partial<Record<ResourceType, number>>; gold: number } => {
  const baseCost = ENHANCEMENT_BASE_COST[slot];
  const levelMultiplier = currentLevel + 1;
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  }[rarity];

  const resources: Partial<Record<ResourceType, number>> = {};
  for (const [resource, amount] of Object.entries(baseCost)) {
    resources[resource as ResourceType] = Math.ceil(amount * levelMultiplier * rarityMultiplier);
  }

  const gold = Math.floor(ENHANCEMENT_GOLD_MULTIPLIER[rarity] * levelMultiplier);

  return { resources, gold };
};

// Check if enhancement is at max level
export const isMaxEnhancement = (rarity: Rarity, currentLevel: number): boolean => {
  return currentLevel >= MAX_ENHANCEMENT_LEVEL[rarity];
};

// Calculate enhanced stats
export const calculateEnhancedStats = (
  baseStats: Record<string, number>,
  enhancementLevel: number
): Record<string, number> => {
  const multiplier = 1 + enhancementLevel * ENHANCEMENT_STAT_BONUS;
  const enhanced: Record<string, number> = {};

  for (const [stat, value] of Object.entries(baseStats)) {
    if (typeof value === 'number') {
      // For percentage stats (attackSpeed, critChance, critMultiplier), add flat bonus
      if (stat === 'attackSpeed' || stat === 'critChance' || stat === 'critMultiplier') {
        enhanced[stat] = value + enhancementLevel * 0.01; // +1% per level
      } else {
        // For flat stats (atk, def, maxHp), multiply
        enhanced[stat] = Math.floor(value * multiplier);
      }
    }
  }

  return enhanced;
};
