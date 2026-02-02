// Prestige System - Reset progress for permanent bonuses

export interface PrestigeUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  // Cost per level (can be a function of level)
  baseCost: number;
  costMultiplier: number;
  // Effect per level
  effect: PrestigeEffect;
}

export type PrestigeEffectType =
  | 'atk_percent'
  | 'def_percent'
  | 'hp_percent'
  | 'gold_percent'
  | 'crit_chance'
  | 'attack_speed'
  | 'starting_gold'
  | 'offline_efficiency';

export interface PrestigeEffect {
  type: PrestigeEffectType;
  valuePerLevel: number;
}

// ========== PRESTIGE UPGRADES ==========

export const PRESTIGE_UPGRADES: PrestigeUpgrade[] = [
  // Combat bonuses
  {
    id: 'atk_boost',
    name: '戰鬥之力',
    description: '永久提升攻擊力',
    icon: '⚔️',
    maxLevel: 20,
    baseCost: 1,
    costMultiplier: 1.5,
    effect: { type: 'atk_percent', valuePerLevel: 5 }, // +5% per level
  },
  {
    id: 'def_boost',
    name: '鋼鐵意志',
    description: '永久提升防禦力',
    icon: '🛡️',
    maxLevel: 20,
    baseCost: 1,
    costMultiplier: 1.5,
    effect: { type: 'def_percent', valuePerLevel: 5 },
  },
  {
    id: 'hp_boost',
    name: '生命泉源',
    description: '永久提升最大生命值',
    icon: '❤️',
    maxLevel: 20,
    baseCost: 1,
    costMultiplier: 1.5,
    effect: { type: 'hp_percent', valuePerLevel: 5 },
  },
  {
    id: 'crit_boost',
    name: '致命直覺',
    description: '永久提升暴擊率',
    icon: '💥',
    maxLevel: 10,
    baseCost: 2,
    costMultiplier: 2,
    effect: { type: 'crit_chance', valuePerLevel: 1 }, // +1% per level
  },
  {
    id: 'speed_boost',
    name: '疾風步',
    description: '永久提升攻擊速度',
    icon: '⚡',
    maxLevel: 10,
    baseCost: 2,
    costMultiplier: 2,
    effect: { type: 'attack_speed', valuePerLevel: 2 }, // +2% per level
  },

  // Economy bonuses
  {
    id: 'gold_boost',
    name: '財富之眼',
    description: '永久提升金幣獲取',
    icon: '💰',
    maxLevel: 20,
    baseCost: 1,
    costMultiplier: 1.5,
    effect: { type: 'gold_percent', valuePerLevel: 5 },
  },
  {
    id: 'starting_gold',
    name: '祖傳財產',
    description: '轉生後初始金幣',
    icon: '🏦',
    maxLevel: 10,
    baseCost: 3,
    costMultiplier: 2,
    effect: { type: 'starting_gold', valuePerLevel: 500 }, // +500 gold per level
  },
  {
    id: 'offline_boost',
    name: '夢中修行',
    description: '提升離線收益效率',
    icon: '💤',
    maxLevel: 10,
    baseCost: 2,
    costMultiplier: 2,
    effect: { type: 'offline_efficiency', valuePerLevel: 5 }, // +5% per level
  },
];

// ========== HELPER FUNCTIONS ==========

export const getPrestigeUpgradeById = (id: string): PrestigeUpgrade | undefined => {
  return PRESTIGE_UPGRADES.find((u) => u.id === id);
};

// Calculate cost for a specific level
export const getUpgradeCost = (upgrade: PrestigeUpgrade, currentLevel: number): number => {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
};

// Calculate total effect value for a given level
export const getEffectValue = (upgrade: PrestigeUpgrade, level: number): number => {
  return upgrade.effect.valuePerLevel * level;
};

// Calculate prestige points earned based on progress
// Formula: sqrt(totalGoldEarned / 10000) + (highestStage / 10) + (areasCleared * 5)
export const calculatePrestigePoints = (
  totalGoldEarned: number,
  highestStage: number,
  areasCleared: number
): number => {
  const goldPoints = Math.floor(Math.sqrt(totalGoldEarned / 10000));
  const stagePoints = Math.floor(highestStage / 10);
  const areaPoints = areasCleared * 5;

  return Math.max(0, goldPoints + stagePoints + areaPoints);
};

// Minimum requirements to prestige
export const PRESTIGE_REQUIREMENTS = {
  minGold: 10000,
  minStage: 10,
};

// Check if player can prestige
export const canPrestige = (totalGoldEarned: number, highestStage: number): boolean => {
  return (
    totalGoldEarned >= PRESTIGE_REQUIREMENTS.minGold &&
    highestStage >= PRESTIGE_REQUIREMENTS.minStage
  );
};
