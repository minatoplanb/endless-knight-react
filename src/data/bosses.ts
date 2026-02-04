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
    hpMultiplier: 20,
    atkMultiplier: 8,  // Increased from 5 - requires consumables
    defMultiplier: 3,
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
    hpMultiplier: 30,
    atkMultiplier: 10,  // Increased from 6 - requires consumables
    defMultiplier: 4,
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
    hpMultiplier: 40,
    atkMultiplier: 14,  // Increased from 8 - requires consumables
    defMultiplier: 5,
    goldMultiplier: 20,
    minDropRarity: 'epic',
  },

  // Area 4: Misty Swamp Boss
  {
    id: 'boss_swamp_king',
    name: '沼澤之王',
    title: '腐敗統治者',
    sprite: 'zombie',
    areaId: 'misty_swamp',
    combatStyle: 'magic',
    hpMultiplier: 50,
    atkMultiplier: 18,  // Increased from 10 - requires consumables
    defMultiplier: 6,
    goldMultiplier: 25,
    minDropRarity: 'epic',
  },

  // Area 5: Flame Hell Boss
  {
    id: 'boss_inferno_lord',
    name: '煉獄魔王',
    title: '地獄之焰',
    sprite: 'skeleton_red',
    areaId: 'flame_hell',
    combatStyle: 'magic',
    hpMultiplier: 60,
    atkMultiplier: 22,  // Increased from 12 - requires consumables
    defMultiplier: 8,
    goldMultiplier: 30,
    minDropRarity: 'legendary',
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
