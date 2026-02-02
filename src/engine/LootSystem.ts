import { Equipment, Rarity, EquipmentSlotType, EquipmentStats } from '../types';
import {
  EQUIPMENT_BY_SLOT,
  RARITY_DROP_RATES,
  RARITY_MULTIPLIERS,
  BASE_DROP_CHANCE,
  DROP_CHANCE_PER_STAGE,
  MAX_DROP_CHANCE,
  BOSS_DROP_CHANCE,
  BOSS_RARITY_BOOST,
  ITEM_LEVEL_MULTIPLIER,
  BaseEquipment,
} from '../data/equipment';

let lootIdCounter = 0;

function generateLootId(): string {
  return `loot_${Date.now()}_${++lootIdCounter}`;
}

// Roll for rarity based on drop rates, with optional boost for bosses
function rollRarity(rarityBoost: number = 0): Rarity {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  let roll = Math.random();

  // Apply rarity boost by shifting the roll down (makes higher rarities more likely)
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

// Pick a random equipment slot
function rollSlot(): EquipmentSlotType {
  const slots: EquipmentSlotType[] = ['weapon', 'helmet', 'armor', 'shield', 'ring', 'amulet'];
  return slots[Math.floor(Math.random() * slots.length)];
}

// Pick a random base equipment from a slot
function rollBaseEquipment(slot: EquipmentSlotType): BaseEquipment {
  const equipment = EQUIPMENT_BY_SLOT[slot];
  return equipment[Math.floor(Math.random() * equipment.length)];
}

// Calculate final stats with rarity and level multipliers
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
    // Attack speed doesn't scale as much
    finalStats.attackSpeed = Number((baseStats.attackSpeed * (1 + (totalMult - 1) * 0.3)).toFixed(3));
  }
  if (baseStats.critChance !== undefined) {
    // Crit chance scales moderately
    finalStats.critChance = Number((baseStats.critChance * (1 + (totalMult - 1) * 0.5)).toFixed(4));
  }
  if (baseStats.critMultiplier !== undefined) {
    // Crit multiplier scales moderately
    finalStats.critMultiplier = Number((baseStats.critMultiplier * (1 + (totalMult - 1) * 0.4)).toFixed(2));
  }

  return finalStats;
}

// Generate rarity name prefix
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

export const LootSystem = {
  // Check if loot should drop
  shouldDropLoot(stage: number, isBoss: boolean = false): boolean {
    if (isBoss) {
      return Math.random() < BOSS_DROP_CHANCE;
    }
    const dropChance = Math.min(
      MAX_DROP_CHANCE,
      BASE_DROP_CHANCE + stage * DROP_CHANCE_PER_STAGE
    );
    return Math.random() < dropChance;
  },

  // Generate a random equipment drop
  generateDrop(stage: number, isBoss: boolean = false): Equipment {
    const rarity = rollRarity(isBoss ? BOSS_RARITY_BOOST : 0);
    const slot = rollSlot();
    const baseEquip = rollBaseEquipment(slot);

    // Item level is based on current stage
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
    };
  },

  // Compare two equipment items (returns true if new is better)
  isUpgrade(current: Equipment | null, newItem: Equipment): boolean {
    if (!current) return true;

    // Simple comparison: sum of all positive stats
    const sumStats = (stats: EquipmentStats): number => {
      let sum = 0;
      if (stats.atk) sum += stats.atk * 2; // Weight attack higher
      if (stats.def) sum += stats.def * 1.5;
      if (stats.maxHp) sum += stats.maxHp * 0.5;
      if (stats.attackSpeed) sum += stats.attackSpeed * 20;
      if (stats.critChance) sum += stats.critChance * 100;
      if (stats.critMultiplier) sum += stats.critMultiplier * 10;
      return sum;
    };

    return sumStats(newItem.stats) > sumStats(current.stats);
  },

  // Get drop chance for UI display
  getDropChance(stage: number): number {
    return Math.min(MAX_DROP_CHANCE, BASE_DROP_CHANCE + stage * DROP_CHANCE_PER_STAGE);
  },
};
