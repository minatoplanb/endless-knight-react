// Affix System - Crafting-only special effects
// These affixes can only be obtained through crafting, not from drops

import { AffixType, ResourceType } from '../types';

export interface AffixDefinition {
  id: AffixType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  isCraftOnly: boolean;
}

export const AFFIX_DEFINITIONS: Record<AffixType, AffixDefinition> = {
  gathering_boost: {
    id: 'gathering_boost',
    name: '採集加速',
    nameEn: 'Gathering Boost',
    description: '採集速度 +{value}%',
    descriptionEn: 'Gathering speed +{value}%',
    isCraftOnly: true,
  },
  gold_find: {
    id: 'gold_find',
    name: '金幣獵人',
    nameEn: 'Gold Find',
    description: '金幣掉落 +{value}%',
    descriptionEn: 'Gold drops +{value}%',
    isCraftOnly: true,
  },
  life_steal: {
    id: 'life_steal',
    name: '生命汲取',
    nameEn: 'Life Steal',
    description: '攻擊回復 {value}% 傷害為 HP',
    descriptionEn: 'Heal {value}% of damage dealt',
    isCraftOnly: true,
  },
  thorns: {
    id: 'thorns',
    name: '荊棘',
    nameEn: 'Thorns',
    description: '受擊反彈 {value}% 傷害',
    descriptionEn: 'Reflect {value}% of damage taken',
    isCraftOnly: true,
  },
  boss_slayer: {
    id: 'boss_slayer',
    name: '屠龍者',
    nameEn: 'Boss Slayer',
    description: '對 Boss +{value}% 傷害',
    descriptionEn: '+{value}% damage to Bosses',
    isCraftOnly: true,
  },
  resource_saver: {
    id: 'resource_saver',
    name: '節約大師',
    nameEn: 'Resource Saver',
    description: '製作時 {value}% 機率不消耗資源',
    descriptionEn: '{value}% chance to save resources when crafting',
    isCraftOnly: true,
  },
};

// Get affix definition by type
export const getAffixDefinition = (type: AffixType): AffixDefinition => {
  return AFFIX_DEFINITIONS[type];
};

// Format affix description with value
export const formatAffixDescription = (
  type: AffixType,
  value: number,
  locale: 'zh' | 'en' = 'zh'
): string => {
  const def = AFFIX_DEFINITIONS[type];
  const template = locale === 'en' ? def.descriptionEn : def.description;
  return template.replace('{value}', Math.round(value * 100).toString());
};

// Get affix name by locale
export const getAffixName = (type: AffixType, locale: 'zh' | 'en' = 'zh'): string => {
  const def = AFFIX_DEFINITIONS[type];
  return locale === 'en' ? def.nameEn : def.name;
};

// Resource type to display name mapping
export const RESOURCE_NAMES: Record<ResourceType, { zh: string; en: string }> = {
  ore: { zh: '礦石', en: 'Ore' },
  wood: { zh: '木材', en: 'Wood' },
  fish: { zh: '魚獲', en: 'Fish' },
  herb: { zh: '草藥', en: 'Herbs' },
};
