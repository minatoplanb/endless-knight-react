import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, FONT_SIZES, SPACING, scale } from '../../constants/theme';

interface BuffItemProps {
  icon: string;
  name: string;
  remainingMs: number;
  color: string;
}

const BuffItem = React.memo<BuffItemProps>(({ icon, name, remainingMs, color }) => {
  const seconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const displayTime = minutes > 0 ? `${minutes}:${(seconds % 60).toString().padStart(2, '0')}` : `${seconds}s`;

  return (
    <View style={[styles.buffItem, { borderColor: color }]}>
      <Text style={styles.buffIcon}>{icon}</Text>
      <View style={styles.buffInfo}>
        <Text style={[styles.buffName, { color }]} numberOfLines={1}>{name}</Text>
        <Text style={styles.buffTime}>{displayTime}</Text>
      </View>
    </View>
  );
});

// Map buff types to display info
const BUFF_INFO: Record<string, { icon: string; name: string; color: string }> = {
  // Consumable buffs
  atk: { icon: '⚔️', name: '攻擊', color: '#ef4444' },
  def: { icon: '🛡️', name: '防禦', color: '#3b82f6' },
  attackSpeed: { icon: '⚡', name: '攻速', color: '#eab308' },
  critChance: { icon: '💥', name: '暴擊', color: '#f97316' },
  // Skill buffs
  defense: { icon: '🛡️', name: '護盾', color: '#3b82f6' },
  attack_speed: { icon: '⚡', name: '狂暴', color: '#ef4444' },
  crit: { icon: '🎯', name: '鷹眼', color: '#22c55e' },
  gold: { icon: '💰', name: '黃金', color: '#fbbf24' },
};

export const BuffDisplay = React.memo(() => {
  const activeBuffs = useGameStore((state) => state.activeBuffs);
  const skillBuffs = useGameStore((state) => state.skillBuffs);
  const [now, setNow] = useState(Date.now());

  // Update every second to refresh countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Combine and filter active buffs
  const allBuffs: { key: string; icon: string; name: string; remainingMs: number; color: string }[] = [];

  // Add consumable buffs
  for (const buff of activeBuffs) {
    const remaining = buff.expiresAt - now;
    if (remaining > 0) {
      const info = BUFF_INFO[buff.buffType] || { icon: '✨', name: buff.buffType, color: COLORS.text };
      allBuffs.push({
        key: `consumable-${buff.id}`,
        icon: info.icon,
        name: info.name,
        remainingMs: remaining,
        color: info.color,
      });
    }
  }

  // Add skill buffs
  for (const buff of skillBuffs) {
    const remaining = buff.expiresAt - now;
    if (remaining > 0) {
      const info = BUFF_INFO[buff.type] || { icon: '✨', name: buff.type, color: COLORS.text };
      allBuffs.push({
        key: `skill-${buff.id}`,
        icon: info.icon,
        name: info.name,
        remainingMs: remaining,
        color: info.color,
      });
    }
  }

  // Don't render if no active buffs
  if (allBuffs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {allBuffs.map((buff) => (
        <BuffItem
          key={buff.key}
          icon={buff.icon}
          name={buff.name}
          remainingMs={buff.remainingMs}
          color={buff.color}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  buffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: scale(8),
    borderWidth: 1,
  },
  buffIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  buffInfo: {
    alignItems: 'flex-start',
  },
  buffName: {
    fontSize: FONT_SIZES.xs - 2,
    fontWeight: 'bold',
  },
  buffTime: {
    fontSize: FONT_SIZES.xs - 2,
    color: COLORS.textDim,
  },
});
