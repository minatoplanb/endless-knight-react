// Combat Style System - Rock-Paper-Scissors combat triangle
// Melee > Ranged > Magic > Melee

export type CombatStyle = 'melee' | 'ranged' | 'magic';

export interface CombatStyleInfo {
  id: CombatStyle;
  name: string;
  icon: string;
  description: string;
  color: string;
}

// Combat style definitions
export const COMBAT_STYLES: Record<CombatStyle, CombatStyleInfo> = {
  melee: {
    id: 'melee',
    name: '近戰',
    icon: '⚔️',
    description: '劍與盾的戰士，剋制遠程',
    color: '#ff6b6b',
  },
  ranged: {
    id: 'ranged',
    name: '遠程',
    icon: '🏹',
    description: '弓箭手與獵人，剋制魔法',
    color: '#4ecdc4',
  },
  magic: {
    id: 'magic',
    name: '魔法',
    icon: '✨',
    description: '法師與術士，剋制近戰',
    color: '#a855f7',
  },
};

// Damage multiplier when attacker has advantage (more impactful!)
export const ADVANTAGE_MULTIPLIER = 2.0;

// Damage multiplier when defender has advantage (attacker at disadvantage)
export const DISADVANTAGE_MULTIPLIER = 2.0;

// Player sprite tint colors for each combat style
export const COMBAT_STYLE_TINTS = {
  melee: '#ff6b6b',   // Red tint for melee
  ranged: '#4ecdc4',  // Teal tint for ranged
  magic: '#a855f7',   // Purple tint for magic
};

// Combat triangle relationships
// Key = attacker style, Value = style that attacker beats
const BEATS: Record<CombatStyle, CombatStyle> = {
  melee: 'ranged',   // Melee beats Ranged
  ranged: 'magic',   // Ranged beats Magic
  magic: 'melee',    // Magic beats Melee
};

// Get the style that this style beats
export const getBeats = (style: CombatStyle): CombatStyle => BEATS[style];

// Get the style that beats this style
export const getBeatenBy = (style: CombatStyle): CombatStyle => {
  for (const [attacker, defender] of Object.entries(BEATS)) {
    if (defender === style) {
      return attacker as CombatStyle;
    }
  }
  return style; // Fallback (shouldn't happen)
};

// Check if attacker has advantage over defender
export const hasAdvantage = (attacker: CombatStyle, defender: CombatStyle): boolean => {
  return BEATS[attacker] === defender;
};

// Calculate damage multiplier based on combat styles
export const getCombatMultiplier = (
  attackerStyle: CombatStyle,
  defenderStyle: CombatStyle
): number => {
  if (attackerStyle === defenderStyle) {
    return 1.0; // Neutral
  }

  if (hasAdvantage(attackerStyle, defenderStyle)) {
    return ADVANTAGE_MULTIPLIER; // Attacker has advantage
  }

  // Defender has advantage (attacker takes more damage when attacking)
  // This is used for damage dealt TO the attacker
  return 1.0; // No penalty for dealing damage, but will take more
};

// Get the damage multiplier for damage received
export const getDefenseMultiplier = (
  defenderStyle: CombatStyle,
  attackerStyle: CombatStyle
): number => {
  if (attackerStyle === defenderStyle) {
    return 1.0; // Neutral
  }

  if (hasAdvantage(attackerStyle, defenderStyle)) {
    return DISADVANTAGE_MULTIPLIER; // Defender takes more damage
  }

  // Defender has advantage, takes normal damage
  return 1.0;
};

// Get all combat styles as an array
export const ALL_COMBAT_STYLES: CombatStyle[] = ['melee', 'ranged', 'magic'];

// Get combat style info
export const getStyleInfo = (style: CombatStyle): CombatStyleInfo => COMBAT_STYLES[style];
