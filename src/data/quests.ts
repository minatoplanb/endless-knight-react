// Quest System - Daily and Weekly quests

import { ResourceType } from '../types';

export type QuestType = 'daily' | 'weekly';

export type QuestObjectiveType =
  | 'kill_enemies'
  | 'kill_bosses'
  | 'earn_gold'
  | 'collect_resource'
  | 'craft_items'
  | 'enhance_equipment'
  | 'use_skills'
  | 'use_consumables'
  | 'reach_stage';

export interface QuestReward {
  gold?: number;
  resources?: Partial<Record<ResourceType, number>>;
  skillPoints?: number;
  prestigePoints?: number;
}

export interface QuestObjective {
  type: QuestObjectiveType;
  target: number; // Amount required
  resourceType?: ResourceType; // For collect_resource quests
}

export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  objective: QuestObjective;
  reward: QuestReward;
}

export interface ActiveQuest {
  questId: string;
  progress: number; // Current progress toward objective
  completed: boolean;
  claimed: boolean;
}

export interface QuestState {
  dailyQuests: ActiveQuest[];
  weeklyQuests: ActiveQuest[];
  lastDailyReset: number; // Timestamp
  lastWeeklyReset: number; // Timestamp
}

// ========== QUEST DEFINITIONS ==========

export const DAILY_QUEST_POOL: QuestDefinition[] = [
  // Combat quests
  {
    id: 'daily_kill_50',
    name: '消滅敵人',
    description: '擊敗 50 個敵人',
    type: 'daily',
    objective: { type: 'kill_enemies', target: 50 },
    reward: { gold: 200 },
  },
  {
    id: 'daily_kill_100',
    name: '戰鬥達人',
    description: '擊敗 100 個敵人',
    type: 'daily',
    objective: { type: 'kill_enemies', target: 100 },
    reward: { gold: 500, skillPoints: 1 },
  },
  {
    id: 'daily_boss_1',
    name: '挑戰 Boss',
    description: '擊敗 1 個 Boss',
    type: 'daily',
    objective: { type: 'kill_bosses', target: 1 },
    reward: { gold: 300, skillPoints: 1 },
  },

  // Resource quests
  {
    id: 'daily_gold_500',
    name: '賺取金幣',
    description: '獲得 500 金幣',
    type: 'daily',
    objective: { type: 'earn_gold', target: 500 },
    reward: { resources: { ore: 20, wood: 20 } },
  },
  {
    id: 'daily_collect_ore',
    name: '採集礦石',
    description: '採集 30 礦石',
    type: 'daily',
    objective: { type: 'collect_resource', target: 30, resourceType: 'ore' },
    reward: { gold: 150 },
  },
  {
    id: 'daily_collect_wood',
    name: '採集木材',
    description: '採集 30 木材',
    type: 'daily',
    objective: { type: 'collect_resource', target: 30, resourceType: 'wood' },
    reward: { gold: 150 },
  },
  {
    id: 'daily_collect_fish',
    name: '捕獲魚獲',
    description: '採集 30 魚獲',
    type: 'daily',
    objective: { type: 'collect_resource', target: 30, resourceType: 'fish' },
    reward: { gold: 150 },
  },
  {
    id: 'daily_collect_herb',
    name: '採集草藥',
    description: '採集 30 草藥',
    type: 'daily',
    objective: { type: 'collect_resource', target: 30, resourceType: 'herb' },
    reward: { gold: 150 },
  },

  // Crafting and enhancement
  {
    id: 'daily_craft_1',
    name: '製作物品',
    description: '製作 1 個物品',
    type: 'daily',
    objective: { type: 'craft_items', target: 1 },
    reward: { gold: 100, resources: { herb: 10 } },
  },
  {
    id: 'daily_enhance_1',
    name: '強化裝備',
    description: '強化裝備 1 次',
    type: 'daily',
    objective: { type: 'enhance_equipment', target: 1 },
    reward: { gold: 200 },
  },

  // Skill usage
  {
    id: 'daily_skill_3',
    name: '使用技能',
    description: '使用技能 3 次',
    type: 'daily',
    objective: { type: 'use_skills', target: 3 },
    reward: { gold: 150, skillPoints: 1 },
  },
  {
    id: 'daily_consume_3',
    name: '使用消耗品',
    description: '使用消耗品 3 次',
    type: 'daily',
    objective: { type: 'use_consumables', target: 3 },
    reward: { gold: 100 },
  },
];

export const WEEKLY_QUEST_POOL: QuestDefinition[] = [
  // Major combat quests
  {
    id: 'weekly_kill_500',
    name: '週間戰士',
    description: '擊敗 500 個敵人',
    type: 'weekly',
    objective: { type: 'kill_enemies', target: 500 },
    reward: { gold: 2000, skillPoints: 3 },
  },
  {
    id: 'weekly_kill_1000',
    name: '戰場英雄',
    description: '擊敗 1000 個敵人',
    type: 'weekly',
    objective: { type: 'kill_enemies', target: 1000 },
    reward: { gold: 5000, skillPoints: 5, prestigePoints: 1 },
  },
  {
    id: 'weekly_boss_5',
    name: 'Boss 獵人',
    description: '擊敗 5 個 Boss',
    type: 'weekly',
    objective: { type: 'kill_bosses', target: 5 },
    reward: { gold: 3000, skillPoints: 5 },
  },

  // Resource collection
  {
    id: 'weekly_gold_5000',
    name: '財富累積',
    description: '獲得 5000 金幣',
    type: 'weekly',
    objective: { type: 'earn_gold', target: 5000 },
    reward: { resources: { ore: 100, wood: 100, fish: 100, herb: 100 } },
  },
  {
    id: 'weekly_resources',
    name: '資源收集者',
    description: '採集 200 礦石',
    type: 'weekly',
    objective: { type: 'collect_resource', target: 200, resourceType: 'ore' },
    reward: { gold: 1500, skillPoints: 2 },
  },

  // Crafting
  {
    id: 'weekly_craft_10',
    name: '工匠精神',
    description: '製作 10 個物品',
    type: 'weekly',
    objective: { type: 'craft_items', target: 10 },
    reward: { gold: 2000, prestigePoints: 1 },
  },

  // Enhancement
  {
    id: 'weekly_enhance_5',
    name: '強化大師',
    description: '強化裝備 5 次',
    type: 'weekly',
    objective: { type: 'enhance_equipment', target: 5 },
    reward: { gold: 2500, skillPoints: 3 },
  },

  // Skills
  {
    id: 'weekly_skill_20',
    name: '技能專家',
    description: '使用技能 20 次',
    type: 'weekly',
    objective: { type: 'use_skills', target: 20 },
    reward: { gold: 1500, skillPoints: 5 },
  },
];

// ========== HELPER FUNCTIONS ==========

// Get quest definition by ID
export const getQuestById = (id: string): QuestDefinition | undefined => {
  return [...DAILY_QUEST_POOL, ...WEEKLY_QUEST_POOL].find((q) => q.id === id);
};

// Select random quests from a pool
export const selectRandomQuests = (pool: QuestDefinition[], count: number): QuestDefinition[] => {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Create default quest state
export const createDefaultQuestState = (): QuestState => {
  return {
    dailyQuests: [],
    weeklyQuests: [],
    lastDailyReset: 0,
    lastWeeklyReset: 0,
  };
};

// Create active quest from definition
export const createActiveQuest = (quest: QuestDefinition): ActiveQuest => {
  return {
    questId: quest.id,
    progress: 0,
    completed: false,
    claimed: false,
  };
};

// Check if daily reset is needed (reset at midnight UTC)
export const needsDailyReset = (lastReset: number): boolean => {
  const now = new Date();
  const lastResetDate = new Date(lastReset);

  // Compare dates (ignoring time)
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const lastDay = new Date(lastResetDate.getFullYear(), lastResetDate.getMonth(), lastResetDate.getDate()).getTime();

  return nowDay > lastDay;
};

// Check if weekly reset is needed (reset on Monday midnight UTC)
export const needsWeeklyReset = (lastReset: number): boolean => {
  const now = new Date();
  const lastResetDate = new Date(lastReset);

  // Get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const nowWeek = getWeekNumber(now);
  const lastWeek = getWeekNumber(lastResetDate);

  return nowWeek > lastWeek || now.getFullYear() > lastResetDate.getFullYear();
};

// Number of quests per type
export const DAILY_QUEST_COUNT = 3;
export const WEEKLY_QUEST_COUNT = 3;
