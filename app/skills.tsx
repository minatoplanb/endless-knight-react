import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, scale } from '../src/constants/theme';
import { useGameStore } from '../src/store/useGameStore';
import { SKILLS, ALL_SKILL_IDS, getSkillDescription, getSkillUpgradeCost } from '../src/data/skills';
import type { SkillId } from '../src/types';

interface SkillCardProps {
  skillId: SkillId;
}

const SkillCard = React.memo<SkillCardProps>(({ skillId }) => {
  const skill = SKILLS[skillId];
  const skills = useGameStore((state) => state.skills);
  const upgradeSkill = useGameStore((state) => state.upgradeSkill);

  const level = skills.unlockedSkills[skillId];
  const isUnlocked = level > 0;
  const isMaxLevel = level >= skill.maxLevel;
  const cost = getSkillUpgradeCost(skill, level);
  const canAfford = skills.skillPoints >= cost;

  const handleUpgrade = useCallback(() => {
    upgradeSkill(skillId);
  }, [upgradeSkill, skillId]);

  const description = getSkillDescription(skill, level);
  const nextDescription = !isMaxLevel
    ? getSkillDescription(skill, level + 1)
    : null;

  return (
    <View style={styles.skillCard}>
      <View style={styles.skillHeader}>
        <Text style={styles.skillIcon}>{skill.icon}</Text>
        <View style={styles.skillInfo}>
          <Text style={styles.skillName}>{skill.name}</Text>
          <Text style={styles.skillLevel}>
            {isUnlocked ? `Lv.${level}` : '未解鎖'}
            {!isMaxLevel && ` / ${skill.maxLevel}`}
          </Text>
        </View>
      </View>

      <Text style={styles.skillDescription}>{description}</Text>

      {nextDescription && (
        <Text style={styles.nextLevel}>
          下一級: {nextDescription}
        </Text>
      )}

      <View style={styles.skillFooter}>
        <Text style={styles.cooldownText}>
          冷卻: {skill.cooldown / 1000}秒
        </Text>

        {!isMaxLevel && (
          <Pressable
            style={[
              styles.upgradeButton,
              !canAfford && styles.upgradeButtonDisabled,
            ]}
            onPress={handleUpgrade}
            disabled={!canAfford}
          >
            <Text style={styles.upgradeButtonText}>
              {isUnlocked ? '升級' : '解鎖'} ({cost} SP)
            </Text>
          </Pressable>
        )}

        {isMaxLevel && (
          <View style={styles.maxLevelBadge}>
            <Text style={styles.maxLevelText}>MAX</Text>
          </View>
        )}
      </View>
    </View>
  );
});

export default function SkillsScreen() {
  const skills = useGameStore((state) => state.skills);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>技能</Text>
        <Text style={styles.pointsText}>
          技能點: {skills.skillPoints}
        </Text>
      </View>

      <Text style={styles.hint}>
        擊敗 Boss 獲得技能點
      </Text>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_SKILL_IDS.map((skillId) => (
          <SkillCard key={skillId} skillId={skillId} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pointsText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  skillCard: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(8),
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  skillIcon: {
    fontSize: scale(32),
    marginRight: SPACING.sm,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  skillLevel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  skillDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  nextLevel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.uncommon,
    marginBottom: SPACING.sm,
  },
  skillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
  },
  upgradeButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(4),
  },
  upgradeButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  upgradeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  maxLevelBadge: {
    backgroundColor: COLORS.legendary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: scale(4),
  },
  maxLevelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.bg,
    fontWeight: 'bold',
  },
});
