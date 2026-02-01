import { OFFLINE, ENEMY_SCALING } from '../constants/game';

export interface OfflineRewardResult {
  gold: number;
  timeOffline: number; // seconds
  cappedTime: number; // seconds (after cap applied)
}

export const OfflineSystem = {
  calculateReward: (lastOnlineTime: number, currentStage: number): OfflineRewardResult => {
    const now = Date.now();
    const timeOffline = (now - lastOnlineTime) / 1000; // Convert to seconds

    if (timeOffline < OFFLINE.minOfflineSeconds) {
      return {
        gold: 0,
        timeOffline,
        cappedTime: 0,
      };
    }

    const cappedTime = Math.min(timeOffline, OFFLINE.maxHours * 3600);
    const goldPerEnemy = Math.floor(
      ENEMY_SCALING.goldBase * Math.pow(ENEMY_SCALING.goldMultiplier, currentStage - 1)
    );

    // Assume player kills ~0.5 enemies per second when online
    const enemiesPerSecond = 0.5;
    const gold = Math.floor(goldPerEnemy * enemiesPerSecond * cappedTime * OFFLINE.efficiency);

    return {
      gold,
      timeOffline,
      cappedTime,
    };
  },

  formatOfflineTime: (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.floor(seconds)} 秒`;
    }
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes} 分鐘`;
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} 小時 ${minutes} 分鐘`;
  },
};
