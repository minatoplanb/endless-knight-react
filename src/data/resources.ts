// Resource types used in the gathering system
export type ResourceType = 'ore' | 'wood' | 'fish' | 'herb';

export interface ResourceDefinition {
  id: ResourceType;
  name: string;
  icon: string;
  description: string;
}

export const RESOURCES: Record<ResourceType, ResourceDefinition> = {
  ore: {
    id: 'ore',
    name: '礦石',
    icon: '⛏️',
    description: '用於鍛造近戰武器和重甲',
  },
  wood: {
    id: 'wood',
    name: '木材',
    icon: '🪓',
    description: '用於製作遠程武器和輕甲',
  },
  fish: {
    id: 'fish',
    name: '魚獲',
    icon: '🐟',
    description: '用於烹飪食物',
  },
  herb: {
    id: 'herb',
    name: '草藥',
    icon: '🌿',
    description: '用於煉金製作藥水',
  },
};

// Resource storage caps
export const RESOURCE_BASE_CAP = 500;

// Resource cap upgrade system
export const RESOURCE_CAP_UPGRADE = {
  baseCapIncrease: 250,      // +250 per level
  maxLevel: 10,              // Max 10 upgrades = +2500 total cap = 3000 max
  baseCost: 5000,            // Starting cost
  costMultiplier: 1.8,       // Cost growth per level
};

// Calculate resource cap based on upgrade level
export const getResourceCap = (upgradeLevel: number): number => {
  return RESOURCE_BASE_CAP + (upgradeLevel * RESOURCE_CAP_UPGRADE.baseCapIncrease);
};

// Calculate cost to upgrade resource cap
export const getResourceCapUpgradeCost = (currentLevel: number): number => {
  if (currentLevel >= RESOURCE_CAP_UPGRADE.maxLevel) return Infinity;
  return Math.floor(RESOURCE_CAP_UPGRADE.baseCost * Math.pow(RESOURCE_CAP_UPGRADE.costMultiplier, currentLevel));
};

// All resource types for iteration
export const ALL_RESOURCES: ResourceType[] = ['ore', 'wood', 'fish', 'herb'];
