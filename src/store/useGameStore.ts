import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameStore,
  GameState,
  UpgradeType,
  Enemy,
  DamagePopup,
  SaveData,
} from '../types';
import {
  PLAYER_BASE,
  UPGRADE_BASE_COST,
  UPGRADE_COST_MULTIPLIER,
  UPGRADE_EFFECTS,
  ENEMY_SCALING,
  STAGE,
  OFFLINE,
  TICK_INTERVAL,
  SAVE_KEY,
} from '../constants/game';

const generateId = () => Math.random().toString(36).substring(2, 9);

const createEnemy = (stage: number): Enemy => {
  const stageMultiplier = stage - 1;
  return {
    id: generateId(),
    name: `Enemy Lv.${stage}`,
    maxHp: Math.floor(ENEMY_SCALING.hpBase * Math.pow(ENEMY_SCALING.hpMultiplier, stageMultiplier)),
    currentHp: Math.floor(ENEMY_SCALING.hpBase * Math.pow(ENEMY_SCALING.hpMultiplier, stageMultiplier)),
    atk: Math.floor(ENEMY_SCALING.atkBase * Math.pow(ENEMY_SCALING.atkMultiplier, stageMultiplier)),
    goldDrop: Math.floor(ENEMY_SCALING.goldBase * Math.pow(ENEMY_SCALING.goldMultiplier, stageMultiplier)),
  };
};

const initialState: GameState = {
  player: {
    ...PLAYER_BASE,
    currentHp: PLAYER_BASE.maxHp,
  },
  upgrades: {
    hp: 0,
    atk: 0,
    def: 0,
    speed: 0,
    crit: 0,
  },
  gold: 0,
  totalGoldEarned: 0,
  stage: {
    currentStage: 1,
    highestStage: 1,
    enemiesKilled: 0,
    travelProgress: 0,
    isTraveling: true,
  },
  currentEnemy: null,
  damagePopups: [],
  isPlayerDead: false,
  showDeathModal: false,
  showOfflineModal: false,
  offlineReward: 0,
  lastSaveTime: Date.now(),
  lastOnlineTime: Date.now(),
  isRunning: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Game flow
  tick: () => {
    const state = get();
    if (!state.isRunning || state.isPlayerDead) return;

    if (state.stage.isTraveling) {
      // Traveling to next enemy
      const progressPerTick = (TICK_INTERVAL / STAGE.travelTime) * 100;
      const newProgress = state.stage.travelProgress + progressPerTick;

      if (newProgress >= 100) {
        // Arrived at enemy
        set({
          stage: {
            ...state.stage,
            travelProgress: 100,
            isTraveling: false,
          },
          currentEnemy: createEnemy(state.stage.currentStage),
        });
      } else {
        set({
          stage: {
            ...state.stage,
            travelProgress: newProgress,
          },
        });
      }
    } else if (state.currentEnemy) {
      // In combat
      get().playerAttack();
      if (get().currentEnemy) {
        get().enemyAttack();
      }
    }
  },

  startGame: () => {
    set({ isRunning: true });
  },

  stopGame: () => {
    set({ isRunning: false });
  },

  resetAfterDeath: () => {
    const state = get();
    const resetStage = Math.max(1, state.stage.highestStage - 5);

    set({
      player: {
        ...state.player,
        currentHp: state.player.maxHp,
      },
      stage: {
        ...state.stage,
        currentStage: resetStage,
        enemiesKilled: 0,
        travelProgress: 0,
        isTraveling: true,
      },
      currentEnemy: null,
      isPlayerDead: false,
      showDeathModal: false,
    });
  },

  // Combat
  playerAttack: () => {
    const state = get();
    if (!state.currentEnemy || state.isPlayerDead) return;

    const attackChance = state.player.attackSpeed * (TICK_INTERVAL / 1000);
    if (Math.random() > attackChance) return;

    const isCrit = Math.random() < state.player.critChance;
    let damage = Math.max(1, state.player.atk - Math.floor(state.currentEnemy.atk * 0.1));
    if (isCrit) {
      damage = Math.floor(damage * state.player.critMultiplier);
    }

    const newEnemyHp = state.currentEnemy.currentHp - damage;

    get().addDamagePopup({
      value: damage,
      isCrit,
      isPlayerDamage: false,
    });

    if (newEnemyHp <= 0) {
      get().killEnemy();
    } else {
      set({
        currentEnemy: {
          ...state.currentEnemy,
          currentHp: newEnemyHp,
        },
      });
    }
  },

  enemyAttack: () => {
    const state = get();
    if (!state.currentEnemy || state.isPlayerDead) return;

    const attackChance = 1 * (TICK_INTERVAL / 1000); // Enemy attacks once per second
    if (Math.random() > attackChance) return;

    const damage = Math.max(1, state.currentEnemy.atk - state.player.def);
    const newPlayerHp = state.player.currentHp - damage;

    get().addDamagePopup({
      value: damage,
      isCrit: false,
      isPlayerDamage: true,
    });

    if (newPlayerHp <= 0) {
      get().playerDie();
    } else {
      set({
        player: {
          ...state.player,
          currentHp: newPlayerHp,
        },
      });
    }
  },

  spawnEnemy: () => {
    const state = get();
    set({
      currentEnemy: createEnemy(state.stage.currentStage),
      stage: {
        ...state.stage,
        isTraveling: false,
        travelProgress: 100,
      },
    });
  },

  killEnemy: () => {
    const state = get();
    if (!state.currentEnemy) return;

    const goldEarned = state.currentEnemy.goldDrop;
    const newEnemiesKilled = state.stage.enemiesKilled + 1;

    let newStage = state.stage.currentStage;
    if (newEnemiesKilled >= STAGE.enemiesPerStage) {
      newStage++;
    }

    set({
      gold: state.gold + goldEarned,
      totalGoldEarned: state.totalGoldEarned + goldEarned,
      currentEnemy: null,
      stage: {
        ...state.stage,
        currentStage: newStage,
        highestStage: Math.max(state.stage.highestStage, newStage),
        enemiesKilled: newEnemiesKilled >= STAGE.enemiesPerStage ? 0 : newEnemiesKilled,
        travelProgress: 0,
        isTraveling: true,
      },
    });
  },

  playerDie: () => {
    const state = get();

    // Set player as dead briefly
    set({
      player: {
        ...state.player,
        currentHp: 0,
      },
      isPlayerDead: true,
    });

    // Auto-revive after 1 second - go back to previous stage (minimum stage 1)
    setTimeout(() => {
      const currentState = get();
      const newStage = Math.max(1, currentState.stage.currentStage - 1);

      set({
        player: {
          ...currentState.player,
          currentHp: currentState.player.maxHp,
        },
        stage: {
          ...currentState.stage,
          currentStage: newStage,
          enemiesKilled: 0,
          travelProgress: 0,
          isTraveling: true,
        },
        currentEnemy: null,
        isPlayerDead: false,
      });
    }, 1000);
  },

  // Upgrades
  buyUpgrade: (type: UpgradeType) => {
    const state = get();
    const cost = get().getUpgradeCost(type);

    if (state.gold < cost) return false;

    set({
      gold: state.gold - cost,
      upgrades: {
        ...state.upgrades,
        [type]: state.upgrades[type] + 1,
      },
    });

    get().recalculateStats();
    return true;
  },

  getUpgradeCost: (type: UpgradeType) => {
    const level = get().upgrades[type];
    return Math.floor(UPGRADE_BASE_COST * Math.pow(UPGRADE_COST_MULTIPLIER, level));
  },

  recalculateStats: () => {
    const state = get();
    const upgrades = state.upgrades;

    const maxHp = PLAYER_BASE.maxHp + upgrades.hp * UPGRADE_EFFECTS.hp.perLevel;
    const atk = PLAYER_BASE.atk + upgrades.atk * UPGRADE_EFFECTS.atk.perLevel;
    const def = PLAYER_BASE.def + upgrades.def * UPGRADE_EFFECTS.def.perLevel;
    const attackSpeed = PLAYER_BASE.attackSpeed + upgrades.speed * UPGRADE_EFFECTS.speed.perLevel;
    const critChance = PLAYER_BASE.critChance + upgrades.crit * UPGRADE_EFFECTS.crit.perLevel;

    const hpRatio = state.player.currentHp / state.player.maxHp;

    set({
      player: {
        ...state.player,
        maxHp,
        currentHp: Math.floor(maxHp * hpRatio),
        atk,
        def,
        attackSpeed,
        critChance,
      },
    });
  },

  // Damage popups
  addDamagePopup: (popup) => {
    const state = get();
    const newPopup: DamagePopup = {
      ...popup,
      id: generateId(),
      timestamp: Date.now(),
    };

    set({
      damagePopups: [...state.damagePopups, newPopup],
    });

    // Auto-remove after 1 second
    setTimeout(() => {
      get().removeDamagePopup(newPopup.id);
    }, 1000);
  },

  removeDamagePopup: (id) => {
    set({
      damagePopups: get().damagePopups.filter((p) => p.id !== id),
    });
  },

  // UI
  setShowDeathModal: (show) => {
    set({ showDeathModal: show });
  },

  setShowOfflineModal: (show) => {
    set({ showOfflineModal: show });
  },

  // Save/Load
  saveGame: async () => {
    const state = get();
    const saveData: SaveData = {
      version: '0.1.0',
      player: state.player,
      upgrades: state.upgrades,
      gold: state.gold,
      totalGoldEarned: state.totalGoldEarned,
      stage: state.stage,
      lastOnlineTime: Date.now(),
    };

    try {
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      set({ lastSaveTime: Date.now(), lastOnlineTime: Date.now() });
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },

  loadGame: async () => {
    try {
      const savedData = await AsyncStorage.getItem(SAVE_KEY);
      if (!savedData) return;

      const data: SaveData = JSON.parse(savedData);

      set({
        player: data.player,
        upgrades: data.upgrades,
        gold: data.gold,
        totalGoldEarned: data.totalGoldEarned,
        stage: {
          ...data.stage,
          travelProgress: 0,
          isTraveling: true,
        },
        currentEnemy: null,
        lastOnlineTime: data.lastOnlineTime,
      });

      get().calculateOfflineReward();
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  },

  calculateOfflineReward: () => {
    const state = get();
    const offlineSeconds = (Date.now() - state.lastOnlineTime) / 1000;

    if (offlineSeconds < OFFLINE.minOfflineSeconds) {
      set({ offlineReward: 0 });
      return;
    }

    const cappedSeconds = Math.min(offlineSeconds, OFFLINE.maxHours * 3600);
    const stage = state.stage.currentStage;
    const goldPerEnemy = Math.floor(ENEMY_SCALING.goldBase * Math.pow(ENEMY_SCALING.goldMultiplier, stage - 1));
    const enemiesPerSecond = 0.5; // Approximate kills per second
    const offlineGold = Math.floor(goldPerEnemy * enemiesPerSecond * cappedSeconds * OFFLINE.efficiency);

    if (offlineGold > 0) {
      set({
        offlineReward: offlineGold,
        showOfflineModal: true,
      });
    }
  },
}));
