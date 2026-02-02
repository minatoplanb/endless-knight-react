import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import {
  ACHIEVEMENTS,
  CATEGORY_NAMES,
  CATEGORY_ICONS,
  AchievementCategory,
  Achievement,
} from '../src/data/achievements';
import { formatNumber } from '../src/utils/format';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isUnlocked }) => {
  const isHidden = achievement.hidden && !isUnlocked;

  return (
    <View style={[styles.achievementCard, isUnlocked && styles.achievementCardUnlocked]}>
      <View style={styles.achievementIcon}>
        <Text style={[styles.iconText, !isUnlocked && styles.iconTextLocked]}>
          {isHidden ? '❓' : achievement.icon}
        </Text>
      </View>
      <View style={styles.achievementInfo}>
        <Text style={[styles.achievementName, !isUnlocked && styles.textLocked]}>
          {isHidden ? '???' : achievement.name}
        </Text>
        <Text style={[styles.achievementDesc, !isUnlocked && styles.textLocked]}>
          {isHidden ? '隱藏成就' : achievement.description}
        </Text>
        {achievement.reward && !isHidden && (
          <Text style={styles.rewardText}>
            獎勵: {achievement.reward.type === 'gold' && `💰 ${formatNumber(achievement.reward.amount)}`}
            {achievement.reward.type === 'skill_points' && `✨ ${achievement.reward.amount} 技能點`}
            {achievement.reward.type === 'prestige_points' && `🔄 ${achievement.reward.amount} 轉生點`}
          </Text>
        )}
      </View>
      <View style={styles.achievementStatus}>
        {isUnlocked ? (
          <Text style={styles.checkmark}>✓</Text>
        ) : (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>
    </View>
  );
};

interface CategorySectionProps {
  category: AchievementCategory;
  achievements: Achievement[];
  unlockedIds: string[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, achievements, unlockedIds }) => {
  const unlockedCount = achievements.filter((a) => unlockedIds.includes(a.id)).length;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{CATEGORY_ICONS[category]}</Text>
        <Text style={styles.sectionTitle}>{CATEGORY_NAMES[category]}</Text>
        <Text style={styles.sectionCount}>
          {unlockedCount}/{achievements.length}
        </Text>
      </View>
      <View style={styles.sectionContent}>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.includes(achievement.id)}
          />
        ))}
      </View>
    </View>
  );
};

export default function AchievementsPage() {
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);

  // Group achievements by category
  const achievementsByCategory: Record<AchievementCategory, Achievement[]> = {
    combat: [],
    progression: [],
    economy: [],
    gathering: [],
    crafting: [],
    skills: [],
    equipment: [],
  };

  for (const achievement of ACHIEVEMENTS) {
    achievementsByCategory[achievement.category].push(achievement);
  }

  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>🏆 成就</Text>

        <View style={styles.progressCard}>
          <Text style={styles.progressLabel}>總進度</Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${(totalUnlocked / totalAchievements) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {totalUnlocked} / {totalAchievements} ({Math.floor((totalUnlocked / totalAchievements) * 100)}%)
          </Text>
        </View>

        {Object.entries(achievementsByCategory).map(([category, achievements]) =>
          achievements.length > 0 ? (
            <CategorySection
              key={category}
              category={category as AchievementCategory}
              achievements={achievements}
              unlockedIds={unlockedAchievements}
            />
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  progressCard: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginBottom: SPACING.sm,
  },
  progressBarContainer: {
    width: '100%',
    height: scale(16),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(8),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.textGold,
  },
  progressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  section: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sectionIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  sectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  sectionContent: {
    padding: SPACING.sm,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: scale(8),
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginBottom: SPACING.xs,
  },
  achievementCardUnlocked: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: COLORS.textGold,
  },
  achievementIcon: {
    width: scale(40),
    height: scale(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: scale(8),
    marginRight: SPACING.sm,
  },
  iconText: {
    fontSize: FONT_SIZES.lg,
  },
  iconTextLocked: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  achievementDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
  },
  rewardText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textGold,
    marginTop: SPACING.xs,
  },
  textLocked: {
    opacity: 0.5,
  },
  achievementStatus: {
    marginLeft: SPACING.sm,
  },
  checkmark: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.hpFull,
  },
  lockIcon: {
    fontSize: FONT_SIZES.md,
    opacity: 0.5,
  },
});
