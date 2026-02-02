// Game tick interval (ms)
export const TICK_INTERVAL = 100;

// Player base stats
export const PLAYER_BASE = {
  maxHp: 100,
  atk: 10,
  def: 0,
  attackSpeed: 1.0, // attacks per second
  critChance: 0.05,
  critMultiplier: 2.0,
};

// Stage progression
export const STAGE = {
  travelTime: 2000, // ms to reach next enemy
  enemiesPerStage: 10,
};

// Enemy scaling - enemies get tougher faster
export const ENEMY_SCALING = {
  hpBase: 40,
  hpMultiplier: 1.08, // Compounds over 100 stages per area
  atkBase: 8,
  atkMultiplier: 1.05,
  goldBase: 10,
  goldMultiplier: 1.05,
};

// Upgrade costs and effects
// Balanced for slower progression - upgrades should feel meaningful
export const UPGRADE_BASE_COST = 100;
export const UPGRADE_COST_MULTIPLIER = 1.5;

export const UPGRADE_EFFECTS = {
  hp: { perLevel: 10, stat: 'maxHp' as const },
  atk: { perLevel: 3, stat: 'atk' as const },
  def: { perLevel: 2, stat: 'def' as const },
  speed: { perLevel: 0.03, stat: 'attackSpeed' as const },
  crit: { perLevel: 0.003, stat: 'critChance' as const },
};

// Offline rewards
export const OFFLINE = {
  maxHours: 8,
  efficiency: 0.5, // 50% of online efficiency
  minOfflineSeconds: 60, // minimum 1 minute to get rewards
};

// Save
export const SAVE_INTERVAL = 30000; // 30 seconds
export const SAVE_KEY = '@endless_knight_save';
