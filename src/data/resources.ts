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

// Resource storage caps (can be upgraded later)
export const RESOURCE_BASE_CAP = 500;

// All resource types for iteration
export const ALL_RESOURCES: ResourceType[] = ['ore', 'wood', 'fish', 'herb'];
