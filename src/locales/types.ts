export type Locale = 'zh' | 'en';

export type LocaleStrings = {
  nav: {
    battle: string;
    gathering: string;
    crafting: string;
    equipment: string;
    skills: string;
    quests: string;
    prestige: string;
  };
  common: {
    cancel: string;
    clear: string;
    confirm: string;
    save: string;
    level: string;
    lv: string;
    stage: string;
    stageSuffix: string;
    unknownArea: string;
    unselected: string;
  };
  settings: {
    title: string;
    language: string;
    languageDesc: string;
    languageZh: string;
    languageEn: string;
    autoConsume: string;
    autoConsumeDesc: string;
    selectConsumable: string;
    selectConsumableMessage: string;
    selectThreshold: string;
    selectThresholdMessage: string;
    noHealingItems: string;
    noHealingItemsDesc: string;
    clearSelection: string;
    saved: string;
    savedDesc: string;
    resetGame: string;
    resetConfirm: string;
    resetButton: string;
    resetDone: string;
    resetDoneDesc: string;
    manualSave: string;
    manualSaveDesc: string;
    statistics: string;
    statisticsDesc: string;
    achievements: string;
    achievementsDesc: string;
    about: string;
    aboutDesc: string;
    privacy: string;
    version: string;
    sectionGame: string;
    sectionAutoConsume: string;
    sectionVersion: string;
    sectionDanger: string;
    enableAutoConsume: string;
    hpThreshold: string;
    selectItem: string;
    triggerBelow: string;
    gameVersion: string;
    totalKills: string;
    totalGold: string;
    resetDesc: string;
    playtime: string;
  };
  modals: {
    death: {
      title: string;
      message: string;
      info: string;
      revive: string;
      stage: string;
    };
    offline: {
      title: string;
      earned: string;
      timeAway: string;
      claim: string;
    };
    daily: {
      title: string;
      day: string;
      claim: string;
    };
    loot: {
      title: string;
      equip: string;
      sell: string;
      discard: string;
    };
    achievement: {
      unlocked: string;
      reward: string;
    };
  };
  battle: {
    upgrade: string;
    upgradeHp: string;
    upgradeAtk: string;
    upgradeDef: string;
    upgradeSpeed: string;
    upgradeCrit: string;
    cost: string;
    maxLevel: string;
    recommended: string;
    traveling: string;
    warrior: string;
    hpDesc: string;
    atkDesc: string;
    defDesc: string;
    speedDesc: string;
    critDesc: string;
  };
  prestige: {
    title: string;
    points: string;
    upgrade: string;
    confirm: string;
  };
  gathering: {
    workers: string;
    resource: string;
    upgrade: string;
  };
  equipment: {
    equip: string;
    enhance: string;
    sell: string;
    backpack: string;
    slots: string;
  };
  skills: {
    title: string;
    points: string;
    cooldown: string;
  };
  quests: {
    daily: string;
    weekly: string;
    claim: string;
    resetIn: string;
  };
  stats: {
    title: string;
  };
  achievements: {
    title: string;
  };
};
