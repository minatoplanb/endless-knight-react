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
  { level: 1, interval: 10, upgradeCost: 0 },      // Base level: 1 per 10 seconds
  { level: 2, interval: 8, upgradeCost: 500 },     // 1 per 8 seconds
  { level: 3, interval: 6, upgradeCost: 2000 },    // 1 per 6 seconds
  { level: 4, interval: 4, upgradeCost: 8000 },    // 1 per 4 seconds
  { level: 5, interval: 2, upgradeCost: 32000 },   // 1 per 2 seconds (max)
];

export const WORKER_MAX_LEVEL = 5;

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
