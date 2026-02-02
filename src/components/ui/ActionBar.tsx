import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { getConsumableById } from '../../data/consumables';
import { SKILLS, ALL_SKILL_IDS } from '../../data/skills';
import { COLORS, FONT_SIZES, scale } from '../../constants/theme';
import type { SkillId } from '../../types';

// Small skill button for compact display
const SkillButton = React.memo<{
  skillId: SkillId;
  level: number;
  cooldownRemaining: number;
  isReady: boolean;
  onPress: () => void;
}>(({ skillId, level, cooldownRemaining, isReady, onPress }) => {
  const skill = SKILLS[skillId];
  const isUnlocked = level > 0;

  const cooldownPercent = isUnlocked && !isReady
    ? cooldownRemaining / skill.cooldown
    : 0;

  return (
    <Pressable
      style={[
        styles.actionButton,
        styles.skillButton,
        !isUnlocked && styles.locked,
        !isReady && isUnlocked && styles.onCooldown,
      ]}
      onPress={onPress}
      disabled={!isUnlocked || !isReady}
    >
      {isUnlocked && !isReady && (
        <View style={[styles.cooldownOverlay, { height: `${cooldownPercent * 100}%` }]} />
      )}
      <Text style={styles.buttonIcon}>{skill.icon}</Text>
      {isUnlocked && <Text style={styles.levelBadge}>{level}</Text>}
    </Pressable>
  );
});

// Small consumable button
const ConsumableButton = React.memo<{
  consumableId: string;
  amount: number;
  onPress: () => void;
}>(({ consumableId, amount, onPress }) => {
  const consumable = getConsumableById(consumableId);
  if (!consumable) return null;

  return (
    <TouchableOpacity
      style={[styles.actionButton, styles.consumableButton]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonIcon}>{consumable.icon}</Text>
      <Text style={styles.amountBadge}>{amount}</Text>
    </TouchableOpacity>
  );
});

export const ActionBar = React.memo(() => {
  const skills = useGameStore((state) => state.skills);
  const consumables = useGameStore((state) => state.consumables);
  const activeBuffs = useGameStore((state) => state.activeBuffs);
  const useSkill = useGameStore((state) => state.useSkill);
  const useConsumable = useGameStore((state) => state.useConsumable);
  const isSkillReady = useGameStore((state) => state.isSkillReady);
  const getSkillCooldownRemaining = useGameStore((state) => state.getSkillCooldownRemaining);

  const handleSkillPress = useCallback((skillId: SkillId) => {
    useSkill(skillId);
  }, [useSkill]);

  const handleConsumablePress = useCallback((consumableId: string) => {
    useConsumable(consumableId);
  }, [useConsumable]);

  // Get unlocked skills (max 3 for display)
  const unlockedSkills = ALL_SKILL_IDS.filter((id) => skills.unlockedSkills[id] > 0).slice(0, 3);

  // Get consumables (max 2 for display)
  const displayConsumables = consumables.slice(0, 2);

  // Format buff time
  const formatBuffTime = (expiresAt: number) => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    return `${remaining}s`;
  };

  return (
    <View style={styles.container}>
      {/* Active Buffs */}
      {activeBuffs.length > 0 && (
        <View style={styles.buffsRow}>
          {activeBuffs.map((buff) => {
            const consumable = getConsumableById(buff.sourceId);
            return (
              <View key={buff.id} style={styles.buffBadge}>
                <Text style={styles.buffIcon}>{consumable?.icon || '✨'}</Text>
                <Text style={styles.buffTime}>{formatBuffTime(buff.expiresAt)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Main Action Row */}
      <View style={styles.actionRow}>
        {/* Consumables */}
        {displayConsumables.map((stack) => (
          <ConsumableButton
            key={stack.consumableId}
            consumableId={stack.consumableId}
            amount={stack.amount}
            onPress={() => handleConsumablePress(stack.consumableId)}
          />
        ))}

        {/* SP indicator */}
        <View style={styles.spContainer}>
          <Text style={styles.spText}>SP:{skills.skillPoints}</Text>
        </View>

        {/* Skills */}
        {unlockedSkills.map((skillId) => (
          <SkillButton
            key={skillId}
            skillId={skillId}
            level={skills.unlockedSkills[skillId]}
            cooldownRemaining={getSkillCooldownRemaining(skillId)}
            isReady={isSkillReady(skillId)}
            onPress={() => handleSkillPress(skillId)}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
  },
  buffsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
    marginBottom: scale(2),
  },
  buffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    paddingHorizontal: scale(6),
    paddingVertical: scale(1),
    borderRadius: scale(10),
    gap: scale(2),
  },
  buffIcon: {
    fontSize: scale(12),
  },
  buffTime: {
    color: COLORS.textGold,
    fontSize: scale(9),
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(6),
  },
  actionButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  skillButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.buttonPrimary,
  },
  consumableButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.uncommon,
  },
  locked: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.textDim,
    opacity: 0.4,
  },
  onCooldown: {
    opacity: 0.6,
  },
  cooldownOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  buttonIcon: {
    fontSize: scale(18),
  },
  levelBadge: {
    position: 'absolute',
    bottom: scale(1),
    right: scale(2),
    fontSize: scale(8),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  amountBadge: {
    position: 'absolute',
    bottom: scale(1),
    right: scale(2),
    fontSize: scale(8),
    color: COLORS.text,
    fontWeight: 'bold',
    backgroundColor: COLORS.bg,
    paddingHorizontal: scale(2),
    borderRadius: scale(2),
  },
  spContainer: {
    paddingHorizontal: scale(6),
  },
  spText: {
    fontSize: scale(10),
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
});
