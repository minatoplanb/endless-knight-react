// Daily Rewards System - Login bonuses that increase with streak

export interface DailyReward {
  day: number; // 1-7
  rewards: {
    type: 'gold' | 'skill_points' | 'prestige_points' | 'resource';
    amount: number;
    resourceType?: 'ore' | 'wood' | 'fish' | 'herb'; // Only for resource type
  }[];
  description: string;
}

// 7-day reward cycle
export const DAILY_REWARDS: DailyReward[] = [
  {
    day: 1,
    rewards: [{ type: 'gold', amount: 500 }],
    description: '500 金幣',
  },
  {
    day: 2,
    rewards: [
      { type: 'gold', amount: 750 },
      { type: 'resource', amount: 50, resourceType: 'ore' },
    ],
    description: '750 金幣 + 50 礦石',
  },
  {
    day: 3,
    rewards: [
      { type: 'gold', amount: 1000 },
      { type: 'resource', amount: 50, resourceType: 'wood' },
    ],
    description: '1000 金幣 + 50 木材',
  },
  {
    day: 4,
    rewards: [
      { type: 'gold', amount: 1500 },
      { type: 'skill_points', amount: 1 },
    ],
    description: '1500 金幣 + 1 技能點',
  },
  {
    day: 5,
    rewards: [
      { type: 'gold', amount: 2000 },
      { type: 'resource', amount: 50, resourceType: 'fish' },
      { type: 'resource', amount: 50, resourceType: 'herb' },
    ],
    description: '2000 金幣 + 50 魚獲 + 50 草藥',
  },
  {
    day: 6,
    rewards: [
      { type: 'gold', amount: 3000 },
      { type: 'skill_points', amount: 2 },
    ],
    description: '3000 金幣 + 2 技能點',
  },
  {
    day: 7,
    rewards: [
      { type: 'gold', amount: 5000 },
      { type: 'skill_points', amount: 3 },
      { type: 'prestige_points', amount: 1 },
    ],
    description: '5000 金幣 + 3 技能點 + 1 轉生點',
  },
];

// Get reward for a specific day (1-7)
export const getDailyReward = (day: number): DailyReward => {
  const index = ((day - 1) % 7); // 0-6
  return DAILY_REWARDS[index];
};

// Calculate hours until next reset (resets at midnight local time)
export const getHoursUntilReset = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const msUntilReset = tomorrow.getTime() - now.getTime();
  return Math.ceil(msUntilReset / (1000 * 60 * 60));
};

// Check if two timestamps are on different days (local time)
export const isDifferentDay = (timestamp1: number, timestamp2: number): boolean => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);

  return (
    date1.getFullYear() !== date2.getFullYear() ||
    date1.getMonth() !== date2.getMonth() ||
    date1.getDate() !== date2.getDate()
  );
};

// Check if streak should be reset (missed a day)
export const shouldResetStreak = (lastClaimTime: number): boolean => {
  if (lastClaimTime === 0) return false; // Never claimed, no streak to reset

  const now = new Date();
  const lastClaim = new Date(lastClaimTime);

  // Get the date components
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastDate = new Date(lastClaim.getFullYear(), lastClaim.getMonth(), lastClaim.getDate());

  // Calculate days between (should be 1 for consecutive days)
  const daysDiff = Math.floor((nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // If more than 1 day has passed, reset streak
  return daysDiff > 1;
};

// Check if reward can be claimed today
export const canClaimToday = (lastClaimTime: number): boolean => {
  if (lastClaimTime === 0) return true; // Never claimed
  return isDifferentDay(lastClaimTime, Date.now());
};
