import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { SKILLS, ALL_SKILL_IDS, getSkillDescription } from '../../data/skills';
import { COLORS, FONT_SIZES, scale } from '../../constants/theme';
import type { SkillId } from '../../types';

interface SkillButtonProps {
  skillId: SkillId;
  level: number;
  cooldownRemaining: number;
  isReady: boolean;
  onPress: () => void;
}

const SkillButton = React.memo<SkillButtonProps>(
  ({ skillId, level, cooldownRemaining, isReady, onPress }) => {
    const skill = SKILLS[skillId];
    const isUnlocked = level > 0;

    const getCooldownText = () => {
      if (!isUnlocked) return '';
      if (isReady) return '';
      const seconds = Math.ceil(cooldownRemaining / 1000);
      return `${seconds}s`;
    };

    const cooldownPercent = isUnlocked && !isReady
      ? cooldownRemaining / skill.cooldown
      : 0;

    return (
      <Pressable
        style={[
          styles.skillButton,
          !isUnlocked && styles.skillLocked,
          !isReady && isUnlocked && styles.skillOnCooldown,
        ]}
        onPress={onPress}
        disabled={!isUnlocked || !isReady}
      >
        {/* Cooldown overlay */}
        {isUnlocked && !isReady && (
          <View
            style={[
              styles.cooldownOverlay,
              { height: `${cooldownPercent * 100}%` },
            ]}
          />
        )}
        <Text style={styles.skillIcon}>{skill.icon}</Text>
        {isUnlocked && (
          <Text style={styles.skillLevel}>Lv.{level}</Text>
        )}
        {!isUnlocked && (
          <Text style={styles.lockedText}>?</Text>
        )}
        {!isReady && isUnlocked && (
          <Text style={styles.cooldownText}>{getCooldownText()}</Text>
        )}
      </Pressable>
    );
  }
);

export const SkillBar = React.memo(() => {
  const skills = useGameStore((state) => state.skills);
  const skillBuffs = useGameStore((state) => state.skillBuffs);
  const useSkill = useGameStore((state) => state.useSkill);
  const isSkillReady = useGameStore((state) => state.isSkillReady);
  const getSkillCooldownRemaining = useGameStore((state) => state.getSkillCooldownRemaining);

  const handleSkillPress = useCallback(
    (skillId: SkillId) => {
      useSkill(skillId);
    },
    [useSkill]
  );

  // Only show unlocked skills or first locked skill as hint
  const visibleSkills = ALL_SKILL_IDS.filter((skillId) => {
    const level = skills.unlockedSkills[skillId];
    return level > 0;
  });

  // If no skills unlocked, show first 3 as locked hints
  const displaySkills =
    visibleSkills.length > 0
      ? visibleSkills
      : ALL_SKILL_IDS.slice(0, 3);

  return (
    <View style={styles.container}>
      <View style={styles.skillsRow}>
        {displaySkills.map((skillId) => (
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
      {/* Show skill points */}
      <View style={styles.pointsContainer}>
        <Text style={styles.pointsText}>
          SP: {skills.skillPoints}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  skillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(8),
  },
  skillButton: {
    width: scale(48),
    height: scale(48),
    backgroundColor: COLORS.panel,
    borderRadius: scale(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.buttonPrimary,
    overflow: 'hidden',
    position: 'relative',
  },
  skillLocked: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.textDim,
    opacity: 0.5,
  },
  skillOnCooldown: {
    opacity: 0.7,
  },
  cooldownOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  skillIcon: {
    fontSize: scale(24),
  },
  skillLevel: {
    position: 'absolute',
    bottom: scale(2),
    right: scale(4),
    fontSize: FONT_SIZES.xxs,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  lockedText: {
    position: 'absolute',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    fontWeight: 'bold',
  },
  cooldownText: {
    position: 'absolute',
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  pointsContainer: {
    alignItems: 'center',
    marginTop: scale(4),
  },
  pointsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
});
