// Skills System - Active abilities for combat

export type SkillId = 'power_strike' | 'heal' | 'shield' | 'berserk' | 'critical_eye' | 'gold_rush';

export type SkillEffectType =
  | 'instant_damage'
  | 'instant_heal'
  | 'buff_defense'
  | 'buff_attack_speed'
  | 'buff_crit'
  | 'buff_gold';

export interface SkillEffect {
  type: SkillEffectType;
  value: number; // Base value (scales with skill level)
  duration?: number; // Duration in ms for buffs
}

export interface Skill {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  // Cooldown in milliseconds
  cooldown: number;
  // Cost to unlock (skill points)
  unlockCost: number;
  // Cost to upgrade per level
  upgradeCost: number;
  // Max level
  maxLevel: number;
  // Effect at level 1
  baseEffect: SkillEffect;
  // Effect increase per level
  effectPerLevel: number;
}

// ========== SKILL DEFINITIONS ==========

export const SKILLS: Record<SkillId, Skill> = {
  power_strike: {
    id: 'power_strike',
    name: '強力一擊',
    description: '對敵人造成大量傷害',
    icon: '⚔️',
    cooldown: 10000, // 10 seconds
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 10,
    baseEffect: {
      type: 'instant_damage',
      value: 50, // Base damage
    },
    effectPerLevel: 25, // +25 damage per level
  },

  heal: {
    id: 'heal',
    name: '治療術',
    description: '恢復自身生命值',
    icon: '💚',
    cooldown: 15000, // 15 seconds
    unlockCost: 1,
    upgradeCost: 1,
    maxLevel: 10,
    baseEffect: {
      type: 'instant_heal',
      value: 30, // Base heal
    },
    effectPerLevel: 15, // +15 heal per level
  },

  shield: {
    id: 'shield',
    name: '護盾',
    description: '短時間內減少受到的傷害',
    icon: '🛡️',
    cooldown: 20000, // 20 seconds
    unlockCost: 2,
    upgradeCost: 1,
    maxLevel: 5,
    baseEffect: {
      type: 'buff_defense',
      value: 50, // +50% defense
      duration: 5000, // 5 seconds
    },
    effectPerLevel: 10, // +10% defense per level
  },

  berserk: {
    id: 'berserk',
    name: '狂暴',
    description: '大幅提升攻擊速度',
    icon: '🔥',
    cooldown: 25000, // 25 seconds
    unlockCost: 2,
    upgradeCost: 1,
    maxLevel: 5,
    baseEffect: {
      type: 'buff_attack_speed',
      value: 50, // +50% attack speed
      duration: 8000, // 8 seconds
    },
    effectPerLevel: 10, // +10% per level
  },

  critical_eye: {
    id: 'critical_eye',
    name: '鷹眼',
    description: '提高暴擊率',
    icon: '👁️',
    cooldown: 20000, // 20 seconds
    unlockCost: 2,
    upgradeCost: 1,
    maxLevel: 5,
    baseEffect: {
      type: 'buff_crit',
      value: 30, // +30% crit chance
      duration: 10000, // 10 seconds
    },
    effectPerLevel: 5, // +5% per level
  },

  gold_rush: {
    id: 'gold_rush',
    name: '黃金時刻',
    description: '短時間內獲得更多金幣',
    icon: '💰',
    cooldown: 30000, // 30 seconds
    unlockCost: 3,
    upgradeCost: 2,
    maxLevel: 5,
    baseEffect: {
      type: 'buff_gold',
      value: 100, // +100% gold
      duration: 15000, // 15 seconds
    },
    effectPerLevel: 25, // +25% per level
  },
};

// ========== HELPER FUNCTIONS ==========

export const getSkillById = (id: SkillId): Skill => SKILLS[id];

export const ALL_SKILL_IDS: SkillId[] = [
  'power_strike',
  'heal',
  'shield',
  'berserk',
  'critical_eye',
  'gold_rush',
];

// Calculate skill effect value at a given level
export const getSkillEffectValue = (skill: Skill, level: number): number => {
  if (level <= 0) return 0;
  return skill.baseEffect.value + (level - 1) * skill.effectPerLevel;
};

// Calculate total cost to unlock and upgrade to a level
export const getSkillUpgradeCost = (skill: Skill, currentLevel: number): number => {
  if (currentLevel === 0) {
    return skill.unlockCost;
  }
  return skill.upgradeCost;
};

// Get skill description with current effect values
export const getSkillDescription = (skill: Skill, level: number): string => {
  const value = getSkillEffectValue(skill, Math.max(1, level));
  const duration = skill.baseEffect.duration ? skill.baseEffect.duration / 1000 : 0;

  switch (skill.baseEffect.type) {
    case 'instant_damage':
      return `造成 ${value} 點傷害`;
    case 'instant_heal':
      return `恢復 ${value} HP`;
    case 'buff_defense':
      return `防禦 +${value}% (${duration}秒)`;
    case 'buff_attack_speed':
      return `攻速 +${value}% (${duration}秒)`;
    case 'buff_crit':
      return `暴擊 +${value}% (${duration}秒)`;
    case 'buff_gold':
      return `金幣 +${value}% (${duration}秒)`;
    default:
      return skill.description;
  }
};
