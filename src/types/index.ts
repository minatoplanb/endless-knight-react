export type UpgradeType = 'hp' | 'atk' | 'def' | 'speed' | 'crit';

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

  // Stage
  stage: StageProgress;
  currentEnemy: Enemy | null;

  // UI State
  damagePopups: DamagePopup[];
  isPlayerDead: boolean;
  showDeathModal: boolean;
  showOfflineModal: boolean;
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
}
