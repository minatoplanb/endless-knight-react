import { PlayerStats, Enemy } from '../types';

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  targetDied: boolean;
  remainingHp: number;
}

export const CombatSystem = {
  // Calculate area efficiency based on player level vs area requirement
  // Returns a value between 0 and 1 (higher = more efficient)
  calculateAreaEfficiency: (playerLevel: number, areaRequiredLevel: number): number => {
    if (areaRequiredLevel === 0) return 1.0; // Starting area has no penalty
    return playerLevel / (playerLevel + areaRequiredLevel);
  },

  calculatePlayerDamage: (player: PlayerStats, enemy: Enemy, areaEfficiency: number = 1.0): DamageResult => {
    const isCrit = Math.random() < player.critChance;
    // Apply area efficiency to attack, then subtract enemy defense
    const effectiveAtk = Math.floor(player.atk * areaEfficiency);
    let damage = Math.max(1, effectiveAtk - enemy.def);

    if (isCrit) {
      damage = Math.floor(damage * player.critMultiplier);
    }

    const remainingHp = Math.max(0, enemy.currentHp - damage);
    const targetDied = remainingHp <= 0;

    return { damage, isCrit, targetDied, remainingHp };
  },

  calculateEnemyDamage: (enemy: Enemy, player: PlayerStats): DamageResult => {
    const damage = Math.max(1, enemy.atk - player.def);
    const remainingHp = Math.max(0, player.currentHp - damage);
    const targetDied = remainingHp <= 0;

    return { damage, isCrit: false, targetDied, remainingHp };
  },

  calculateDPS: (player: PlayerStats): number => {
    const baseDamage = player.atk;
    const critDamage = baseDamage * player.critMultiplier;
    const avgDamage = baseDamage * (1 - player.critChance) + critDamage * player.critChance;
    return avgDamage * player.attackSpeed;
  },

  calculateEHP: (player: PlayerStats): number => {
    // Effective HP considering defense
    // Simple formula: each point of def reduces damage by 1
    return player.maxHp;
  },
};
