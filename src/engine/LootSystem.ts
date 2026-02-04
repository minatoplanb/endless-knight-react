// Loot System - Melvor Idle inspired
// Normal enemies drop MATERIALS (resources + monster parts)
// Only BOSSES can drop equipment (rare)

import { Equipment, Rarity, EquipmentSlotType, EquipmentStats, ResourceType, MonsterPartType } from '../types';
import {
  EQUIPMENT_BY_SLOT,
  RARITY_DROP_RATES,
  RARITY_MULTIPLIERS,
  ITEM_LEVEL_MULTIPLIER,
  BaseEquipment,
} from '../data/equipment';

let lootIdCounter = 0;

function generateLootId(): string {
  return `loot_${Date.now()}_${++lootIdCounter}`;
}

// ========== MATERIAL DROP SYSTEM ==========

// Area-based resource drop weights
const AREA_RESOURCE_WEIGHTS: Record<string, Partial<Record<ResourceType, number>>> = {
  starter_plains: { ore: 30, wood: 30, fish: 20, herb: 20 },
  dark_forest: { ore: 15, wood: 45, fish: 15, herb: 25 },
  stone_highlands: { ore: 50, wood: 20, fish: 10, herb: 20 },
  misty_swamp: { ore: 15, wood: 20, fish: 40, herb: 25 },
  flame_hell: { ore: 40, wood: 10, fish: 10, herb: 40 },
};

// Default weights if area not found
const DEFAULT_RESOURCE_WEIGHTS: Record<ResourceType, number> = {
  ore: 25, wood: 25, fish: 25, herb: 25,
};

// Monster part drop rates
const MONSTER_PART_DROP_RATES = {
  common_part: {
    normal: 0.25,    // 25% from normal enemies
    boss: 1.0,       // 100% from bosses
  },
  rare_part: {
    normal: 0.02,    // 2% from normal enemies
    boss: 0.50,      // 50% from bosses
  },
  boss_part: {
    normal: 0,       // Never from normal enemies
    boss: 1.0,       // 100% from bosses
  },
};

// Amount of resources dropped per kill
const RESOURCE_DROP_AMOUNTS = {
  normal: { min: 1, max: 3 },
  boss: { min: 5, max: 15 },
};

// Amount of monster parts dropped
const MONSTER_PART_DROP_AMOUNTS = {
  common_part: { normal: { min: 1, max: 2 }, boss: { min: 3, max: 5 } },
  rare_part: { normal: { min: 1, max: 1 }, boss: { min: 1, max: 3 } },
  boss_part: { normal: { min: 0, max: 0 }, boss: { min: 1, max: 2 } },
};

export interface MaterialDrop {
  resources: Partial<Record<ResourceType, number>>;
  monsterParts: Partial<Record<MonsterPartType, number>>;
}

function rollWeightedResource(weights: Record<ResourceType, number>): ResourceType {
  const resources: ResourceType[] = ['ore', 'wood', 'fish', 'herb'];
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  for (const resource of resources) {
    roll -= weights[resource] || 0;
    if (roll <= 0) return resource;
  }
  return 'ore';
}

function rollAmount(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ========== EQUIPMENT DROP SYSTEM (BOSS ONLY) ==========

// Boss equipment drop rate (very rare!)
const BOSS_EQUIPMENT_DROP_RATE = 0.15; // 15% chance from boss

// Rarity boost for boss drops
const BOSS_RARITY_BOOST = 0.15;

function rollRarity(rarityBoost: number = 0): Rarity {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  let roll = Math.random();
  roll = Math.max(0, roll - rarityBoost);

  let cumulative = 0;
  for (const rarity of rarities) {
    cumulative += RARITY_DROP_RATES[rarity];
    if (roll < cumulative) {
      return rarity;
    }
  }
  return 'common';
}

function rollSlot(): EquipmentSlotType {
  const slots: EquipmentSlotType[] = ['weapon', 'helmet', 'armor', 'shield', 'ring', 'amulet'];
  return slots[Math.floor(Math.random() * slots.length)];
}

function rollBaseEquipment(slot: EquipmentSlotType): BaseEquipment {
  const equipment = EQUIPMENT_BY_SLOT[slot];
  return equipment[Math.floor(Math.random() * equipment.length)];
}

function calculateFinalStats(
  baseStats: EquipmentStats,
  rarity: Rarity,
  level: number
): EquipmentStats {
  const rarityMult = RARITY_MULTIPLIERS[rarity];
  const levelMult = 1 + level * ITEM_LEVEL_MULTIPLIER;
  const totalMult = rarityMult * levelMult;

  const finalStats: EquipmentStats = {};

  if (baseStats.atk !== undefined) {
    finalStats.atk = Math.floor(baseStats.atk * totalMult);
  }
  if (baseStats.def !== undefined) {
    finalStats.def = Math.floor(baseStats.def * totalMult);
  }
  if (baseStats.maxHp !== undefined) {
    finalStats.maxHp = Math.floor(baseStats.maxHp * totalMult);
  }
  if (baseStats.attackSpeed !== undefined) {
    finalStats.attackSpeed = Number((baseStats.attackSpeed * (1 + (totalMult - 1) * 0.3)).toFixed(3));
  }
  if (baseStats.critChance !== undefined) {
    finalStats.critChance = Number((baseStats.critChance * (1 + (totalMult - 1) * 0.5)).toFixed(4));
  }
  if (baseStats.critMultiplier !== undefined) {
    finalStats.critMultiplier = Number((baseStats.critMultiplier * (1 + (totalMult - 1) * 0.4)).toFixed(2));
  }

  return finalStats;
}

function getRarityPrefix(rarity: Rarity): string {
  switch (rarity) {
    case 'uncommon':
      return '精良的';
    case 'rare':
      return '稀有的';
    case 'epic':
      return '史詩級';
    case 'legendary':
      return '傳說級';
    default:
      return '';
  }
}

// ========== EXPORTED LOOT SYSTEM ==========

export const LootSystem = {
  // Generate material drops (resources + monster parts)
  generateMaterialDrop(areaId: string, stage: number, isBoss: boolean): MaterialDrop {
    const drops: MaterialDrop = {
      resources: {},
      monsterParts: {},
    };

    // Get area-specific resource weights
    const weights = AREA_RESOURCE_WEIGHTS[areaId] || DEFAULT_RESOURCE_WEIGHTS;
    const fullWeights = { ...DEFAULT_RESOURCE_WEIGHTS, ...weights };

    // Roll for resource drops (1-3 types of resources)
    const numResourceTypes = isBoss ? rollAmount(2, 4) : rollAmount(1, 2);
    const amounts = isBoss ? RESOURCE_DROP_AMOUNTS.boss : RESOURCE_DROP_AMOUNTS.normal;

    // Scale amounts by stage
    const stageMultiplier = 1 + Math.floor(stage / 20) * 0.5;

    for (let i = 0; i < numResourceTypes; i++) {
      const resource = rollWeightedResource(fullWeights);
      const amount = Math.floor(rollAmount(amounts.min, amounts.max) * stageMultiplier);
      drops.resources[resource] = (drops.resources[resource] || 0) + amount;
    }

    // Roll for monster parts
    const partTypes: MonsterPartType[] = ['common_part', 'rare_part', 'boss_part'];
    for (const partType of partTypes) {
      const dropRate = isBoss
        ? MONSTER_PART_DROP_RATES[partType].boss
        : MONSTER_PART_DROP_RATES[partType].normal;

      if (Math.random() < dropRate) {
        const partAmounts = isBoss
          ? MONSTER_PART_DROP_AMOUNTS[partType].boss
          : MONSTER_PART_DROP_AMOUNTS[partType].normal;
        const amount = rollAmount(partAmounts.min, partAmounts.max);
        if (amount > 0) {
          drops.monsterParts[partType] = (drops.monsterParts[partType] || 0) + amount;
        }
      }
    }

    return drops;
  },

  // Check if boss should drop equipment (rare!)
  shouldBossDropEquipment(): boolean {
    return Math.random() < BOSS_EQUIPMENT_DROP_RATE;
  },

  // Generate equipment drop (boss only)
  generateEquipmentDrop(stage: number): Equipment {
    const rarity = rollRarity(BOSS_RARITY_BOOST);
    const slot = rollSlot();
    const baseEquip = rollBaseEquipment(slot);
    const itemLevel = Math.max(1, Math.floor(stage / 5));
    const finalStats = calculateFinalStats(baseEquip.baseStats, rarity, itemLevel);
    const prefix = getRarityPrefix(rarity);
    const displayName = prefix ? `${prefix}${baseEquip.name}` : baseEquip.name;

    return {
      id: generateLootId(),
      baseId: baseEquip.id,
      name: displayName,
      slot: baseEquip.slot,
      rarity,
      stats: finalStats,
      icon: baseEquip.icon,
      level: itemLevel,
      enhancementLevel: 0,
    };
  },

  // Compare two equipment items (returns true if new is better)
  isUpgrade(current: Equipment | null, newItem: Equipment): boolean {
    if (!current) return true;

    const sumStats = (stats: EquipmentStats): number => {
      let sum = 0;
      if (stats.atk) sum += stats.atk * 2;
      if (stats.def) sum += stats.def * 1.5;
      if (stats.maxHp) sum += stats.maxHp * 0.5;
      if (stats.attackSpeed) sum += stats.attackSpeed * 20;
      if (stats.critChance) sum += stats.critChance * 100;
      if (stats.critMultiplier) sum += stats.critMultiplier * 10;
      return sum;
    };

    return sumStats(newItem.stats) > sumStats(current.stats);
  },

  // Format material drop for display
  formatMaterialDrop(drop: MaterialDrop): string {
    const parts: string[] = [];

    // Resources
    const resourceIcons: Record<ResourceType, string> = {
      ore: '🪨', wood: '🪵', fish: '🐟', herb: '🌿'
    };
    for (const [resource, amount] of Object.entries(drop.resources)) {
      if (amount && amount > 0) {
        parts.push(`${resourceIcons[resource as ResourceType]} +${amount}`);
      }
    }

    // Monster parts
    const partIcons: Record<MonsterPartType, string> = {
      common_part: '🦴', rare_part: '💎', boss_part: '👑'
    };
    for (const [part, amount] of Object.entries(drop.monsterParts)) {
      if (amount && amount > 0) {
        parts.push(`${partIcons[part as MonsterPartType]} +${amount}`);
      }
    }

    return parts.join(' ');
  },
};
