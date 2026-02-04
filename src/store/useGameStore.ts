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
  SkillState,
  SkillBuff,
  SkillId,
  GameStatistics,
  QuestStateData,
  ActiveQuestData,
  Rarity,
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
  SKILLS,
  getSkillById,
  getSkillEffectValue,
  getSkillUpgradeCost,
  ALL_SKILL_IDS,
} from '../data/skills';
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
import { CombatSystem } from '../engine/CombatSystem';
import { firebaseService } from '../services/firebase';
import {
  BACKPACK_BASE_CAPACITY,
  BACKPACK_CAPACITY_PER_LEVEL,
  BACKPACK_MAX_LEVEL,
  BACKPACK_UPGRADE_BASE_COST,
  BACKPACK_UPGRADE_COST_MULTIPLIER,
  getCraftedEquipment,
} from '../data/equipment';
import {
  getEnhancementCost as getEnhancementCostFromData,
  isMaxEnhancement,
  MAX_ENHANCEMENT_LEVEL,
  getEnhancementSuccessRate,
} from '../data/enhancement';
import {
  ALL_WORKERS,
  WORKER_MAX_LEVEL,
  getWorkerInterval,
  getWorkerUpgradeCost as getWorkerUpgradeCostFromData,
} from '../data/gathering';
import { ALL_RESOURCES, RESOURCE_BASE_CAP, getResourceCap, getResourceCapUpgradeCost, RESOURCE_CAP_UPGRADE } from '../data/resources';
import { ACHIEVEMENTS, getAchievementById } from '../data/achievements';
import {
  getQuestById,
  selectRandomQuests,
  createDefaultQuestState,
  createActiveQuest,
  needsDailyReset,
  needsWeeklyReset,
  DAILY_QUEST_POOL,
  WEEKLY_QUEST_POOL,
  DAILY_QUEST_COUNT,
  WEEKLY_QUEST_COUNT,
  QuestObjectiveType,
} from '../data/quests';
import {
  getDailyReward,
  canClaimToday,
  shouldResetStreak,
} from '../data/dailyRewards';

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

// Migration helper: ensure equipment has enhancementLevel
const migrateEquipment = (item: Equipment): Equipment => {
  if (item.enhancementLevel === undefined) {
    return { ...item, enhancementLevel: 0 };
  }
  return item;
};

const migrateEquipmentSlots = (slots: EquipmentSlots): EquipmentSlots => {
  return {
    weapon: slots.weapon ? migrateEquipment(slots.weapon) : null,
    helmet: slots.helmet ? migrateEquipment(slots.helmet) : null,
    armor: slots.armor ? migrateEquipment(slots.armor) : null,
    shield: slots.shield ? migrateEquipment(slots.shield) : null,
    ring: slots.ring ? migrateEquipment(slots.ring) : null,
    amulet: slots.amulet ? migrateEquipment(slots.amulet) : null,
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

// Create default prestige state
const createDefaultPrestigeState = (): PrestigeState => ({
  prestigePoints: 0,
  totalPrestigePoints: 0,
  prestigeCount: 0,
  upgrades: {},
});

// Create default skill state
const createDefaultSkillState = (): SkillState => ({
  unlockedSkills: {
    power_strike: 0,
    heal: 0,
    shield: 0,
    berserk: 0,
    critical_eye: 0,
    gold_rush: 0,
  },
  cooldowns: {
    power_strike: 0,
    heal: 0,
    shield: 0,
    berserk: 0,
    critical_eye: 0,
    gold_rush: 0,
  },
  skillPoints: 1, // Start with 1 skill point
  totalSkillPointsEarned: 1,
});

// Create default statistics state
const createDefaultStatistics = (): GameStatistics => ({
  totalEnemiesKilled: 0,
  totalBossesKilled: 0,
  totalDeaths: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalCriticalHits: 0,
  totalGoldEarned: 0,
  totalPlayTimeMs: 0,
  highestDamageDealt: 0,
  longestKillStreak: 0,
  currentKillStreak: 0,
  itemsCrafted: 0,
  consumablesUsed: 0,
  skillsUsed: 0,
  enhancementsAttempted: 0,
  resourcesCollected: { ore: 0, wood: 0, fish: 0, herb: 0 },
  totalResourcesCollected: 0,
});

// Migrate statistics from old saves
const migrateStatistics = (saved: Partial<GameStatistics> | undefined): GameStatistics => {
  const defaults = createDefaultStatistics();
  if (!saved) return defaults;
  return {
    ...defaults,
    ...saved,
    resourcesCollected: {
      ...defaults.resourcesCollected,
      ...(saved.resourcesCollected || {}),
    },
  };
};

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
    resourceCapLevel: 0,
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
  // Skills system
  skills: createDefaultSkillState(),
  skillBuffs: [],
  // Statistics
  statistics: createDefaultStatistics(),
  // Achievements
  unlockedAchievements: [],
  pendingAchievement: null,
  // Daily Rewards
  dailyRewardStreak: 0,
  lastDailyClaimTime: 0,
  showDailyRewardModal: false,
  quests: createDefaultQuestState(),
  autoConsumeEnabled: false,
  autoConsumeThreshold: 0.3, // 30% HP
  autoConsumeSlot: null,
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

    // Always tick skill buffs
    get().tickSkillBuffs();

    // Check achievements periodically
    get().checkAchievements();

    if (state.isPlayerDead) return;

    // Auto-consume healing items when HP is low
    get().tickAutoConsume();

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

    // Apply attack speed buff (consumables + skill buffs)
    const speedBuff = get().getBuffMultiplier('attackSpeed');
    const skillSpeedBuff = get().getSkillBuffMultiplier('attack_speed');
    const attackChance = state.player.attackSpeed * speedBuff * skillSpeedBuff * (TICK_INTERVAL / 1000);
    if (Math.random() > attackChance) return;

    // Apply ATK buff
    const atkBuff = get().getBuffMultiplier('atk');
    const buffedAtk = Math.floor(state.player.atk * atkBuff);

    // Calculate area efficiency based on player level vs area requirement
    const currentArea = getAreaById(state.stage.currentAreaId);
    const playerLevel = state.upgrades.hp + state.upgrades.atk + state.upgrades.def +
                        state.upgrades.speed + state.upgrades.crit;
    const areaEfficiency = CombatSystem.calculateAreaEfficiency(
      playerLevel,
      currentArea?.requiredLevel || 0
    );

    // Apply area efficiency to attack, then subtract enemy defense
    const effectiveAtk = Math.floor(buffedAtk * areaEfficiency);
    let baseDamage = Math.max(1, effectiveAtk - state.currentEnemy.def);

    // Apply crit buff from skills
    const skillCritBuff = get().getSkillBuffMultiplier('crit');
    const effectiveCritChance = state.player.critChance * skillCritBuff;
    const isCrit = Math.random() < effectiveCritChance;

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

    // Track statistics
    set({
      statistics: {
        ...state.statistics,
        totalDamageDealt: state.statistics.totalDamageDealt + damage,
        totalCriticalHits: state.statistics.totalCriticalHits + (isCrit ? 1 : 0),
        highestDamageDealt: Math.max(state.statistics.highestDamageDealt, damage),
      },
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

    // Apply DEF buff (consumables + skill buffs)
    const defBuff = get().getBuffMultiplier('def');
    const skillDefBuff = get().getSkillBuffMultiplier('defense');
    const buffedDef = Math.floor(state.player.def * defBuff * skillDefBuff);

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

    // Track statistics
    set({
      statistics: {
        ...state.statistics,
        totalDamageTaken: state.statistics.totalDamageTaken + damage,
      },
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
    // Apply gold buff from skills
    const skillGoldBuff = get().getSkillBuffMultiplier('gold');
    const goldEarned = Math.floor(state.currentEnemy.goldDrop * skillGoldBuff);
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
    } else if (LootSystem.shouldDropLoot(state.stage.currentStage, false)) {
      // Regular enemies use normal drop chance (not boss drop chance)
      loot = LootSystem.generateDrop(state.stage.currentStage, false);
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

    // Update statistics
    const newStats = {
      ...state.statistics,
      totalEnemiesKilled: state.statistics.totalEnemiesKilled + 1,
      totalBossesKilled: state.statistics.totalBossesKilled + (isActualBoss ? 1 : 0),
      totalGoldEarned: state.statistics.totalGoldEarned + goldEarned,
      currentKillStreak: state.statistics.currentKillStreak + 1,
      longestKillStreak: Math.max(state.statistics.longestKillStreak, state.statistics.currentKillStreak + 1),
    };

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
      statistics: newStats,
      ...(loot ? { pendingLoot: loot, showLootModal: showLoot } : {}),
    });

    // Recalculate stats if equipment changed
    if (loot && LootSystem.isUpgrade(state.equipment[loot.slot], loot)) {
      get().recalculateStats();
    }

    // Award skill points for boss kills
    if (isActualBoss) {
      get().addSkillPoints(1);
    }

    // Update quest progress
    get().updateQuestProgress('kill_enemies', 1);
    if (isActualBoss) {
      get().updateQuestProgress('kill_bosses', 1);
    }
    get().updateQuestProgress('earn_gold', goldEarned);
  },

  playerDie: () => {
    const state = get();

    // Set player as dead briefly and track statistics
    set({
      player: {
        ...state.player,
        currentHp: 0,
      },
      statistics: {
        ...state.statistics,
        totalDeaths: state.statistics.totalDeaths + 1,
        currentKillStreak: 0, // Reset kill streak on death
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

  // Achievements
  checkAchievements: () => {
    const state = get();
    const statistics = state.statistics;
    const unlockedAchievements = state.unlockedAchievements;
    const areaProgress = state.areaProgress;
    const prestige = state.prestige;

    for (const achievement of ACHIEVEMENTS) {
      // Skip if already unlocked
      if (unlockedAchievements.includes(achievement.id)) continue;

      let unlocked = false;

      switch (achievement.condition.type) {
        case 'stat_threshold': {
          const statKey = achievement.condition.stat as keyof typeof statistics;
          const statValue = statistics[statKey];
          // Only compare if it's a number (not resourcesCollected which is a Record)
          if (statKey && typeof statValue === 'number' && statValue >= achievement.condition.threshold) {
            unlocked = true;
          }
          break;
        }
        case 'area_clear': {
          const areaId = achievement.condition.areaId;
          if (areaId && areaProgress[areaId]?.cleared) {
            unlocked = true;
          }
          break;
        }
        case 'prestige': {
          if (prestige.prestigeCount >= achievement.condition.threshold) {
            unlocked = true;
          }
          break;
        }
        case 'resource_collected': {
          const resourceType = achievement.condition.resourceType;
          if (resourceType && statistics.resourcesCollected[resourceType] >= achievement.condition.threshold) {
            unlocked = true;
          }
          break;
        }
      }

      if (unlocked) {
        // Unlock the achievement
        const newUnlocked = [...unlockedAchievements, achievement.id];
        set({
          unlockedAchievements: newUnlocked,
          pendingAchievement: achievement.id,
        });

        // Grant reward if any
        if (achievement.reward) {
          switch (achievement.reward.type) {
            case 'gold':
              set({ gold: state.gold + achievement.reward.amount });
              break;
            case 'skill_points':
              get().addSkillPoints(achievement.reward.amount);
              break;
            case 'prestige_points':
              set({
                prestige: {
                  ...state.prestige,
                  prestigePoints: state.prestige.prestigePoints + achievement.reward.amount,
                  totalPrestigePoints: state.prestige.totalPrestigePoints + achievement.reward.amount,
                },
              });
              break;
          }
        }

        // Only show one achievement at a time
        return;
      }
    }
  },

  dismissAchievement: () => {
    set({ pendingAchievement: null });
  },

  // Daily Rewards
  canClaimDailyReward: () => {
    const state = get();
    return canClaimToday(state.lastDailyClaimTime);
  },

  claimDailyReward: () => {
    const state = get();
    if (!canClaimToday(state.lastDailyClaimTime)) return;

    // Check if streak should reset
    let newStreak = state.dailyRewardStreak;
    if (shouldResetStreak(state.lastDailyClaimTime)) {
      newStreak = 0;
    }

    // Increment streak (1-7, then loops)
    newStreak = (newStreak % 7) + 1;

    // Get reward for current streak day
    const reward = getDailyReward(newStreak);

    // Apply rewards
    let newGold = state.gold;
    let newResources = { ...state.gathering.resources };

    for (const r of reward.rewards) {
      switch (r.type) {
        case 'gold':
          newGold += r.amount;
          break;
        case 'skill_points':
          get().addSkillPoints(r.amount);
          break;
        case 'prestige_points':
          set({
            prestige: {
              ...state.prestige,
              prestigePoints: state.prestige.prestigePoints + r.amount,
              totalPrestigePoints: state.prestige.totalPrestigePoints + r.amount,
            },
          });
          break;
        case 'resource':
          if (r.resourceType) {
            const cap = state.gathering.resourceCaps[r.resourceType];
            newResources[r.resourceType] = Math.min(
              newResources[r.resourceType] + r.amount,
              cap
            );
          }
          break;
      }
    }

    set({
      gold: newGold,
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
      dailyRewardStreak: newStreak,
      lastDailyClaimTime: Date.now(),
      showDailyRewardModal: false,
    });
  },

  checkDailyReward: () => {
    const state = get();
    if (canClaimToday(state.lastDailyClaimTime) && !state.showDailyRewardModal) {
      set({ showDailyRewardModal: true });
    }
  },

  setShowDailyRewardModal: (show) => {
    set({ showDailyRewardModal: show });
  },

  // Quest System
  checkQuestReset: () => {
    const state = get();
    const now = Date.now();
    let needsUpdate = false;
    let newDailyQuests = state.quests.dailyQuests;
    let newWeeklyQuests = state.quests.weeklyQuests;
    let newLastDailyReset = state.quests.lastDailyReset;
    let newLastWeeklyReset = state.quests.lastWeeklyReset;

    // Check daily reset
    if (needsDailyReset(state.quests.lastDailyReset) || state.quests.dailyQuests.length === 0) {
      const selectedDaily = selectRandomQuests(DAILY_QUEST_POOL, DAILY_QUEST_COUNT);
      newDailyQuests = selectedDaily.map(createActiveQuest);
      newLastDailyReset = now;
      needsUpdate = true;
    }

    // Check weekly reset
    if (needsWeeklyReset(state.quests.lastWeeklyReset) || state.quests.weeklyQuests.length === 0) {
      const selectedWeekly = selectRandomQuests(WEEKLY_QUEST_POOL, WEEKLY_QUEST_COUNT);
      newWeeklyQuests = selectedWeekly.map(createActiveQuest);
      newLastWeeklyReset = now;
      needsUpdate = true;
    }

    if (needsUpdate) {
      set({
        quests: {
          dailyQuests: newDailyQuests,
          weeklyQuests: newWeeklyQuests,
          lastDailyReset: newLastDailyReset,
          lastWeeklyReset: newLastWeeklyReset,
        },
      });
    }
  },

  updateQuestProgress: (objectiveType: string, amount: number, resourceType?: ResourceType) => {
    const state = get();

    const updateQuests = (quests: ActiveQuestData[]): ActiveQuestData[] => {
      return quests.map((quest) => {
        if (quest.completed || quest.claimed) return quest;

        const questDef = getQuestById(quest.questId);
        if (!questDef) return quest;

        // Check if this quest matches the objective type
        if (questDef.objective.type !== objectiveType) return quest;

        // For resource collection, also check resource type
        if (objectiveType === 'collect_resource' && questDef.objective.resourceType !== resourceType) {
          return quest;
        }

        const newProgress = quest.progress + amount;
        const completed = newProgress >= questDef.objective.target;

        return {
          ...quest,
          progress: Math.min(newProgress, questDef.objective.target),
          completed,
        };
      });
    };

    set({
      quests: {
        ...state.quests,
        dailyQuests: updateQuests(state.quests.dailyQuests),
        weeklyQuests: updateQuests(state.quests.weeklyQuests),
      },
    });
  },

  claimQuestReward: (questId: string, isDaily: boolean) => {
    const state = get();
    const questList = isDaily ? state.quests.dailyQuests : state.quests.weeklyQuests;
    const quest = questList.find((q) => q.questId === questId);

    if (!quest || !quest.completed || quest.claimed) return false;

    const questDef = getQuestById(questId);
    if (!questDef) return false;

    // Apply rewards
    let newGold = state.gold;
    const newResources = { ...state.gathering.resources };
    let newSkillPoints = state.skills.skillPoints;
    let newPrestigePoints = state.prestige.prestigePoints;

    if (questDef.reward.gold) {
      newGold += questDef.reward.gold;
    }

    if (questDef.reward.resources) {
      for (const [resource, amount] of Object.entries(questDef.reward.resources)) {
        newResources[resource as ResourceType] = Math.min(
          newResources[resource as ResourceType] + amount,
          state.gathering.resourceCaps[resource as ResourceType]
        );
      }
    }

    if (questDef.reward.skillPoints) {
      newSkillPoints += questDef.reward.skillPoints;
    }

    if (questDef.reward.prestigePoints) {
      newPrestigePoints += questDef.reward.prestigePoints;
    }

    // Mark quest as claimed
    const updatedQuests = questList.map((q) =>
      q.questId === questId ? { ...q, claimed: true } : q
    );

    set({
      gold: newGold,
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
      skills: {
        ...state.skills,
        skillPoints: newSkillPoints,
      },
      prestige: {
        ...state.prestige,
        prestigePoints: newPrestigePoints,
      },
      quests: {
        ...state.quests,
        [isDaily ? 'dailyQuests' : 'weeklyQuests']: updatedQuests,
      },
    });

    return true;
  },

  getActiveQuests: () => {
    const state = get();
    return {
      daily: state.quests.dailyQuests,
      weekly: state.quests.weeklyQuests,
    };
  },

  // Auto-consume
  setAutoConsume: (enabled: boolean, threshold?: number, slotId?: string | null) => {
    const state = get();
    set({
      autoConsumeEnabled: enabled,
      autoConsumeThreshold: threshold !== undefined ? threshold : state.autoConsumeThreshold,
      autoConsumeSlot: slotId !== undefined ? slotId : state.autoConsumeSlot,
    });
  },

  tickAutoConsume: () => {
    const state = get();

    // Check if auto-consume is enabled and configured
    if (!state.autoConsumeEnabled || !state.autoConsumeSlot) return;

    // Check if player is dead or no enemy
    if (state.isPlayerDead) return;

    // Check HP threshold
    const hpPercent = state.player.currentHp / state.player.maxHp;
    if (hpPercent >= state.autoConsumeThreshold) return;

    // Check if consumable is available
    const consumableStack = state.consumables.find((c) => c.consumableId === state.autoConsumeSlot);
    if (!consumableStack || consumableStack.amount <= 0) return;

    // Check if the consumable is a healing item
    const consumable = getConsumableById(state.autoConsumeSlot);
    if (!consumable || consumable.effect.type !== 'heal') return;

    // Use the consumable
    get().useConsumable(state.autoConsumeSlot);
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

  sellItem: (itemId: string) => {
    const state = get();
    const item = state.inventory.find((i) => i.id === itemId);
    if (!item) return false;

    // Calculate sell price based on rarity and level
    const rarityMultipliers: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 75,
      epic: 200,
      legendary: 500,
    };
    const basePrice = rarityMultipliers[item.rarity] || 10;
    const sellPrice = Math.floor(basePrice * (1 + item.level * 0.1));

    set({
      inventory: state.inventory.filter((i) => i.id !== itemId),
      gold: state.gold + sellPrice,
      totalGoldEarned: state.totalGoldEarned + sellPrice,
      statistics: {
        ...state.statistics,
        totalGoldEarned: state.statistics.totalGoldEarned + sellPrice,
      },
    });

    return true;
  },

  // Bulk sell by rarity
  sellAllByRarity: (rarity: Rarity) => {
    const state = get();
    const itemsToSell = state.inventory.filter((i) => i.rarity === rarity);

    if (itemsToSell.length === 0) return { count: 0, gold: 0 };

    const rarityMultipliers: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 75,
      epic: 200,
      legendary: 500,
    };

    let totalGold = 0;
    for (const item of itemsToSell) {
      const basePrice = rarityMultipliers[item.rarity] || 10;
      const sellPrice = Math.floor(basePrice * (1 + item.level * 0.1));
      totalGold += sellPrice;
    }

    const remainingInventory = state.inventory.filter((i) => i.rarity !== rarity);

    set({
      inventory: remainingInventory,
      gold: state.gold + totalGold,
      totalGoldEarned: state.totalGoldEarned + totalGold,
      statistics: {
        ...state.statistics,
        totalGoldEarned: state.statistics.totalGoldEarned + totalGold,
      },
    });

    return { count: itemsToSell.length, gold: totalGold };
  },

  // Bulk sell all items up to and including a rarity (e.g., common + uncommon)
  sellAllUpToRarity: (maxRarity: Rarity) => {
    const state = get();
    const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const maxIndex = rarityOrder.indexOf(maxRarity);

    const itemsToSell = state.inventory.filter((i) => {
      const itemIndex = rarityOrder.indexOf(i.rarity);
      return itemIndex <= maxIndex;
    });

    if (itemsToSell.length === 0) return { count: 0, gold: 0 };

    const rarityMultipliers: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 75,
      epic: 200,
      legendary: 500,
    };

    let totalGold = 0;
    for (const item of itemsToSell) {
      const basePrice = rarityMultipliers[item.rarity] || 10;
      const sellPrice = Math.floor(basePrice * (1 + item.level * 0.1));
      totalGold += sellPrice;
    }

    const remainingInventory = state.inventory.filter((i) => {
      const itemIndex = rarityOrder.indexOf(i.rarity);
      return itemIndex > maxIndex;
    });

    set({
      inventory: remainingInventory,
      gold: state.gold + totalGold,
      totalGoldEarned: state.totalGoldEarned + totalGold,
      statistics: {
        ...state.statistics,
        totalGoldEarned: state.statistics.totalGoldEarned + totalGold,
      },
    });

    return { count: itemsToSell.length, gold: totalGold };
  },

  // Get inventory value by rarity for preview
  getInventoryValueByRarity: (rarity: Rarity) => {
    const state = get();
    const items = state.inventory.filter((i) => i.rarity === rarity);

    const rarityMultipliers: Record<string, number> = {
      common: 10,
      uncommon: 25,
      rare: 75,
      epic: 200,
      legendary: 500,
    };

    let totalGold = 0;
    for (const item of items) {
      const basePrice = rarityMultipliers[item.rarity] || 10;
      const sellPrice = Math.floor(basePrice * (1 + item.level * 0.1));
      totalGold += sellPrice;
    }

    return { count: items.length, gold: totalGold };
  },

  // Equipment Enhancement
  getEnhancementCost: (itemId: string) => {
    const state = get();
    // Check inventory first, then equipped items
    let item = state.inventory.find((i) => i.id === itemId);
    if (!item) {
      // Check equipped items
      for (const slot of Object.keys(state.equipment) as EquipmentSlotType[]) {
        const equipped = state.equipment[slot];
        if (equipped?.id === itemId) {
          item = equipped;
          break;
        }
      }
    }
    if (!item) return null;

    return getEnhancementCostFromData(item.slot, item.rarity, item.enhancementLevel || 0);
  },

  canEnhanceEquipment: (itemId: string) => {
    const state = get();
    // Find the item
    let item = state.inventory.find((i) => i.id === itemId);
    if (!item) {
      for (const slot of Object.keys(state.equipment) as EquipmentSlotType[]) {
        const equipped = state.equipment[slot];
        if (equipped?.id === itemId) {
          item = equipped;
          break;
        }
      }
    }
    if (!item) return false;

    // Check if at max level
    if (isMaxEnhancement(item.rarity, item.enhancementLevel || 0)) return false;

    // Check if can afford
    const cost = getEnhancementCostFromData(item.slot, item.rarity, item.enhancementLevel || 0);
    if (state.gold < cost.gold) return false;

    for (const [resource, amount] of Object.entries(cost.resources)) {
      if (state.gathering.resources[resource as ResourceType] < amount) {
        return false;
      }
    }

    return true;
  },

  enhanceEquipment: (itemId: string) => {
    const state = get();

    // Find the item (in inventory or equipped)
    let item = state.inventory.find((i) => i.id === itemId);
    let isEquipped = false;
    let equippedSlot: EquipmentSlotType | null = null;

    if (!item) {
      for (const slot of Object.keys(state.equipment) as EquipmentSlotType[]) {
        const equipped = state.equipment[slot];
        if (equipped?.id === itemId) {
          item = equipped;
          isEquipped = true;
          equippedSlot = slot;
          break;
        }
      }
    }

    if (!item) {
      return { success: false, message: '找不到裝備' };
    }

    const currentLevel = item.enhancementLevel || 0;

    // Check max level
    if (isMaxEnhancement(item.rarity, currentLevel)) {
      return { success: false, message: '已達最大強化等級' };
    }

    // Calculate and check costs
    const cost = getEnhancementCostFromData(item.slot, item.rarity, currentLevel);

    if (state.gold < cost.gold) {
      return { success: false, message: '金幣不足' };
    }

    for (const [resource, amount] of Object.entries(cost.resources)) {
      if (state.gathering.resources[resource as ResourceType] < amount) {
        return { success: false, message: `${resource} 不足` };
      }
    }

    // Deduct costs
    const newResources = { ...state.gathering.resources };
    for (const [resource, amount] of Object.entries(cost.resources)) {
      newResources[resource as ResourceType] -= amount;
    }

    // Roll for success
    const successRate = getEnhancementSuccessRate(currentLevel);
    const roll = Math.random();
    const isSuccess = roll < successRate;

    if (!isSuccess) {
      // Enhancement failed - still consume resources
      set({
        gold: state.gold - cost.gold,
        gathering: {
          ...state.gathering,
          resources: newResources,
        },
        statistics: {
          ...state.statistics,
          enhancementsAttempted: state.statistics.enhancementsAttempted + 1,
        },
      });
      return { success: false, message: `強化失敗！(成功率 ${Math.round(successRate * 100)}%)` };
    }

    // Enhancement succeeded - upgrade the item
    const enhancedItem: Equipment = {
      ...item,
      enhancementLevel: currentLevel + 1,
      // Update stats based on enhancement
      stats: {
        ...item.stats,
        atk: item.stats.atk ? Math.floor(item.stats.atk * 1.1) : undefined,
        def: item.stats.def ? Math.floor(item.stats.def * 1.1) : undefined,
        maxHp: item.stats.maxHp ? Math.floor(item.stats.maxHp * 1.1) : undefined,
        attackSpeed: item.stats.attackSpeed ? item.stats.attackSpeed + 0.01 : undefined,
        critChance: item.stats.critChance ? item.stats.critChance + 0.01 : undefined,
        critMultiplier: item.stats.critMultiplier ? item.stats.critMultiplier + 0.05 : undefined,
      },
    };

    if (isEquipped && equippedSlot) {
      // Update equipped item
      set({
        gold: state.gold - cost.gold,
        gathering: {
          ...state.gathering,
          resources: newResources,
        },
        equipment: {
          ...state.equipment,
          [equippedSlot]: enhancedItem,
        },
      });
    } else {
      // Update inventory item
      set({
        gold: state.gold - cost.gold,
        gathering: {
          ...state.gathering,
          resources: newResources,
        },
        inventory: state.inventory.map((i) => (i.id === itemId ? enhancedItem : i)),
      });
    }

    // Recalculate stats if equipped
    if (isEquipped) {
      get().recalculateStats();
    }

    // Update quest progress for successful enhancement
    get().updateQuestProgress('enhance_equipment', 1);

    // Update enhancement statistics
    set((s) => ({
      statistics: {
        ...s.statistics,
        enhancementsAttempted: s.statistics.enhancementsAttempted + 1,
      },
    }));

    return {
      success: true,
      message: `強化成功！+${currentLevel + 1} (成功率 ${Math.round(successRate * 100)}%)`
    };
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
    const { gathering, statistics } = state;
    const now = Date.now();

    // Calculate progress for each worker based on tick interval
    const newWorkers = { ...gathering.workers };
    const newResources = { ...gathering.resources };
    const resourcesGainedThisTick: Partial<Record<ResourceType, number>> = {};
    let hasChanges = false;

    for (const workerType of ALL_WORKERS) {
      const worker = newWorkers[workerType];
      const interval = getWorkerInterval(worker.level);
      // Progress per tick: TICK_INTERVAL ms / (interval seconds * 1000 ms)
      const progressPerTick = TICK_INTERVAL / (interval * 1000);
      const newProgress = worker.progress + progressPerTick;

      if (newProgress >= 1) {
        // Gathered a resource
        const resourceType: ResourceType = workerType === 'miner' ? 'ore' :
                            workerType === 'lumberjack' ? 'wood' :
                            workerType === 'fisher' ? 'fish' : 'herb';
        const cap = gathering.resourceCaps[resourceType];
        const resourcesGained = Math.floor(newProgress);
        const oldAmount = newResources[resourceType];
        const newAmount = Math.min(cap, oldAmount + resourcesGained);
        const actualGained = newAmount - oldAmount;

        if (actualGained > 0) {
          newResources[resourceType] = newAmount;
          resourcesGainedThisTick[resourceType] = (resourcesGainedThisTick[resourceType] || 0) + actualGained;
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

      // Update statistics for resources collected
      const newResourcesCollected = { ...statistics.resourcesCollected };
      let totalGainedThisTick = 0;
      for (const [resource, amount] of Object.entries(resourcesGainedThisTick)) {
        newResourcesCollected[resource as ResourceType] += amount;
        totalGainedThisTick += amount;
      }

      set({
        gathering: {
          ...gathering,
          workers: newWorkers,
          resources: newResources,
          lastGatherTime: now,
        },
        statistics: {
          ...statistics,
          resourcesCollected: newResourcesCollected,
          totalResourcesCollected: statistics.totalResourcesCollected + totalGainedThisTick,
        },
      });

      // Update quest progress for resource collection
      for (const [resource, amount] of Object.entries(resourcesGainedThisTick)) {
        get().updateQuestProgress('collect_resource', amount, resource as ResourceType);
      }
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

  // Resource cap upgrade
  upgradeResourceCap: () => {
    const state = get();
    const currentLevel = state.gathering.resourceCapLevel;
    const cost = getResourceCapUpgradeCost(currentLevel);

    if (currentLevel >= RESOURCE_CAP_UPGRADE.maxLevel) return false;
    if (state.gold < cost) return false;

    const newCap = getResourceCap(currentLevel + 1);
    const newResourceCaps: Record<ResourceType, number> = {} as Record<ResourceType, number>;
    for (const resourceType of ALL_RESOURCES) {
      newResourceCaps[resourceType] = newCap;
    }

    set({
      gold: state.gold - cost,
      gathering: {
        ...state.gathering,
        resourceCapLevel: currentLevel + 1,
        resourceCaps: newResourceCaps,
      },
    });
    return true;
  },

  getResourceCapUpgradeCost: () => {
    const state = get();
    return getResourceCapUpgradeCost(state.gathering.resourceCapLevel);
  },

  collectOfflineGathering: () => {
    const state = get();
    if (!state.offlineGathering) return;

    const newResources = { ...state.gathering.resources };
    const newResourcesCollected = { ...state.statistics.resourcesCollected };
    let totalCollected = 0;

    for (const resourceType of ALL_RESOURCES) {
      const amount = state.offlineGathering[resourceType] || 0;
      const cap = state.gathering.resourceCaps[resourceType];
      const actualAdded = Math.min(cap - newResources[resourceType], amount);
      newResources[resourceType] = Math.min(cap, newResources[resourceType] + amount);
      // Track statistics (count all gathered, even if capped)
      newResourcesCollected[resourceType] += amount;
      totalCollected += amount;
    }

    set({
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
      statistics: {
        ...state.statistics,
        resourcesCollected: newResourcesCollected,
        totalResourcesCollected: state.statistics.totalResourcesCollected + totalCollected,
      },
      offlineGathering: null,
    });

    // Check achievements after collecting
    get().checkAchievements();
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
    } else if (recipe.itemType === 'equipment') {
      // Get crafted equipment base stats
      const baseEquip = getCraftedEquipment(recipe.outputId);
      if (baseEquip) {
        // Check inventory space
        if (state.inventory.length >= get().getBackpackCapacity()) {
          return false; // Inventory full
        }

        // Create equipment item with uncommon rarity (crafted items are better than drops)
        const craftedItem: Equipment = {
          id: `crafted_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          baseId: baseEquip.id,
          name: baseEquip.name,
          slot: baseEquip.slot,
          rarity: 'uncommon', // Crafted items are uncommon quality
          stats: { ...baseEquip.baseStats },
          icon: baseEquip.icon,
          level: Math.max(1, Math.floor(state.stage.currentStage / 10)),
          enhancementLevel: 0,
        };

        // Add to inventory
        set({ inventory: [...state.inventory, craftedItem] });
      }
    }

    set({
      gold: newGold,
      gathering: {
        ...state.gathering,
        resources: newResources,
      },
      statistics: {
        ...state.statistics,
        itemsCrafted: state.statistics.itemsCrafted + 1,
      },
    });

    // Update quest progress
    get().updateQuestProgress('craft_items', 1);

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
    set({
      consumables: filteredConsumables,
      statistics: {
        ...state.statistics,
        consumablesUsed: state.statistics.consumablesUsed + 1,
      },
    });

    // Update quest progress
    get().updateQuestProgress('use_consumables', 1);

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

  // Skills System
  useSkill: (skillId: SkillId) => {
    const state = get();
    const skill = getSkillById(skillId);
    const level = state.skills.unlockedSkills[skillId];

    // Check if skill is unlocked
    if (level <= 0) return false;

    // Check if skill is ready (not on cooldown)
    if (!get().isSkillReady(skillId)) return false;

    // Check if in combat (has enemy)
    if (!state.currentEnemy && skill.baseEffect.type === 'instant_damage') return false;

    const effectValue = getSkillEffectValue(skill, level);

    // Apply skill effect
    switch (skill.baseEffect.type) {
      case 'instant_damage':
        if (state.currentEnemy) {
          const newEnemyHp = state.currentEnemy.currentHp - effectValue;
          get().addDamagePopup({
            value: effectValue,
            isCrit: false,
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
        }
        break;

      case 'instant_heal':
        const newHp = Math.min(state.player.maxHp, state.player.currentHp + effectValue);
        set({
          player: {
            ...state.player,
            currentHp: newHp,
          },
        });
        break;

      case 'buff_defense':
      case 'buff_attack_speed':
      case 'buff_crit':
      case 'buff_gold':
        const buffType = skill.baseEffect.type === 'buff_defense' ? 'defense' :
                         skill.baseEffect.type === 'buff_attack_speed' ? 'attack_speed' :
                         skill.baseEffect.type === 'buff_crit' ? 'crit' : 'gold';
        const newBuff: SkillBuff = {
          id: generateId(),
          skillId,
          type: buffType,
          multiplier: 1 + effectValue / 100,
          expiresAt: Date.now() + (skill.baseEffect.duration || 5000),
        };
        // Remove existing buff of same type and add new one
        const newBuffs = state.skillBuffs.filter((b) => b.type !== buffType);
        newBuffs.push(newBuff);
        set({ skillBuffs: newBuffs });
        break;
    }

    // Set cooldown and track statistics
    set({
      skills: {
        ...state.skills,
        cooldowns: {
          ...state.skills.cooldowns,
          [skillId]: Date.now() + skill.cooldown,
        },
      },
      statistics: {
        ...state.statistics,
        skillsUsed: state.statistics.skillsUsed + 1,
      },
    });

    // Update quest progress
    get().updateQuestProgress('use_skills', 1);

    return true;
  },

  upgradeSkill: (skillId: SkillId) => {
    const state = get();
    const skill = getSkillById(skillId);
    const currentLevel = state.skills.unlockedSkills[skillId];

    // Check max level
    if (currentLevel >= skill.maxLevel) return false;

    // Check cost
    const cost = getSkillUpgradeCost(skill, currentLevel);
    if (state.skills.skillPoints < cost) return false;

    set({
      skills: {
        ...state.skills,
        unlockedSkills: {
          ...state.skills.unlockedSkills,
          [skillId]: currentLevel + 1,
        },
        skillPoints: state.skills.skillPoints - cost,
      },
    });

    return true;
  },

  isSkillReady: (skillId: SkillId) => {
    const state = get();
    const cooldownEnd = state.skills.cooldowns[skillId] || 0;
    return Date.now() >= cooldownEnd;
  },

  getSkillCooldownRemaining: (skillId: SkillId) => {
    const state = get();
    const cooldownEnd = state.skills.cooldowns[skillId] || 0;
    return Math.max(0, cooldownEnd - Date.now());
  },

  tickSkillBuffs: () => {
    const state = get();
    const now = Date.now();
    const expiredBuffs = state.skillBuffs.filter((b) => b.expiresAt <= now);

    if (expiredBuffs.length > 0) {
      const newBuffs = state.skillBuffs.filter((b) => b.expiresAt > now);
      set({ skillBuffs: newBuffs });
    }
  },

  getSkillBuffMultiplier: (buffType: 'defense' | 'attack_speed' | 'crit' | 'gold') => {
    const state = get();
    const buff = state.skillBuffs.find((b) => b.type === buffType);
    return buff ? buff.multiplier : 1.0;
  },

  addSkillPoints: (amount: number) => {
    const state = get();
    set({
      skills: {
        ...state.skills,
        skillPoints: state.skills.skillPoints + amount,
        totalSkillPointsEarned: state.skills.totalSkillPointsEarned + amount,
      },
    });
  },

  // Save/Load
  saveGame: async () => {
    const state = get();
    const saveData: SaveData = {
      version: '1.0.0',
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
      skills: state.skills,
      skillBuffs: state.skillBuffs,
      statistics: state.statistics,
      unlockedAchievements: state.unlockedAchievements,
      dailyRewardStreak: state.dailyRewardStreak,
      lastDailyClaimTime: state.lastDailyClaimTime,
      quests: state.quests,
      autoConsumeEnabled: state.autoConsumeEnabled,
      autoConsumeThreshold: state.autoConsumeThreshold,
      autoConsumeSlot: state.autoConsumeSlot,
    };

    try {
      // Save to local storage (primary)
      await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      set({ lastSaveTime: Date.now(), lastOnlineTime: Date.now() });

      // Save to cloud (secondary, non-blocking)
      if (firebaseService.isSignedIn()) {
        firebaseService.saveToCloud(saveData).catch((error) => {
          console.warn('Cloud save failed (non-blocking):', error);
        });
      }
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
      const defaultGathering = createDefaultGatheringState();
      const savedGathering = data.gathering
        ? {
            ...defaultGathering,
            ...data.gathering,
            // Ensure resourceCapLevel exists (added in v1.2.0)
            resourceCapLevel: data.gathering.resourceCapLevel ?? 0,
          }
        : defaultGathering;
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
        // Migrate equipment to include enhancementLevel (added in v1.2.0)
        equipment: migrateEquipmentSlots(data.equipment || emptyEquipmentSlots),
        inventory: (data.inventory || []).map(migrateEquipment),
        backpackLevel: data.backpackLevel || 0,
        unlockedAreas: savedUnlockedAreas,
        areaProgress: savedAreaProgress,
        gathering: savedGathering,
        consumables: data.consumables || [],
        activeBuffs: data.activeBuffs || [],
        prestige: data.prestige || createDefaultPrestigeState(),
        skills: data.skills || createDefaultSkillState(),
        skillBuffs: data.skillBuffs || [],
        statistics: migrateStatistics(data.statistics),
        unlockedAchievements: data.unlockedAchievements || [],
        dailyRewardStreak: data.dailyRewardStreak || 0,
        lastDailyClaimTime: data.lastDailyClaimTime || 0,
        quests: data.quests || createDefaultQuestState(),
        autoConsumeEnabled: data.autoConsumeEnabled || false,
        autoConsumeThreshold: data.autoConsumeThreshold || 0.3,
        autoConsumeSlot: data.autoConsumeSlot || null,
      });

      // Recalculate stats with prestige bonuses
      get().recalculateStats();
      get().calculateOfflineReward();
      // Check for daily reward availability
      get().checkDailyReward();
      // Check for quest reset
      get().checkQuestReset();
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
