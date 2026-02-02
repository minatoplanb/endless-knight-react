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
  Area,
  AreaProgress,
  WorkerType,
  Worker,
  GatheringState,
  ResourceType,
  CombatStyle,
  ConsumableStack,
  ActiveBuff,
  BuffType,
  PrestigeState,
} from '../types';
import {
  getCombatMultiplier,
  getDefenseMultiplier,
} from '../data/combatStyles';
import {
  getRecipeById,
  canAffordRecipe,
} from '../data/crafting';
import {
  getConsumableById,
  CONSUMABLES,
} from '../data/consumables';
import {
  getPrestigeUpgradeById,
  getUpgradeCost as getPrestigeUpgradeCostFromData,
  calculatePrestigePoints,
  canPrestige as canPrestigeCheck,
  PRESTIGE_UPGRADES,
} from '../data/prestige';
import {
  getBossByAreaId,
  isBossStage,
  calculateBossStats,
} from '../data/bosses';
import {
  AREAS,
  getAreaById,
  getStartingArea,
  getNextArea,
  selectRandomEnemy,
  calculateEnemyStats,
} from '../data/areas';
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
import {
  ALL_WORKERS,
  WORKER_MAX_LEVEL,
  getWorkerInterval,
  getWorkerUpgradeCost as getWorkerUpgradeCostFromData,
} from '../data/gathering';
import { ALL_RESOURCES, RESOURCE_BASE_CAP } from '../data/resources';

const generateId = () => Math.random().toString(36).substring(2, 9);

// Get starting area
const startingArea = getStartingArea();

// Create enemy from area data
const createEnemyFromArea = (area: Area, stageInArea: number): Enemy => {
  // Check if this is a boss stage
  if (isBossStage(area.id, stageInArea, area.stages)) {
    const boss = getBossByAreaId(area.id);
    if (boss) {
      // Get average base stats from area enemies for boss calculation
      const avgHp = area.enemies.reduce((sum, e) => sum + e.baseHp, 0) / area.enemies.length;
      const avgAtk = area.enemies.reduce((sum, e) => sum + e.baseAtk, 0) / area.enemies.length;
      const avgDef = area.enemies.reduce((sum, e) => sum + e.baseDef, 0) / area.enemies.length;

      const bossStats = calculateBossStats(boss, avgHp, avgAtk, avgDef, stageInArea);

      return {
        id: generateId(),
        name: boss.name,
        maxHp: bossStats.hp,
        currentHp: bossStats.hp,
        atk: bossStats.atk,
        def: bossStats.def,
        goldDrop: bossStats.gold,
        combatStyle: boss.combatStyle,
        isBoss: true,
        bossTitle: boss.title,
        sprite: boss.sprite,
      };
    }
  }

  // Regular enemy
  const areaEnemy = selectRandomEnemy(area);
  const stats = calculateEnemyStats(areaEnemy, stageInArea);

  return {
    id: generateId(),
    name: areaEnemy.name,
    maxHp: stats.hp,
    currentHp: stats.hp,
    atk: stats.atk,
    def: stats.def,
    goldDrop: stats.gold,
    combatStyle: areaEnemy.combatStyle,
    isBoss: false,
    sprite: areaEnemy.sprite,
  };
};

// Legacy function for backward compatibility (fallback)
const createEnemy = (stage: number): Enemy => {
  const stageMultiplier = stage - 1;
  // Random combat style for legacy enemies
  const styles: CombatStyle[] = ['melee', 'ranged', 'magic'];
  const randomStyle = styles[Math.floor(Math.random() * styles.length)];
  return {
    id: generateId(),
    name: `Enemy Lv.${stage}`,
    maxHp: Math.floor(ENEMY_SCALING.hpBase * Math.pow(ENEMY_SCALING.hpMultiplier, stageMultiplier)),
    currentHp: Math.floor(ENEMY_SCALING.hpBase * Math.pow(ENEMY_SCALING.hpMultiplier, stageMultiplier)),
    atk: Math.floor(ENEMY_SCALING.atkBase * Math.pow(ENEMY_SCALING.atkMultiplier, stageMultiplier)),
    def: 0,
    goldDrop: Math.floor(ENEMY_SCALING.goldBase * Math.pow(ENEMY_SCALING.goldMultiplier, stageMultiplier)),
    combatStyle: randomStyle,
    isBoss: false,
    sprite: 'slime_green',
  };
};

// Default area progress
const createDefaultAreaProgress = (): AreaProgress => ({
  currentStage: 1,
  highestStage: 1,
  cleared: false,
});

const emptyEquipmentSlots: EquipmentSlots = {
  weapon: null,
  helmet: null,
  armor: null,
  shield: null,
  ring: null,
  amulet: null,
};

// Create default prestige state
const createDefaultPrestigeState = (): PrestigeState => ({
  prestigePoints: 0,
  totalPrestigePoints: 0,
  prestigeCount: 0,
  upgrades: {},
});

// Create default gathering state
const createDefaultGatheringState = (): GatheringState => {
  const workers: Record<WorkerType, Worker> = {} as Record<WorkerType, Worker>;
  for (const workerType of ALL_WORKERS) {
    workers[workerType] = {
      type: workerType,
      level: 1,
      progress: 0,
    };
  }

  const resources: Record<ResourceType, number> = {} as Record<ResourceType, number>;
  const resourceCaps: Record<ResourceType, number> = {} as Record<ResourceType, number>;
  for (const resourceType of ALL_RESOURCES) {
    resources[resourceType] = 0;
    resourceCaps[resourceType] = RESOURCE_BASE_CAP;
  }

  return {
    workers,
    resources,
    resourceCaps,
    lastGatherTime: Date.now(),
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
  combatStyle: 'melee',
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
    currentAreaId: startingArea.id,
  },
  currentEnemy: null,
  // Area system
  unlockedAreas: [startingArea.id],
  areaProgress: {
    [startingArea.id]: createDefaultAreaProgress(),
  },
  // Gathering system
  gathering: createDefaultGatheringState(),
  // Consumables system
  consumables: [],
  activeBuffs: [],
  // Prestige system
  prestige: createDefaultPrestigeState(),
  damagePopups: [],
  isPlayerDead: false,
  showDeathModal: false,
  showOfflineModal: false,
  showLootModal: false,
  offlineReward: 0,
  offlineGathering: null,
  lastSaveTime: Date.now(),
  lastOnlineTime: Date.now(),
  isRunning: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Game flow
  tick: () => {
    const state = get();
    if (!state.isRunning) return;

    // Always tick gathering (even when dead)
    get().tickGathering();

    // Always tick buffs
    get().tickBuffs();

    if (state.isPlayerDead) return;

    if (state.stage.isTraveling) {
      // Traveling to next enemy
      const progressPerTick = (TICK_INTERVAL / STAGE.travelTime) * 100;
      const newProgress = state.stage.travelProgress + progressPerTick;

      if (newProgress >= 100) {
        // Arrived at enemy - use area-based enemy creation
        const currentArea = getAreaById(state.stage.currentAreaId);
        const enemy = currentArea
          ? createEnemyFromArea(currentArea, state.stage.currentStage)
          : createEnemy(state.stage.currentStage);

        set({
          stage: {
            ...state.stage,
            travelProgress: 100,
            isTraveling: false,
          },
          currentEnemy: enemy,
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

    // Apply attack speed buff
    const speedBuff = get().getBuffMultiplier('attackSpeed');
    const attackChance = state.player.attackSpeed * speedBuff * (TICK_INTERVAL / 1000);
    if (Math.random() > attackChance) return;

    // Apply ATK buff
    const atkBuff = get().getBuffMultiplier('atk');
    const buffedAtk = Math.floor(state.player.atk * atkBuff);

    const isCrit = Math.random() < state.player.critChance;
    let baseDamage = Math.max(1, buffedAtk - Math.floor(state.currentEnemy.atk * 0.1));

    // Apply combat style multiplier
    const styleMultiplier = getCombatMultiplier(state.combatStyle, state.currentEnemy.combatStyle);
    let damage = Math.floor(baseDamage * styleMultiplier);

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

    // Apply DEF buff
    const defBuff = get().getBuffMultiplier('def');
    const buffedDef = Math.floor(state.player.def * defBuff);

    let baseDamage = Math.max(1, state.currentEnemy.atk - buffedDef);

    // Apply combat style defense multiplier (player takes more damage if at disadvantage)
    const defenseMultiplier = getDefenseMultiplier(state.combatStyle, state.currentEnemy.combatStyle);
    const damage = Math.floor(baseDamage * defenseMultiplier);

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
    const currentArea = getAreaById(state.stage.currentAreaId);
    const enemy = currentArea
      ? createEnemyFromArea(currentArea, state.stage.currentStage)
      : createEnemy(state.stage.currentStage);

    set({
      currentEnemy: enemy,
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

    const currentArea = getAreaById(state.stage.currentAreaId);
    const goldEarned = state.currentEnemy.goldDrop;
    const isActualBoss = state.currentEnemy.isBoss;
    const newEnemiesKilled = state.stage.enemiesKilled + 1;

    let newStage = state.stage.currentStage;
    const isStageComplete = newEnemiesKilled >= STAGE.enemiesPerStage;
    let areaCleared = false;

    // Boss kill or stage complete triggers stage advancement
    if (isActualBoss || isStageComplete) {
      // Check if this was the last stage of the area
      if (currentArea && newStage >= currentArea.stages) {
        areaCleared = true;
        // Stay at the last stage when area is cleared
      } else {
        newStage++;
      }
    }

    // Check for loot drop - bosses always drop loot
    let loot: Equipment | null = null;
    if (isActualBoss) {
      // Boss guaranteed drop with higher rarity
      loot = LootSystem.generateDrop(state.stage.currentStage, true);
    } else if (LootSystem.shouldDropLoot(state.stage.currentStage, isStageComplete)) {
      loot = LootSystem.generateDrop(state.stage.currentStage, isStageComplete);
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

    // Update area progress
    const currentAreaId = state.stage.currentAreaId;
    const currentAreaProgress = state.areaProgress[currentAreaId] || createDefaultAreaProgress();
    const newAreaProgress = {
      ...state.areaProgress,
      [currentAreaId]: {
        currentStage: newStage,
        highestStage: Math.max(currentAreaProgress.highestStage, newStage),
        cleared: areaCleared || currentAreaProgress.cleared,
      },
    };

    // Unlock next area if this area was cleared
    let newUnlockedAreas = [...state.unlockedAreas];
    if (areaCleared && currentArea) {
      const nextArea = getNextArea(currentAreaId);
      if (nextArea && !newUnlockedAreas.includes(nextArea.id)) {
        newUnlockedAreas.push(nextArea.id);
        // Initialize progress for newly unlocked area
        newAreaProgress[nextArea.id] = createDefaultAreaProgress();
      }
    }

    set({
      gold: state.gold + goldEarned,
      totalGoldEarned: state.totalGoldEarned + goldEarned,
      currentEnemy: null,
      stage: {
        ...state.stage,
        currentStage: newStage,
        highestStage: Math.max(state.stage.highestStage, newStage),
        enemiesKilled: (isActualBoss || isStageComplete) ? 0 : newEnemiesKilled,
        travelProgress: 0,
        isTraveling: true,
      },
      areaProgress: newAreaProgress,
      unlockedAreas: newUnlockedAreas,
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

    // Get prestige bonuses (percentages)
    const hpBonus = 1 + get().getPrestigeBonus('hp_percent') / 100;
    const atkBonus = 1 + get().getPrestigeBonus('atk_percent') / 100;
    const defBonus = 1 + get().getPrestigeBonus('def_percent') / 100;
    const speedBonus = 1 + get().getPrestigeBonus('attack_speed') / 100;
    const critBonus = get().getPrestigeBonus('crit_chance') / 100;

    // Base stats + upgrades + equipment
    const baseMaxHp = PLAYER_BASE.maxHp + upgrades.hp * UPGRADE_EFFECTS.hp.perLevel + (equipBonus.maxHp || 0);
    const baseAtk = PLAYER_BASE.atk + upgrades.atk * UPGRADE_EFFECTS.atk.perLevel + (equipBonus.atk || 0);
    const baseDef = PLAYER_BASE.def + upgrades.def * UPGRADE_EFFECTS.def.perLevel + (equipBonus.def || 0);
    const baseAttackSpeed = PLAYER_BASE.attackSpeed + upgrades.speed * UPGRADE_EFFECTS.speed.perLevel + (equipBonus.attackSpeed || 0);
    const baseCritChance = PLAYER_BASE.critChance + upgrades.crit * UPGRADE_EFFECTS.crit.perLevel + (equipBonus.critChance || 0);
    const critMultiplier = PLAYER_BASE.critMultiplier + (equipBonus.critMultiplier || 0);

    // Apply prestige bonuses
    const maxHp = Math.floor(baseMaxHp * hpBonus);
    const atk = Math.floor(baseAtk * atkBonus);
    const def = Math.floor(baseDef * defBonus);
    const attackSpeed = baseAttackSpeed * speedBonus;
    const critChance = baseCritChance + critBonus;

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

  // Combat Style
  setCombatStyle: (style: CombatStyle) => {
    set({ combatStyle: style });
  },

  // Area System
  changeArea: (areaId: string) => {
    const state = get();

    // Can only change to unlocked areas
    if (!state.unlockedAreas.includes(areaId)) {
      return;
    }

    const area = getAreaById(areaId);
    if (!area) return;

    // Get or create progress for the new area
    const areaProgress = state.areaProgress[areaId] || createDefaultAreaProgress();

    set({
      stage: {
        ...state.stage,
        currentAreaId: areaId,
        currentStage: areaProgress.currentStage,
        enemiesKilled: 0,
        travelProgress: 0,
        isTraveling: true,
      },
      currentEnemy: null,
      areaProgress: {
        ...state.areaProgress,
        [areaId]: areaProgress,
      },
    });
  },

  unlockArea: (areaId: string) => {
    const state = get();
    if (state.unlockedAreas.includes(areaId)) return;

    const area = getAreaById(areaId);
    if (!area) return;

    set({
      unlockedAreas: [...state.unlockedAreas, areaId],
      areaProgress: {
        ...state.areaProgress,
        [areaId]: createDefaultAreaProgress(),
      },
    });
  },

  getCurrentArea: (): Area | undefined => {
    const state = get();
    return getAreaById(state.stage.currentAreaId);
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

  // Gathering System
  tickGathering: () => {
    const state = get();
    const { gathering } = state;
    const now = Date.now();

    // Calculate progress for each worker based on tick interval
    const newWorkers = { ...gathering.workers };
    const newResources = { ...gathering.resources };
    let hasChanges = false;

    for (const workerType of ALL_WORKERS) {
      const worker = newWorkers[workerType];
      const interval = getWorkerInterval(worker.level);
      // Progress per tick: TICK_INTERVAL ms / (interval seconds * 1000 ms)
      const progressPerTick = TICK_INTERVAL / (interval * 1000);
      const newProgress = worker.progress + progressPerTick;

      if (newProgress >= 1) {
        // Gathered a resource
        const resourceType = workerType === 'miner' ? 'ore' :
                            workerType === 'lumberjack' ? 'wood' :
                            workerType === 'fisher' ? 'fish' : 'herb';
        const cap = gathering.resourceCaps[resourceType];
        const resourcesGained = Math.floor(newProgress);
        const newAmount = Math.min(cap, newResources[resourceType] + resourcesGained);

        if (newAmount !== newResources[resourceType]) {
          newResources[resourceType] = newAmount;
          hasChanges = true;
        }

        newWorkers[workerType] = {
          ...worker,
          progress: newProgress - resourcesGained,
        };
      } else {
        newWorkers[workerType] = {
          ...worker,
          progress: newProgress,
        };
      }
    }

    if (hasChanges || Object.values(newWorkers).some((w, i) =>
      w.progress !== Object.values(gathering.workers)[i].progress)) {
      set({
        gathering: {
          ...gathering,
          workers: newWorkers,
          resources: newResources,
          lastGatherTime: now,
        },
      });
    }
  },

  upgradeWorker: (workerType: WorkerType) => {
    const state = get();
    const worker = state.gathering.workers[workerType];
    const cost = getWorkerUpgradeCostFromData(worker.level);

    if (worker.level >= WORKER_MAX_LEVEL) return false;
    if (state.gold < cost) return false;

    set({
      gold: state.gold - cost,
      gathering: {
        ...state.gathering,
        workers: {
          ...state.gathering.workers,
          [workerType]: {
            ...worker,
            level: worker.level + 1,
          },
        },
      },
    });
    return true;
  },

  getWorkerUpgradeCost: (workerType: WorkerType) => {
    const state = get();
    const worker = state.gathering.workers[workerType];
    return getWorkerUpgradeCostFromData(worker.level);
  },

  collectOfflineGathering: () => {
    const state = get();
    if (!state.offlineGathering) return;

    const newResources = { ...state.gathering.resources };
    for (const resourceType of ALL_RESOURCES) {
      const amount = state.offlineGathering[resourceType] || 0;
      const cap = state.gathering.resourceCaps[resourceType];
      newResources[resourceType] = Math.min(cap, newResources[resourceType] + amount);
    }

    set({
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
      offlineGathering: null,
    });
  },

  dismissOfflineGathering: () => {
    set({ offlineGathering: null });
  },

  // Crafting System
  craftItem: (recipeId: string) => {
    const state = get();
    const recipe = getRecipeById(recipeId);
    if (!recipe) return false;

    // Check if can afford
    if (!canAffordRecipe(recipe, state.gathering.resources, state.gold)) {
      return false;
    }

    // Deduct resources
    const newResources = { ...state.gathering.resources };
    for (const [resource, amount] of Object.entries(recipe.costs)) {
      newResources[resource as ResourceType] -= amount!;
    }

    // Deduct gold
    const newGold = state.gold - (recipe.goldCost || 0);

    // Add crafted item
    if (recipe.itemType === 'consumable') {
      // Add to consumables
      get().addConsumable(recipe.outputId, recipe.outputAmount);
    }
    // TODO: Handle equipment crafting (add to inventory)

    set({
      gold: newGold,
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
    });

    return true;
  },

  // Consumables System
  addConsumable: (consumableId: string, amount: number) => {
    const state = get();
    const consumable = getConsumableById(consumableId);
    if (!consumable) return;

    const newConsumables = [...state.consumables];
    const existingIndex = newConsumables.findIndex((c) => c.consumableId === consumableId);

    if (existingIndex >= 0) {
      // Add to existing stack
      const newAmount = Math.min(
        newConsumables[existingIndex].amount + amount,
        consumable.maxStack
      );
      newConsumables[existingIndex] = {
        ...newConsumables[existingIndex],
        amount: newAmount,
      };
    } else {
      // Create new stack
      newConsumables.push({
        consumableId,
        amount: Math.min(amount, consumable.maxStack),
      });
    }

    set({ consumables: newConsumables });
  },

  useConsumable: (consumableId: string) => {
    const state = get();
    const consumable = getConsumableById(consumableId);
    if (!consumable) return false;

    // Find stack
    const stackIndex = state.consumables.findIndex((c) => c.consumableId === consumableId);
    if (stackIndex < 0 || state.consumables[stackIndex].amount <= 0) {
      return false;
    }

    // Apply effect
    const effect = consumable.effect;
    if (effect.type === 'heal') {
      const newHp = Math.min(
        state.player.maxHp,
        state.player.currentHp + effect.amount
      );
      set({
        player: {
          ...state.player,
          currentHp: newHp,
        },
      });
    } else if (effect.type === 'buff') {
      const newBuff: ActiveBuff = {
        id: generateId(),
        buffType: effect.buffType,
        multiplier: effect.multiplier,
        expiresAt: Date.now() + effect.duration,
        sourceId: consumableId,
      };

      // Remove existing buff of same type and add new one
      const newBuffs = state.activeBuffs.filter(
        (b) => b.buffType !== effect.buffType
      );
      newBuffs.push(newBuff);
      set({ activeBuffs: newBuffs });
    }

    // Reduce stack
    const newConsumables = [...state.consumables];
    newConsumables[stackIndex] = {
      ...newConsumables[stackIndex],
      amount: newConsumables[stackIndex].amount - 1,
    };

    // Remove empty stacks
    const filteredConsumables = newConsumables.filter((c) => c.amount > 0);
    set({ consumables: filteredConsumables });

    return true;
  },

  tickBuffs: () => {
    const state = get();
    const now = Date.now();
    const expiredBuffs = state.activeBuffs.filter((b) => b.expiresAt <= now);

    if (expiredBuffs.length > 0) {
      const newBuffs = state.activeBuffs.filter((b) => b.expiresAt > now);
      set({ activeBuffs: newBuffs });
    }
  },

  getBuffMultiplier: (buffType: BuffType) => {
    const state = get();
    const buff = state.activeBuffs.find((b) => b.buffType === buffType);
    return buff ? buff.multiplier : 1.0;
  },

  // Prestige System
  canPrestige: () => {
    const state = get();
    return canPrestigeCheck(state.totalGoldEarned, state.stage.highestStage);
  },

  getPrestigePointsPreview: () => {
    const state = get();
    // Count cleared areas
    const clearedAreas = Object.values(state.areaProgress).filter((p) => p.cleared).length;
    return calculatePrestigePoints(state.totalGoldEarned, state.stage.highestStage, clearedAreas);
  },

  doPrestige: () => {
    const state = get();
    if (!get().canPrestige()) return false;

    const pointsEarned = get().getPrestigePointsPreview();
    if (pointsEarned <= 0) return false;

    // Calculate starting gold from prestige bonus
    const startingGoldBonus = get().getPrestigeBonus('starting_gold');

    // Reset game state but keep prestige data
    set({
      // Reset player to base stats (will recalculate with prestige bonuses)
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
      gold: startingGoldBonus,
      totalGoldEarned: 0,
      combatStyle: 'melee',
      equipment: { ...emptyEquipmentSlots },
      inventory: [],
      backpackLevel: 0,
      stage: {
        currentStage: 1,
        highestStage: 1,
        enemiesKilled: 0,
        travelProgress: 0,
        isTraveling: true,
        currentAreaId: startingArea.id,
      },
      currentEnemy: null,
      unlockedAreas: [startingArea.id],
      areaProgress: {
        [startingArea.id]: createDefaultAreaProgress(),
      },
      gathering: createDefaultGatheringState(),
      consumables: [],
      activeBuffs: [],
      // Update prestige
      prestige: {
        ...state.prestige,
        prestigePoints: state.prestige.prestigePoints + pointsEarned,
        totalPrestigePoints: state.prestige.totalPrestigePoints + pointsEarned,
        prestigeCount: state.prestige.prestigeCount + 1,
      },
      isPlayerDead: false,
      showDeathModal: false,
    });

    // Recalculate stats with prestige bonuses
    get().recalculateStats();

    return true;
  },

  buyPrestigeUpgrade: (upgradeId: string) => {
    const state = get();
    const upgrade = getPrestigeUpgradeById(upgradeId);
    if (!upgrade) return false;

    const currentLevel = state.prestige.upgrades[upgradeId] || 0;
    if (currentLevel >= upgrade.maxLevel) return false;

    const cost = getPrestigeUpgradeCostFromData(upgrade, currentLevel);
    if (state.prestige.prestigePoints < cost) return false;

    set({
      prestige: {
        ...state.prestige,
        prestigePoints: state.prestige.prestigePoints - cost,
        upgrades: {
          ...state.prestige.upgrades,
          [upgradeId]: currentLevel + 1,
        },
      },
    });

    // Recalculate stats with new bonus
    get().recalculateStats();

    return true;
  },

  getPrestigeUpgradeCost: (upgradeId: string) => {
    const state = get();
    const upgrade = getPrestigeUpgradeById(upgradeId);
    if (!upgrade) return 0;
    const currentLevel = state.prestige.upgrades[upgradeId] || 0;
    return getPrestigeUpgradeCostFromData(upgrade, currentLevel);
  },

  getPrestigeBonus: (effectType: string) => {
    const state = get();
    let totalBonus = 0;

    for (const upgrade of PRESTIGE_UPGRADES) {
      if (upgrade.effect.type === effectType) {
        const level = state.prestige.upgrades[upgrade.id] || 0;
        totalBonus += upgrade.effect.valuePerLevel * level;
      }
    }

    return totalBonus;
  },

  // Save/Load
  saveGame: async () => {
    const state = get();
    const saveData: SaveData = {
      version: '0.8.0',
      player: state.player,
      upgrades: state.upgrades,
      gold: state.gold,
      totalGoldEarned: state.totalGoldEarned,
      stage: state.stage,
      lastOnlineTime: Date.now(),
      equipment: state.equipment,
      inventory: state.inventory,
      backpackLevel: state.backpackLevel,
      unlockedAreas: state.unlockedAreas,
      areaProgress: state.areaProgress,
      gathering: state.gathering,
      combatStyle: state.combatStyle,
      consumables: state.consumables,
      activeBuffs: state.activeBuffs,
      prestige: state.prestige,
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

      // Handle migration from older saves without area system
      const defaultAreaId = startingArea.id;
      const savedAreaId = data.stage?.currentAreaId || defaultAreaId;
      const savedUnlockedAreas = data.unlockedAreas || [defaultAreaId];
      const savedAreaProgress = data.areaProgress || {
        [defaultAreaId]: {
          currentStage: data.stage?.currentStage || 1,
          highestStage: data.stage?.highestStage || 1,
          cleared: false,
        },
      };

      // Handle migration from older saves without gathering system
      const savedGathering = data.gathering || createDefaultGatheringState();
      // Update lastGatherTime to saved lastOnlineTime for offline calculation
      savedGathering.lastGatherTime = data.lastOnlineTime;

      set({
        player: data.player,
        upgrades: data.upgrades,
        gold: data.gold,
        totalGoldEarned: data.totalGoldEarned,
        combatStyle: data.combatStyle || 'melee',
        stage: {
          ...data.stage,
          currentAreaId: savedAreaId,
          travelProgress: 0,
          isTraveling: true,
        },
        currentEnemy: null,
        lastOnlineTime: data.lastOnlineTime,
        equipment: data.equipment || emptyEquipmentSlots,
        inventory: data.inventory || [],
        backpackLevel: data.backpackLevel || 0,
        unlockedAreas: savedUnlockedAreas,
        areaProgress: savedAreaProgress,
        gathering: savedGathering,
        consumables: data.consumables || [],
        activeBuffs: data.activeBuffs || [],
        prestige: data.prestige || createDefaultPrestigeState(),
      });

      // Recalculate stats with prestige bonuses
      get().recalculateStats();
      get().calculateOfflineReward();
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  },

  calculateOfflineReward: () => {
    const state = get();
    const offlineSeconds = (Date.now() - state.lastOnlineTime) / 1000;

    if (offlineSeconds < OFFLINE.minOfflineSeconds) {
      set({ offlineReward: 0, offlineGathering: null });
      return;
    }

    const cappedSeconds = Math.min(offlineSeconds, OFFLINE.maxHours * 3600);
    const stage = state.stage.currentStage;
    const goldPerEnemy = Math.floor(ENEMY_SCALING.goldBase * Math.pow(ENEMY_SCALING.goldMultiplier, stage - 1));
    const enemiesPerSecond = 0.5; // Approximate kills per second
    const offlineGold = Math.floor(goldPerEnemy * enemiesPerSecond * cappedSeconds * OFFLINE.efficiency);

    // Calculate offline gathering rewards
    const offlineGathering: Record<ResourceType, number> = {
      ore: 0,
      wood: 0,
      fish: 0,
      herb: 0,
    };

    for (const workerType of ALL_WORKERS) {
      const worker = state.gathering.workers[workerType];
      const interval = getWorkerInterval(worker.level);
      // Resources gathered = offline seconds / interval (full efficiency for gathering)
      const resourcesGathered = Math.floor(cappedSeconds / interval);
      const resourceType: ResourceType =
        workerType === 'miner' ? 'ore' :
        workerType === 'lumberjack' ? 'wood' :
        workerType === 'fisher' ? 'fish' : 'herb';
      offlineGathering[resourceType] = resourcesGathered;
    }

    const hasOfflineGathering = Object.values(offlineGathering).some(v => v > 0);

    if (offlineGold > 0 || hasOfflineGathering) {
      set({
        offlineReward: offlineGold,
        offlineGathering: hasOfflineGathering ? offlineGathering : null,
        showOfflineModal: true,
      });
    }
  },
}));
