// Boss System - Powerful enemies at the end of each area

import { CombatStyle } from './combatStyles';

export interface Boss {
  id: string;
  name: string;
  title: string; // e.g., "King of Slimes"
  sprite: string;
  areaId: string; // Which area this boss belongs to
  combatStyle: CombatStyle;
  // Stats multipliers (applied to area base stats)
  hpMultiplier: number;
  atkMultiplier: number;
  defMultiplier: number;
  // Gold reward multiplier
  goldMultiplier: number;
  // Guaranteed equipment drop rarity (minimum)
  minDropRarity: 'uncommon' | 'rare' | 'epic' | 'legendary';
  // Special abilities (for future expansion)
  abilities?: string[];
}

// ========== BOSS DEFINITIONS ==========

export const BOSSES: Boss[] = [
  // Area 1: Starter Plains Boss
  {
    id: 'boss_slime_king',
    name: '史萊姆王',
    title: '黏液霸主',
    sprite: 'slime_green', // Will use same sprite but larger
    areaId: 'starter_plains',
    combatStyle: 'magic',
    hpMultiplier: 5,
    atkMultiplier: 2,
    defMultiplier: 1.5,
    goldMultiplier: 10,
    minDropRarity: 'uncommon',
  },

  // Area 2: Dark Forest Boss
  {
    id: 'boss_goblin_chief',
    name: '哥布林酋長',
    title: '森林之禍',
    sprite: 'goblin',
    areaId: 'dark_forest',
    combatStyle: 'ranged',
    hpMultiplier: 6,
    atkMultiplier: 2.5,
    defMultiplier: 2,
    goldMultiplier: 15,
    minDropRarity: 'rare',
  },

  // Area 3: Stone Highlands Boss
  {
    id: 'boss_skeleton_lord',
    name: '骷髏領主',
    title: '不死軍團統帥',
    sprite: 'skeleton_gold',
    areaId: 'stone_highlands',
    combatStyle: 'melee',
    hpMultiplier: 8,
    atkMultiplier: 3,
    defMultiplier: 2.5,
    goldMultiplier: 20,
    minDropRarity: 'epic',
  },
];

// ========== HELPER FUNCTIONS ==========

export const getBossByAreaId = (areaId: string): Boss | undefined => {
  return BOSSES.find((boss) => boss.areaId === areaId);
};

export const getBossById = (bossId: string): Boss | undefined => {
  return BOSSES.find((boss) => boss.id === bossId);
};

// Check if the current stage is a boss stage
export const isBossStage = (areaId: string, currentStage: number, totalStages: number): boolean => {
  // Boss appears on the final stage of each area
  return currentStage === totalStages;
};

// Calculate boss stats based on area and stage
export const calculateBossStats = (
  boss: Boss,
  areaBaseHp: number,
  areaBaseAtk: number,
  areaBaseDef: number,
  stageInArea: number
): { hp: number; atk: number; def: number; gold: number } => {
  // Stage multiplier (same as regular enemies)
  const stageMultiplier = 1 + (stageInArea - 1) * 0.05;

  return {
    hp: Math.floor(areaBaseHp * boss.hpMultiplier * stageMultiplier),
    atk: Math.floor(areaBaseAtk * boss.atkMultiplier * stageMultiplier),
    def: Math.floor(areaBaseDef * boss.defMultiplier * stageMultiplier),
    gold: Math.floor(50 * boss.goldMultiplier * stageMultiplier), // Base gold 50 for bosses
  };
};
