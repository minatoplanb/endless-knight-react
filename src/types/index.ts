export type UpgradeType = 'hp' | 'atk' | 'def' | 'speed' | 'crit';

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
  goldDrop: number;
}

export interface StageProgress {
  currentStage: number;
  highestStage: number;
  enemiesKilled: number;
  travelProgress: number; // 0-100
  isTraveling: boolean;
}

export interface DamagePopup {
  id: string;
  value: number;
  isCrit: boolean;
  isPlayerDamage: boolean;
  timestamp: number;
}

export interface GameState {
  // Player
  player: PlayerStats;
  upgrades: UpgradeLevels;
  gold: number;
  totalGoldEarned: number;

  // Equipment
  equipment: EquipmentSlots;
  inventory: Equipment[];
  pendingLoot: Equipment | null; // Equipment waiting to be shown in loot modal
  backpackLevel: number;

  // Stage
  stage: StageProgress;
  currentEnemy: Enemy | null;

  // UI State
  damagePopups: DamagePopup[];
  isPlayerDead: boolean;
  showDeathModal: boolean;
  showOfflineModal: boolean;
  showLootModal: boolean;
  offlineReward: number;

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

  // Damage popups
  addDamagePopup: (popup: Omit<DamagePopup, 'id' | 'timestamp'>) => void;
  removeDamagePopup: (id: string) => void;

  // UI
  setShowDeathModal: (show: boolean) => void;
  setShowOfflineModal: (show: boolean) => void;

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
}
