import { PlayerStats, Enemy } from '../types';

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  targetDied: boolean;
  remainingHp: number;
}

export const CombatSystem = {
  calculatePlayerDamage: (player: PlayerStats, enemy: Enemy): DamageResult => {
    const isCrit = Math.random() < player.critChance;
    const enemyDef = Math.floor(enemy.atk * 0.1); // Enemies have 10% of atk as def
    let damage = Math.max(1, player.atk - enemyDef);

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
