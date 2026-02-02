// Achievement System - Track player milestones and reward them

export type AchievementCategory = 'combat' | 'progression' | 'economy' | 'gathering' | 'crafting' | 'skills';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  // Condition to unlock
  condition: {
    type: 'stat_threshold' | 'area_clear' | 'boss_kill' | 'equipment_rarity' | 'worker_level' | 'prestige';
    stat?: string; // For stat_threshold
    threshold: number;
    areaId?: string; // For area_clear
  };
  // Reward for completing (optional)
  reward?: {
    type: 'gold' | 'skill_points' | 'prestige_points';
    amount: number;
  };
  // Is this a hidden achievement?
  hidden?: boolean;
}

// ========== ACHIEVEMENT DEFINITIONS ==========

export const ACHIEVEMENTS: Achievement[] = [
  // ========== COMBAT ACHIEVEMENTS ==========
  {
    id: 'first_blood',
    name: '初次擊殺',
    description: '擊殺第一個敵人',
    icon: '🗡️',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalEnemiesKilled', threshold: 1 },
    reward: { type: 'gold', amount: 50 },
  },
  {
    id: 'novice_hunter',
    name: '新手獵人',
    description: '擊殺 100 個敵人',
    icon: '🎯',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalEnemiesKilled', threshold: 100 },
    reward: { type: 'gold', amount: 500 },
  },
  {
    id: 'skilled_hunter',
    name: '熟練獵人',
    description: '擊殺 1,000 個敵人',
    icon: '🏹',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalEnemiesKilled', threshold: 1000 },
    reward: { type: 'gold', amount: 2000 },
  },
  {
    id: 'master_hunter',
    name: '大師獵人',
    description: '擊殺 10,000 個敵人',
    icon: '⚔️',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalEnemiesKilled', threshold: 10000 },
    reward: { type: 'skill_points', amount: 5 },
  },
  {
    id: 'boss_slayer',
    name: 'Boss 殺手',
    description: '擊殺第一個 Boss',
    icon: '👑',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalBossesKilled', threshold: 1 },
    reward: { type: 'gold', amount: 1000 },
  },
  {
    id: 'boss_hunter',
    name: 'Boss 獵人',
    description: '擊殺 10 個 Boss',
    icon: '🏆',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalBossesKilled', threshold: 10 },
    reward: { type: 'skill_points', amount: 3 },
  },
  {
    id: 'kill_streak_10',
    name: '連殺達人',
    description: '達成 10 連殺',
    icon: '🔥',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'longestKillStreak', threshold: 10 },
    reward: { type: 'gold', amount: 300 },
  },
  {
    id: 'kill_streak_50',
    name: '連殺大師',
    description: '達成 50 連殺',
    icon: '💥',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'longestKillStreak', threshold: 50 },
    reward: { type: 'gold', amount: 1500 },
  },
  {
    id: 'kill_streak_100',
    name: '無敵殺神',
    description: '達成 100 連殺',
    icon: '⚡',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'longestKillStreak', threshold: 100 },
    reward: { type: 'skill_points', amount: 5 },
  },
  {
    id: 'first_crit',
    name: '致命一擊',
    description: '造成第一次暴擊',
    icon: '💢',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalCriticalHits', threshold: 1 },
    reward: { type: 'gold', amount: 100 },
  },
  {
    id: 'crit_master',
    name: '暴擊大師',
    description: '造成 1,000 次暴擊',
    icon: '☄️',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalCriticalHits', threshold: 1000 },
    reward: { type: 'gold', amount: 3000 },
  },
  {
    id: 'damage_dealer',
    name: '傷害輸出者',
    description: '累計造成 100,000 傷害',
    icon: '💪',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalDamageDealt', threshold: 100000 },
    reward: { type: 'gold', amount: 2000 },
  },
  {
    id: 'mega_damage',
    name: '超級傷害',
    description: '累計造成 1,000,000 傷害',
    icon: '🌟',
    category: 'combat',
    condition: { type: 'stat_threshold', stat: 'totalDamageDealt', threshold: 1000000 },
    reward: { type: 'skill_points', amount: 5 },
  },

  // ========== PROGRESSION ACHIEVEMENTS ==========
  {
    id: 'area_1_clear',
    name: '平原征服者',
    description: '通關新手平原',
    icon: '🌾',
    category: 'progression',
    condition: { type: 'area_clear', threshold: 1, areaId: 'starter_plains' },
    reward: { type: 'gold', amount: 1000 },
  },
  {
    id: 'area_2_clear',
    name: '森林探險家',
    description: '通關陰暗森林',
    icon: '🌲',
    category: 'progression',
    condition: { type: 'area_clear', threshold: 1, areaId: 'dark_forest' },
    reward: { type: 'gold', amount: 3000 },
  },
  {
    id: 'area_3_clear',
    name: '高地勇士',
    description: '通關石壁高地',
    icon: '⛰️',
    category: 'progression',
    condition: { type: 'area_clear', threshold: 1, areaId: 'stone_highlands' },
    reward: { type: 'skill_points', amount: 5 },
  },
  {
    id: 'area_4_clear',
    name: '沼澤生還者',
    description: '通關迷霧沼澤',
    icon: '🌫️',
    category: 'progression',
    condition: { type: 'area_clear', threshold: 1, areaId: 'misty_swamp' },
    reward: { type: 'skill_points', amount: 8 },
  },
  {
    id: 'area_5_clear',
    name: '地獄征服者',
    description: '通關烈焰地獄',
    icon: '🔥',
    category: 'progression',
    condition: { type: 'area_clear', threshold: 1, areaId: 'flame_hell' },
    reward: { type: 'prestige_points', amount: 10 },
  },
  {
    id: 'first_death',
    name: '學費',
    description: '第一次死亡',
    icon: '💀',
    category: 'progression',
    condition: { type: 'stat_threshold', stat: 'totalDeaths', threshold: 1 },
    hidden: true,
  },
  {
    id: 'resilient',
    name: '堅韌不拔',
    description: '死亡 100 次',
    icon: '🦴',
    category: 'progression',
    condition: { type: 'stat_threshold', stat: 'totalDeaths', threshold: 100 },
    hidden: true,
    reward: { type: 'gold', amount: 5000 },
  },

  // ========== ECONOMY ACHIEVEMENTS ==========
  {
    id: 'first_gold',
    name: '第一桶金',
    description: '累計獲得 1,000 金幣',
    icon: '🪙',
    category: 'economy',
    condition: { type: 'stat_threshold', stat: 'totalGoldEarned', threshold: 1000 },
    reward: { type: 'gold', amount: 200 },
  },
  {
    id: 'gold_collector',
    name: '金幣收藏家',
    description: '累計獲得 100,000 金幣',
    icon: '💰',
    category: 'economy',
    condition: { type: 'stat_threshold', stat: 'totalGoldEarned', threshold: 100000 },
    reward: { type: 'gold', amount: 5000 },
  },
  {
    id: 'gold_tycoon',
    name: '黃金大亨',
    description: '累計獲得 1,000,000 金幣',
    icon: '👑',
    category: 'economy',
    condition: { type: 'stat_threshold', stat: 'totalGoldEarned', threshold: 1000000 },
    reward: { type: 'skill_points', amount: 10 },
  },

  // ========== CRAFTING ACHIEVEMENTS ==========
  {
    id: 'first_craft',
    name: '初學工匠',
    description: '製作第一個物品',
    icon: '🔨',
    category: 'crafting',
    condition: { type: 'stat_threshold', stat: 'itemsCrafted', threshold: 1 },
    reward: { type: 'gold', amount: 100 },
  },
  {
    id: 'skilled_crafter',
    name: '熟練工匠',
    description: '製作 50 個物品',
    icon: '⚒️',
    category: 'crafting',
    condition: { type: 'stat_threshold', stat: 'itemsCrafted', threshold: 50 },
    reward: { type: 'gold', amount: 1000 },
  },
  {
    id: 'master_crafter',
    name: '大師工匠',
    description: '製作 200 個物品',
    icon: '🛠️',
    category: 'crafting',
    condition: { type: 'stat_threshold', stat: 'itemsCrafted', threshold: 200 },
    reward: { type: 'skill_points', amount: 5 },
  },

  // ========== SKILLS ACHIEVEMENTS ==========
  {
    id: 'first_skill',
    name: '技能覺醒',
    description: '使用第一個技能',
    icon: '✨',
    category: 'skills',
    condition: { type: 'stat_threshold', stat: 'skillsUsed', threshold: 1 },
    reward: { type: 'gold', amount: 200 },
  },
  {
    id: 'skill_user',
    name: '技能使用者',
    description: '使用技能 100 次',
    icon: '🌟',
    category: 'skills',
    condition: { type: 'stat_threshold', stat: 'skillsUsed', threshold: 100 },
    reward: { type: 'skill_points', amount: 3 },
  },
  {
    id: 'skill_master',
    name: '技能大師',
    description: '使用技能 1,000 次',
    icon: '💫',
    category: 'skills',
    condition: { type: 'stat_threshold', stat: 'skillsUsed', threshold: 1000 },
    reward: { type: 'skill_points', amount: 10 },
  },
  {
    id: 'consumable_user',
    name: '消耗品愛好者',
    description: '使用 50 個消耗品',
    icon: '🍖',
    category: 'skills',
    condition: { type: 'stat_threshold', stat: 'consumablesUsed', threshold: 50 },
    reward: { type: 'gold', amount: 500 },
  },

  // ========== PRESTIGE ACHIEVEMENTS ==========
  {
    id: 'first_prestige',
    name: '重生',
    description: '第一次轉生',
    icon: '🔄',
    category: 'progression',
    condition: { type: 'prestige', threshold: 1 },
    reward: { type: 'prestige_points', amount: 5 },
  },
  {
    id: 'prestige_veteran',
    name: '轉生老手',
    description: '轉生 5 次',
    icon: '♻️',
    category: 'progression',
    condition: { type: 'prestige', threshold: 5 },
    reward: { type: 'prestige_points', amount: 10 },
  },
  {
    id: 'prestige_master',
    name: '輪迴大師',
    description: '轉生 10 次',
    icon: '🌀',
    category: 'progression',
    condition: { type: 'prestige', threshold: 10 },
    reward: { type: 'prestige_points', amount: 20 },
  },

  // ========== TIME ACHIEVEMENTS ==========
  {
    id: 'playtime_1h',
    name: '初來乍到',
    description: '遊戲時間達到 1 小時',
    icon: '⏰',
    category: 'progression',
    condition: { type: 'stat_threshold', stat: 'totalPlayTimeMs', threshold: 3600000 },
    reward: { type: 'gold', amount: 500 },
  },
  {
    id: 'playtime_10h',
    name: '忠實玩家',
    description: '遊戲時間達到 10 小時',
    icon: '⌛',
    category: 'progression',
    condition: { type: 'stat_threshold', stat: 'totalPlayTimeMs', threshold: 36000000 },
    reward: { type: 'skill_points', amount: 5 },
  },
  {
    id: 'playtime_100h',
    name: '無盡騎士',
    description: '遊戲時間達到 100 小時',
    icon: '🎮',
    category: 'progression',
    condition: { type: 'stat_threshold', stat: 'totalPlayTimeMs', threshold: 360000000 },
    reward: { type: 'prestige_points', amount: 20 },
  },
];

// ========== HELPER FUNCTIONS ==========

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};

export const getAchievementsByCategory = (category: AchievementCategory): Achievement[] => {
  return ACHIEVEMENTS.filter((a) => a.category === category);
};

export const CATEGORY_NAMES: Record<AchievementCategory, string> = {
  combat: '戰鬥',
  progression: '進度',
  economy: '經濟',
  gathering: '採集',
  crafting: '製作',
  skills: '技能',
};

export const CATEGORY_ICONS: Record<AchievementCategory, string> = {
  combat: '⚔️',
  progression: '📈',
  economy: '💰',
  gathering: '⛏️',
  crafting: '🔨',
  skills: '✨',
};
