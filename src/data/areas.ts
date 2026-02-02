// Area System - defines game regions with unique enemies and progression

import { ImageSourcePropType } from 'react-native';
import { CombatStyle } from './combatStyles';

// Enemy definition for a specific area
export interface AreaEnemy {
  id: string;
  name: string;
  sprite: string; // matches the enemy image file name
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  goldMultiplier: number; // relative to base gold drop
  weight: number; // spawn weight (higher = more common)
  combatStyle: CombatStyle; // Combat triangle style
}

// Area unlock condition
export interface AreaUnlockCondition {
  type: 'clear_area' | 'none';
  areaId?: string;
}

// Area definition
export interface Area {
  id: string;
  name: string;
  description: string;
  background: string; // key for BACKGROUNDS in BattleView
  requiredLevel: number; // for future equipment level system
  stages: number; // how many stages in this area (each stage = 10 enemies)
  enemies: AreaEnemy[];
  unlockCondition: AreaUnlockCondition;
}

// ========== AREA DEFINITIONS ==========

export const AREAS: Area[] = [
  // Area 1: Starter Plains
  {
    id: 'starter_plains',
    name: '新手平原',
    description: '和平的草原，適合新手冒險者磨練技巧。',
    background: 'forest',
    requiredLevel: 0,
    stages: 10,
    enemies: [
      {
        id: 'slime_green',
        name: '綠史萊姆',
        sprite: 'slime_green',
        baseHp: 30,
        baseAtk: 5,
        baseDef: 0,
        goldMultiplier: 1.0,
        weight: 40,
        combatStyle: 'melee',
      },
      {
        id: 'slime_blue',
        name: '藍史萊姆',
        sprite: 'slime_blue',
        baseHp: 40,
        baseAtk: 6,
        baseDef: 2,
        goldMultiplier: 1.1,
        weight: 30,
        combatStyle: 'magic',
      },
      {
        id: 'rat',
        name: '巨鼠',
        sprite: 'rat',
        baseHp: 25,
        baseAtk: 8,
        baseDef: 0,
        goldMultiplier: 0.9,
        weight: 20,
        combatStyle: 'melee',
      },
      {
        id: 'mushroom',
        name: '毒蘑菇',
        sprite: 'mushroom',
        baseHp: 50,
        baseAtk: 4,
        baseDef: 5,
        goldMultiplier: 1.2,
        weight: 10,
        combatStyle: 'magic',
      },
    ],
    unlockCondition: { type: 'none' },
  },

  // Area 2: Dark Forest
  {
    id: 'dark_forest',
    name: '陰暗森林',
    description: '茂密的樹林遮蔽了陽光，危險的生物潛伏其中。',
    background: 'forest_autumn',
    requiredLevel: 20,
    stages: 15,
    enemies: [
      {
        id: 'bat',
        name: '蝙蝠',
        sprite: 'bat',
        baseHp: 45,
        baseAtk: 12,
        baseDef: 3,
        goldMultiplier: 1.0,
        weight: 30,
        combatStyle: 'ranged',
      },
      {
        id: 'goblin',
        name: '哥布林',
        sprite: 'goblin',
        baseHp: 70,
        baseAtk: 15,
        baseDef: 5,
        goldMultiplier: 1.3,
        weight: 35,
        combatStyle: 'ranged',
      },
      {
        id: 'slime_red',
        name: '紅史萊姆',
        sprite: 'slime_red',
        baseHp: 80,
        baseAtk: 10,
        baseDef: 8,
        goldMultiplier: 1.2,
        weight: 20,
        combatStyle: 'melee',
      },
      {
        id: 'zombie',
        name: '殭屍',
        sprite: 'zombie',
        baseHp: 100,
        baseAtk: 18,
        baseDef: 10,
        goldMultiplier: 1.5,
        weight: 15,
        combatStyle: 'melee',
      },
    ],
    unlockCondition: { type: 'clear_area', areaId: 'starter_plains' },
  },

  // Area 3: Stone Highlands
  {
    id: 'stone_highlands',
    name: '石壁高地',
    description: '荒涼的高地，骷髏戰士在此守護古老的遺跡。',
    background: 'desert',
    requiredLevel: 40,
    stages: 20,
    enemies: [
      {
        id: 'skeleton',
        name: '骷髏',
        sprite: 'skeleton',
        baseHp: 120,
        baseAtk: 20,
        baseDef: 15,
        goldMultiplier: 1.0,
        weight: 35,
        combatStyle: 'melee',
      },
      {
        id: 'skeleton_red',
        name: '紅骷髏',
        sprite: 'skeleton_red',
        baseHp: 150,
        baseAtk: 25,
        baseDef: 12,
        goldMultiplier: 1.3,
        weight: 25,
        combatStyle: 'magic',
      },
      {
        id: 'orc',
        name: '獸人',
        sprite: 'orc',
        baseHp: 180,
        baseAtk: 22,
        baseDef: 20,
        goldMultiplier: 1.4,
        weight: 25,
        combatStyle: 'melee',
      },
      {
        id: 'skeleton_gold',
        name: '金骷髏',
        sprite: 'skeleton_gold',
        baseHp: 200,
        baseAtk: 28,
        baseDef: 25,
        goldMultiplier: 2.0,
        weight: 10,
        combatStyle: 'ranged',
      },
      {
        id: 'mimic',
        name: '寶箱怪',
        sprite: 'mimic',
        baseHp: 250,
        baseAtk: 30,
        baseDef: 18,
        goldMultiplier: 3.0,
        weight: 5,
        combatStyle: 'magic',
      },
    ],
    unlockCondition: { type: 'clear_area', areaId: 'dark_forest' },
  },
];

// ========== HELPER FUNCTIONS ==========

// Get area by ID
export const getAreaById = (areaId: string): Area | undefined => {
  return AREAS.find((area) => area.id === areaId);
};

// Get first area (starting area)
export const getStartingArea = (): Area => {
  return AREAS[0];
};

// Get next area after the given area
export const getNextArea = (currentAreaId: string): Area | undefined => {
  const currentIndex = AREAS.findIndex((area) => area.id === currentAreaId);
  if (currentIndex === -1 || currentIndex >= AREAS.length - 1) {
    return undefined;
  }
  return AREAS[currentIndex + 1];
};

// Select a random enemy from area based on weights
export const selectRandomEnemy = (area: Area): AreaEnemy => {
  const totalWeight = area.enemies.reduce((sum, enemy) => sum + enemy.weight, 0);
  let random = Math.random() * totalWeight;

  for (const enemy of area.enemies) {
    random -= enemy.weight;
    if (random <= 0) {
      return enemy;
    }
  }

  // Fallback to first enemy (shouldn't happen)
  return area.enemies[0];
};

// Calculate enemy stats based on stage within area
export const calculateEnemyStats = (
  enemy: AreaEnemy,
  stageInArea: number
): { hp: number; atk: number; def: number; gold: number } => {
  // Stage multiplier: stats increase by 5% per stage within the area
  const stageMultiplier = 1 + (stageInArea - 1) * 0.05;

  return {
    hp: Math.floor(enemy.baseHp * stageMultiplier),
    atk: Math.floor(enemy.baseAtk * stageMultiplier),
    def: Math.floor(enemy.baseDef * stageMultiplier),
    gold: Math.floor(10 * enemy.goldMultiplier * stageMultiplier),
  };
};

// Check if an area can be unlocked based on conditions
export const canUnlockArea = (
  area: Area,
  clearedAreas: string[]
): boolean => {
  if (area.unlockCondition.type === 'none') {
    return true;
  }

  if (area.unlockCondition.type === 'clear_area' && area.unlockCondition.areaId) {
    return clearedAreas.includes(area.unlockCondition.areaId);
  }

  return false;
};

// Get all areas that can be unlocked
export const getUnlockableAreas = (clearedAreas: string[]): Area[] => {
  return AREAS.filter(
    (area) =>
      !clearedAreas.includes(area.id) && canUnlockArea(area, clearedAreas)
  );
};
