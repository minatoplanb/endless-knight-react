import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GameStore,
  GameState,
  UpgradeType,
  Enemy,
  DamagePopup,
  SaveData,
  Equipment,
  EquipmentSlotType,
  EquipmentStats,
  EquipmentSlots,
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
import { LootSystem } from '../engine/LootSystem';
import {
  BACKPACK_BASE_CAPACITY,
  BACKPACK_CAPACITY_PER_LEVEL,
  BACKPACK_MAX_LEVEL,
  BACKPACK_UPGRADE_BASE_COST,
  BACKPACK_UPGRADE_COST_MULTIPLIER,
} from '../data/equipment';

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

const emptyEquipmentSlots: EquipmentSlots = {
  weapon: null,
  helmet: null,
  armor: null,
  shield: null,
  ring: null,
  amulet: null,
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
  equipment: { ...emptyEquipmentSlots },
  inventory: [],
  pendingLoot: null,
  backpackLevel: 0,
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
  showLootModal: false,
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
    const isBoss = newEnemiesKilled >= STAGE.enemiesPerStage;
    if (isBoss) {
      newStage++;
    }

    // Check for loot drop
    let loot: Equipment | null = null;
    if (LootSystem.shouldDropLoot(state.stage.currentStage, isBoss)) {
      loot = LootSystem.generateDrop(state.stage.currentStage, isBoss);
    }

    // Auto-collect loot
    let newInventory = [...state.inventory];
    let newEquipment = { ...state.equipment };
    let showLoot = false;

    if (loot) {
      const currentEquipped = state.equipment[loot.slot];

      // Auto-equip if it's an upgrade or slot is empty
      const backpackCapacity = get().getBackpackCapacity();
      if (LootSystem.isUpgrade(currentEquipped, loot)) {
        // Move current to inventory if exists
        if (currentEquipped) {
          newInventory.push(currentEquipped);
        }
        newEquipment[loot.slot] = loot;
      } else if (newInventory.length < backpackCapacity) {
        // Add to inventory if space available
        newInventory.push(loot);
      }
      // If inventory full and not upgrade, item is lost (no notification)

      showLoot = true;
    }

    set({
      gold: state.gold + goldEarned,
      totalGoldEarned: state.totalGoldEarned + goldEarned,
      currentEnemy: null,
      stage: {
        ...state.stage,
        currentStage: newStage,
        highestStage: Math.max(state.stage.highestStage, newStage),
        enemiesKilled: isBoss ? 0 : newEnemiesKilled,
        travelProgress: 0,
        isTraveling: true,
      },
      equipment: newEquipment,
      inventory: newInventory,
      ...(loot ? { pendingLoot: loot, showLootModal: showLoot } : {}),
    });

    // Recalculate stats if equipment changed
    if (loot && LootSystem.isUpgrade(state.equipment[loot.slot], loot)) {
      get().recalculateStats();
    }
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
    const equipBonus = get().getEquipmentBonus();

    const maxHp = PLAYER_BASE.maxHp + upgrades.hp * UPGRADE_EFFECTS.hp.perLevel + (equipBonus.maxHp || 0);
    const atk = PLAYER_BASE.atk + upgrades.atk * UPGRADE_EFFECTS.atk.perLevel + (equipBonus.atk || 0);
    const def = PLAYER_BASE.def + upgrades.def * UPGRADE_EFFECTS.def.perLevel + (equipBonus.def || 0);
    const attackSpeed = PLAYER_BASE.attackSpeed + upgrades.speed * UPGRADE_EFFECTS.speed.perLevel + (equipBonus.attackSpeed || 0);
    const critChance = PLAYER_BASE.critChance + upgrades.crit * UPGRADE_EFFECTS.crit.perLevel + (equipBonus.critChance || 0);
    const critMultiplier = PLAYER_BASE.critMultiplier + (equipBonus.critMultiplier || 0);

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
        critMultiplier,
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

  // Equipment
  equipItem: (item: Equipment) => {
    const state = get();
    const currentEquipped = state.equipment[item.slot];

    // Move current item to inventory if exists
    let newInventory = [...state.inventory];
    if (currentEquipped) {
      newInventory.push(currentEquipped);
    }

    // Remove new item from inventory
    newInventory = newInventory.filter((i) => i.id !== item.id);

    set({
      equipment: {
        ...state.equipment,
        [item.slot]: item,
      },
      inventory: newInventory,
    });

    get().recalculateStats();
  },

  unequipItem: (slot: EquipmentSlotType) => {
    const state = get();
    const item = state.equipment[slot];
    if (!item) return;

    // Check inventory space
    if (state.inventory.length >= get().getBackpackCapacity()) {
      return; // Inventory full
    }

    set({
      equipment: {
        ...state.equipment,
        [slot]: null,
      },
      inventory: [...state.inventory, item],
    });

    get().recalculateStats();
  },

  addToInventory: (item: Equipment) => {
    const state = get();
    if (state.inventory.length >= get().getBackpackCapacity()) {
      return; // Inventory full
    }
    set({
      inventory: [...state.inventory, item],
    });
  },

  removeFromInventory: (itemId: string) => {
    set({
      inventory: get().inventory.filter((i) => i.id !== itemId),
    });
  },

  getEquipmentBonus: (): EquipmentStats => {
    const state = get();
    const bonus: EquipmentStats = {
      atk: 0,
      def: 0,
      maxHp: 0,
      attackSpeed: 0,
      critChance: 0,
      critMultiplier: 0,
    };

    const slots = Object.values(state.equipment) as (Equipment | null)[];
    for (const item of slots) {
      if (!item) continue;
      if (item.stats.atk) bonus.atk! += item.stats.atk;
      if (item.stats.def) bonus.def! += item.stats.def;
      if (item.stats.maxHp) bonus.maxHp! += item.stats.maxHp;
      if (item.stats.attackSpeed) bonus.attackSpeed! += item.stats.attackSpeed;
      if (item.stats.critChance) bonus.critChance! += item.stats.critChance;
      if (item.stats.critMultiplier) bonus.critMultiplier! += item.stats.critMultiplier;
    }

    return bonus;
  },

  setShowLootModal: (show) => {
    set({ showLootModal: show });
  },

  // Dismiss loot toast notification (loot is already auto-collected)
  dismissLootToast: () => {
    set({
      pendingLoot: null,
      showLootModal: false,
    });
  },

  // Legacy aliases for backward compatibility
  collectLoot: () => {
    get().dismissLootToast();
  },

  discardLoot: () => {
    get().dismissLootToast();
  },

  // Backpack upgrade
  getBackpackCapacity: () => {
    const level = get().backpackLevel;
    return BACKPACK_BASE_CAPACITY + level * BACKPACK_CAPACITY_PER_LEVEL;
  },

  getBackpackUpgradeCost: () => {
    const level = get().backpackLevel;
    return Math.floor(BACKPACK_UPGRADE_BASE_COST * Math.pow(BACKPACK_UPGRADE_COST_MULTIPLIER, level));
  },

  buyBackpackUpgrade: () => {
    const state = get();
    const cost = get().getBackpackUpgradeCost();

    if (state.backpackLevel >= BACKPACK_MAX_LEVEL) return false;
    if (state.gold < cost) return false;

    set({
      gold: state.gold - cost,
      backpackLevel: state.backpackLevel + 1,
    });
    return true;
  },

  // Save/Load
  saveGame: async () => {
    const state = get();
    const saveData: SaveData = {
      version: '0.3.0',
      player: state.player,
      upgrades: state.upgrades,
      gold: state.gold,
      totalGoldEarned: state.totalGoldEarned,
      stage: state.stage,
      lastOnlineTime: Date.now(),
      equipment: state.equipment,
      inventory: state.inventory,
      backpackLevel: state.backpackLevel,
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
        equipment: data.equipment || emptyEquipmentSlots,
        inventory: data.inventory || [],
        backpackLevel: data.backpackLevel || 0,
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
