import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../src/store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { getQuestById, QuestDefinition } from '../src/data/quests';
import { ActiveQuestData, ResourceType } from '../src/types';

const RESOURCE_NAMES: Record<ResourceType, string> = {
  ore: '礦石',
  wood: '木材',
  fish: '魚獲',
  herb: '草藥',
};

interface QuestCardProps {
  quest: ActiveQuestData;
  questDef: QuestDefinition;
  onClaim: () => void;
}

const QuestCard = React.memo(({ quest, questDef, onClaim }: QuestCardProps) => {
  const progress = Math.min(quest.progress, questDef.objective.target);
  const progressPercent = (progress / questDef.objective.target) * 100;

  return (
    <View style={[styles.questCard, quest.claimed && styles.questCardClaimed]}>
      <View style={styles.questHeader}>
        <Text style={styles.questName}>{questDef.name}</Text>
        {quest.completed && !quest.claimed && (
          <Text style={styles.completeLabel}>完成!</Text>
        )}
        {quest.claimed && (
          <Text style={styles.claimedLabel}>已領取</Text>
        )}
      </View>

      <Text style={styles.questDescription}>{questDef.description}</Text>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
              quest.completed && styles.progressComplete,
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {progress} / {questDef.objective.target}
        </Text>
      </View>

      {/* Rewards */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardsLabel}>獎勵：</Text>
        <View style={styles.rewardsList}>
          {questDef.reward.gold && (
            <Text style={styles.rewardItem}>💰 {questDef.reward.gold}</Text>
          )}
          {questDef.reward.skillPoints && (
            <Text style={styles.rewardItem}>⚡ {questDef.reward.skillPoints} 技能點</Text>
          )}
          {questDef.reward.prestigePoints && (
            <Text style={styles.rewardItem}>✨ {questDef.reward.prestigePoints} 轉生點</Text>
          )}
          {questDef.reward.resources && Object.entries(questDef.reward.resources).map(([resource, amount]) => (
            <Text key={resource} style={styles.rewardItem}>
              {RESOURCE_NAMES[resource as ResourceType]} ×{amount}
            </Text>
          ))}
        </View>
      </View>

      {/* Claim Button */}
      {quest.completed && !quest.claimed && (
        <Pressable
          style={({ pressed }) => [
            styles.claimButton,
            pressed && styles.claimButtonPressed,
          ]}
          onPress={onClaim}
        >
          <Text style={styles.claimButtonText}>領取獎勵</Text>
        </Pressable>
      )}
    </View>
  );
});

export default function QuestsScreen() {
  const quests = useGameStore((state) => state.quests);
  const checkQuestReset = useGameStore((state) => state.checkQuestReset);
  const claimQuestReward = useGameStore((state) => state.claimQuestReward);

  // Check for quest reset when entering the page
  useEffect(() => {
    checkQuestReset();
  }, [checkQuestReset]);

  const handleClaimDaily = useCallback((questId: string) => {
    claimQuestReward(questId, true);
  }, [claimQuestReward]);

  const handleClaimWeekly = useCallback((questId: string) => {
    claimQuestReward(questId, false);
  }, [claimQuestReward]);

  const dailyQuestsWithDef = quests.dailyQuests
    .map((q) => ({ quest: q, def: getQuestById(q.questId) }))
    .filter((item): item is { quest: ActiveQuestData; def: QuestDefinition } => item.def !== undefined);

  const weeklyQuestsWithDef = quests.weeklyQuests
    .map((q) => ({ quest: q, def: getQuestById(q.questId) }))
    .filter((item): item is { quest: ActiveQuestData; def: QuestDefinition } => item.def !== undefined);

  // Calculate completion stats
  const dailyCompleted = quests.dailyQuests.filter((q) => q.claimed).length;
  const weeklyCompleted = quests.weeklyQuests.filter((q) => q.claimed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Daily Quests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>每日任務</Text>
            <Text style={styles.sectionProgress}>
              {dailyCompleted}/{quests.dailyQuests.length}
            </Text>
          </View>
          {dailyQuestsWithDef.length === 0 ? (
            <Text style={styles.noQuests}>載入中...</Text>
          ) : (
            dailyQuestsWithDef.map(({ quest, def }) => (
              <QuestCard
                key={quest.questId}
                quest={quest}
                questDef={def}
                onClaim={() => handleClaimDaily(quest.questId)}
              />
            ))
          )}
        </View>

        {/* Weekly Quests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>每週任務</Text>
            <Text style={styles.sectionProgress}>
              {weeklyCompleted}/{quests.weeklyQuests.length}
            </Text>
          </View>
          {weeklyQuestsWithDef.length === 0 ? (
            <Text style={styles.noQuests}>載入中...</Text>
          ) : (
            weeklyQuestsWithDef.map(({ quest, def }) => (
              <QuestCard
                key={quest.questId}
                quest={quest}
                questDef={def}
                onClaim={() => handleClaimWeekly(quest.questId)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionProgress: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
  },
  noQuests: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
  },
  questCard: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.bgLight,
  },
  questCardClaimed: {
    opacity: 0.6,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  questName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  completeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.hpFull,
    fontWeight: 'bold',
  },
  claimedLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  questDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: scale(8),
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(4),
    overflow: 'hidden',
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: scale(4),
  },
  progressComplete: {
    backgroundColor: COLORS.hpFull,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    minWidth: scale(60),
    textAlign: 'right',
  },
  rewardsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
  },
  rewardsLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginRight: SPACING.xs,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  rewardItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    marginRight: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  claimButton: {
    backgroundColor: COLORS.buttonSuccess,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: scale(8),
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  claimButtonPressed: {
    opacity: 0.8,
  },
  claimButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
