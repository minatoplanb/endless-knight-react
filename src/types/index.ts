export type UpgradeType = 'hp' | 'atk' | 'def' | 'speed' | 'crit';

// Combat Style System Types
export type CombatStyle = 'melee' | 'ranged' | 'magic';

// Gathering System Types
export type ResourceType = 'ore' | 'wood' | 'fish' | 'herb';
export type WorkerType = 'miner' | 'lumberjack' | 'fisher' | 'gatherer';

// Consumables System Types
export type ConsumableType = 'food' | 'potion';
export type BuffType = 'atk' | 'def' | 'attackSpeed' | 'critChance';

export interface ConsumableStack {
  consumableId: string;
  amount: number;
}

export interface ActiveBuff {
  id: string;
  buffType: BuffType;
  multiplier: number;
  expiresAt: number;
  sourceId: string;
}

// Prestige System Types
export interface PrestigeState {
  prestigePoints: number;
  totalPrestigePoints: number; // Lifetime earned
  prestigeCount: number; // Number of times prestiged
  upgrades: Record<string, number>; // upgrade id -> level
}

// Skills System Types
export type SkillId = 'power_strike' | 'heal' | 'shield' | 'berserk' | 'critical_eye' | 'gold_rush';

export interface SkillState {
  unlockedSkills: Record<SkillId, number>; // skill id -> level (0 = not unlocked)
  cooldowns: Record<SkillId, number>; // skill id -> cooldown end timestamp
  skillPoints: number; // Available skill points to spend
  totalSkillPointsEarned: number;
}

export interface SkillBuff {
  id: string;
  skillId: SkillId;
  type: 'defense' | 'attack_speed' | 'crit' | 'gold';
  multiplier: number; // e.g., 1.5 for +50%
  expiresAt: number;
}

export interface Worker {
  type: WorkerType;
  level: number;
  // Progress tracking for partial resource generation
  progress: number; // 0-1, accumulates until 1 = gather 1 resource
}

export interface GatheringState {
  workers: Record<WorkerType, Worker>;
  resources: Record<ResourceType, number>;
  resourceCaps: Record<ResourceType, number>;
  lastGatherTime: number; // For offline calculation
}

// Equipment System Types
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EquipmentSlotType = 'weapon' | 'helmet' | 'armor' | 'shield' | 'ring' | 'amulet';

export interface EquipmentStats {
  atk?: number;
  def?: number;
  maxHp?: number;
  attackSpeed?: number;
  critChance?: number;
  critMultiplier?: number;
}

export interface Equipment {
  id: string;
  baseId: string; // Reference to base equipment definition
  name: string;
  slot: EquipmentSlotType;
  rarity: Rarity;
  stats: EquipmentStats;
  icon: string;
  level: number; // Item level affects stats
}

export interface EquipmentSlots {
  weapon: Equipment | null;
  helmet: Equipment | null;
  armor: Equipment | null;
  shield: Equipment | null;
  ring: Equipment | null;
  amulet: Equipment | null;
}

export interface PlayerStats {
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  attackSpeed: number;
  critChance: number;
  critMultiplier: number;
}

export interface UpgradeLevels {
  hp: number;
  atk: number;
  def: number;
  speed: number;
  crit: number;
}

export interface Enemy {
  id: string;
  name: string;
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  goldDrop: number;
  combatStyle: CombatStyle;
  isBoss: boolean;
  bossTitle?: string;
  sprite: string;
}

export interface StageProgress {
  currentStage: number; // Stage within current area (1 to area.stages)
  highestStage: number; // Legacy: highest stage reached overall
  enemiesKilled: number;
  travelProgress: number; // 0-100
  isTraveling: boolean;
  currentAreaId: string; // Current area ID
}

// Area System Types (re-exported from data/areas.ts for convenience)
export interface AreaEnemy {
  id: string;
  name: string;
  sprite: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  goldMultiplier: number;
  weight: number;
  combatStyle: CombatStyle;
}

export interface AreaUnlockCondition {
  type: 'clear_area' | 'none';
  areaId?: string;
}

export interface Area {
  id: string;
  name: string;
  description: string;
  background: string;
  requiredLevel: number;
  stages: number;
  enemies: AreaEnemy[];
  unlockCondition: AreaUnlockCondition;
}

export interface AreaProgress {
  currentStage: number; // Current stage in this area (1 to area.stages)
  highestStage: number; // Highest stage reached in this area
  cleared: boolean; // Has this area been fully cleared
}

export interface DamagePopup {
  id: string;
  value: number;
  isCrit: boolean;
  isPlayerDamage: boolean;
  timestamp: number;
}

// Statistics tracking
export interface GameStatistics {
  totalEnemiesKilled: number;
  totalBossesKilled: number;
  totalDeaths: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalCriticalHits: number;
  totalGoldEarned: number;
  totalPlayTimeMs: number;
  highestDamageDealt: number;
  longestKillStreak: number;
  currentKillStreak: number;
  itemsCrafted: number;
  consumablesUsed: number;
  skillsUsed: number;
}

export interface GameState {
  // Player
  player: PlayerStats;
  upgrades: UpgradeLevels;
  gold: number;
  totalGoldEarned: number;
  combatStyle: CombatStyle;

  // Equipment
  equipment: EquipmentSlots;
  inventory: Equipment[];
  pendingLoot: Equipment | null; // Equipment waiting to be shown in loot modal
  backpackLevel: number;

  // Stage and Area
  stage: StageProgress;
  currentEnemy: Enemy | null;
  unlockedAreas: string[]; // Array of unlocked area IDs
  areaProgress: Record<string, AreaProgress>; // Progress per area

  // Gathering System
  gathering: GatheringState;

  // Consumables System
  consumables: ConsumableStack[];
  activeBuffs: ActiveBuff[];

  // Prestige System
  prestige: PrestigeState;

  // Skills System
  skills: SkillState;
  skillBuffs: SkillBuff[];

  // Statistics
  statistics: GameStatistics;

  // Achievements
  unlockedAchievements: string[]; // Array of achievement IDs that have been unlocked
  pendingAchievement: string | null; // Achievement ID to show in notification

  // UI State
  damagePopups: DamagePopup[];
  isPlayerDead: boolean;
  showDeathModal: boolean;
  showOfflineModal: boolean;
  showLootModal: boolean;
  offlineReward: number;

  // Offline gathering reward (separate from gold)
  offlineGathering: Record<ResourceType, number> | null;

  // Time tracking
  lastSaveTime: number;
  lastOnlineTime: number;

  // Engine state
  isRunning: boolean;
}

export interface GameActions {
  // Game flow
  tick: () => void;
  startGame: () => void;
  stopGame: () => void;
  resetAfterDeath: () => void;

  // Combat
  playerAttack: () => void;
  enemyAttack: () => void;
  spawnEnemy: () => void;
  killEnemy: () => void;
  playerDie: () => void;

  // Combat Style
  setCombatStyle: (style: CombatStyle) => void;

  // Area System
  changeArea: (areaId: string) => void;
  unlockArea: (areaId: string) => void;
  getCurrentArea: () => Area | undefined;

  // Upgrades
  buyUpgrade: (type: UpgradeType) => boolean;
  getUpgradeCost: (type: UpgradeType) => number;
  recalculateStats: () => void;

  // Equipment
  equipItem: (item: Equipment) => void;
  unequipItem: (slot: EquipmentSlotType) => void;
  addToInventory: (item: Equipment) => void;
  removeFromInventory: (itemId: string) => void;
  getEquipmentBonus: () => EquipmentStats;
  setShowLootModal: (show: boolean) => void;
  dismissLootToast: () => void;
  collectLoot: () => void;
  discardLoot: () => void;

  // Backpack upgrade
  buyBackpackUpgrade: () => boolean;
  getBackpackCapacity: () => number;
  getBackpackUpgradeCost: () => number;

  // Gathering System
  tickGathering: () => void;
  upgradeWorker: (workerType: WorkerType) => boolean;
  getWorkerUpgradeCost: (workerType: WorkerType) => number;
  collectOfflineGathering: () => void;
  dismissOfflineGathering: () => void;

  // Crafting System
  craftItem: (recipeId: string) => boolean;

  // Consumables System
  addConsumable: (consumableId: string, amount: number) => void;
  useConsumable: (consumableId: string) => boolean;
  tickBuffs: () => void;
  getBuffMultiplier: (buffType: BuffType) => number;

  // Prestige System
  canPrestige: () => boolean;
  getPrestigePointsPreview: () => number;
  doPrestige: () => boolean;
  buyPrestigeUpgrade: (upgradeId: string) => boolean;
  getPrestigeUpgradeCost: (upgradeId: string) => number;
  getPrestigeBonus: (effectType: string) => number;

  // Skills System
  useSkill: (skillId: SkillId) => boolean;
  upgradeSkill: (skillId: SkillId) => boolean;
  isSkillReady: (skillId: SkillId) => boolean;
  getSkillCooldownRemaining: (skillId: SkillId) => number;
  tickSkillBuffs: () => void;
  getSkillBuffMultiplier: (buffType: 'defense' | 'attack_speed' | 'crit' | 'gold') => number;
  addSkillPoints: (amount: number) => void;

  // Damage popups
  addDamagePopup: (popup: Omit<DamagePopup, 'id' | 'timestamp'>) => void;
  removeDamagePopup: (id: string) => void;

  // UI
  setShowDeathModal: (show: boolean) => void;
  setShowOfflineModal: (show: boolean) => void;

  // Achievements
  checkAchievements: () => void;
  dismissAchievement: () => void;

  // Save/Load
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  calculateOfflineReward: () => void;
}

export type GameStore = GameState & GameActions;

export interface SaveData {
  version: string;
  player: PlayerStats;
  upgrades: UpgradeLevels;
  gold: number;
  totalGoldEarned: number;
  stage: StageProgress;
  lastOnlineTime: number;
  // Equipment (added in v0.2.0)
  equipment?: EquipmentSlots;
  inventory?: Equipment[];
  // Backpack upgrade (added in v0.3.0)
  backpackLevel?: number;
  // Area system (added in v0.4.0)
  unlockedAreas?: string[];
  areaProgress?: Record<string, AreaProgress>;
  // Gathering system (added in v0.5.0)
  gathering?: GatheringState;
  // Combat style (added in v0.6.0)
  combatStyle?: CombatStyle;
  // Consumables (added in v0.7.0)
  consumables?: ConsumableStack[];
  activeBuffs?: ActiveBuff[];
  // Prestige (added in v0.8.0)
  prestige?: PrestigeState;
  // Skills (added in v0.9.0)
  skills?: SkillState;
  skillBuffs?: SkillBuff[];
  // Statistics (added in v1.0.0)
  statistics?: GameStatistics;
  // Achievements (added in v1.1.0)
  unlockedAchievements?: string[];
}
