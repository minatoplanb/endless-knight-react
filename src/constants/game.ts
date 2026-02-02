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

// Enemy scaling
export const ENEMY_SCALING = {
  hpBase: 30,
  hpMultiplier: 1.15,
  atkBase: 5,
  atkMultiplier: 1.08,
  goldBase: 10,
  goldMultiplier: 1.1,
};

// Upgrade costs and effects
export const UPGRADE_BASE_COST = 50; // Reduced from 100
export const UPGRADE_COST_MULTIPLIER = 1.35; // Reduced from 1.5 for smoother progression

export const UPGRADE_EFFECTS = {
  hp: { perLevel: 15, stat: 'maxHp' as const },
  atk: { perLevel: 5, stat: 'atk' as const },
  def: { perLevel: 3, stat: 'def' as const },
  speed: { perLevel: 0.05, stat: 'attackSpeed' as const },
  crit: { perLevel: 0.005, stat: 'critChance' as const },
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
