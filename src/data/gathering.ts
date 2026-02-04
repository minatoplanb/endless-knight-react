import { ResourceType } from './resources';

// Worker types
export type WorkerType = 'miner' | 'lumberjack' | 'fisher' | 'gatherer';

export interface WorkerDefinition {
  id: WorkerType;
  name: string;
  icon: string;
  resource: ResourceType;
  description: string;
}

export const WORKERS: Record<WorkerType, WorkerDefinition> = {
  miner: {
    id: 'miner',
    name: '礦工',
    icon: '⛏️',
    resource: 'ore',
    description: '採集礦石',
  },
  lumberjack: {
    id: 'lumberjack',
    name: '樵夫',
    icon: '🪓',
    resource: 'wood',
    description: '採集木材',
  },
  fisher: {
    id: 'fisher',
    name: '漁夫',
    icon: '🎣',
    resource: 'fish',
    description: '捕撈魚獲',
  },
  gatherer: {
    id: 'gatherer',
    name: '採集者',
    icon: '🌿',
    resource: 'herb',
    description: '採集草藥',
  },
};

// Worker upgrade table
// interval = seconds between each resource gathered
export interface WorkerLevel {
  level: number;
  interval: number; // seconds per resource
  upgradeCost: number; // gold cost to reach this level
}

export const WORKER_LEVELS: WorkerLevel[] = [
  // Early game (levels 1-5): affordable, noticeable improvement
  { level: 1, interval: 15, upgradeCost: 0 },        // Base: 4/min
  { level: 2, interval: 12, upgradeCost: 2000 },     // 5/min
  { level: 3, interval: 10, upgradeCost: 5000 },     // 6/min
  { level: 4, interval: 8, upgradeCost: 12000 },     // 7.5/min
  { level: 5, interval: 7, upgradeCost: 25000 },     // 8.5/min
  // Mid game (levels 6-10): moderate costs
  { level: 6, interval: 6, upgradeCost: 50000 },     // 10/min
  { level: 7, interval: 5.5, upgradeCost: 80000 },   // 11/min
  { level: 8, interval: 5, upgradeCost: 120000 },    // 12/min
  { level: 9, interval: 4.5, upgradeCost: 180000 },  // 13/min
  { level: 10, interval: 4, upgradeCost: 250000 },   // 15/min
  // Late game (levels 11-15): expensive but powerful
  { level: 11, interval: 3.5, upgradeCost: 400000 }, // 17/min
  { level: 12, interval: 3.2, upgradeCost: 600000 }, // 19/min
  { level: 13, interval: 3, upgradeCost: 900000 },   // 20/min
  { level: 14, interval: 2.8, upgradeCost: 1300000 },// 21/min
  { level: 15, interval: 2.5, upgradeCost: 1800000 },// 24/min
  // End game (levels 16-20): prestige territory
  { level: 16, interval: 2.3, upgradeCost: 2500000 },// 26/min
  { level: 17, interval: 2.1, upgradeCost: 3500000 },// 29/min
  { level: 18, interval: 2, upgradeCost: 5000000 },  // 30/min
  { level: 19, interval: 1.8, upgradeCost: 7000000 },// 33/min
  { level: 20, interval: 1.5, upgradeCost: 10000000 },// 40/min (max)
];

export const WORKER_MAX_LEVEL = 20;

// Get worker interval by level
export const getWorkerInterval = (level: number): number => {
  const levelData = WORKER_LEVELS.find(l => l.level === level);
  return levelData?.interval ?? WORKER_LEVELS[0].interval;
};

// Get upgrade cost to next level
export const getWorkerUpgradeCost = (currentLevel: number): number => {
  if (currentLevel >= WORKER_MAX_LEVEL) return Infinity;
  const nextLevelData = WORKER_LEVELS.find(l => l.level === currentLevel + 1);
  return nextLevelData?.upgradeCost ?? Infinity;
};

// All worker types for iteration
export const ALL_WORKERS: WorkerType[] = ['miner', 'lumberjack', 'fisher', 'gatherer'];
