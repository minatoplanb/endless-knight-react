import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { getDailyReward, shouldResetStreak, DAILY_REWARDS } from '../../data/dailyRewards';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { formatNumber } from '../../utils/format';

const REWARD_ICONS: Record<string, string> = {
  gold: '💰',
  skill_points: '✨',
  prestige_points: '🔄',
  ore: '⛏️',
  wood: '🪵',
  fish: '🐟',
  herb: '🌿',
};

export const DailyRewardModal = React.memo(() => {
  const showModal = useGameStore((state) => state.showDailyRewardModal);
  const streak = useGameStore((state) => state.dailyRewardStreak);
  const lastClaim = useGameStore((state) => state.lastDailyClaimTime);
  const claimReward = useGameStore((state) => state.claimDailyReward);
  const setShowModal = useGameStore((state) => state.setShowDailyRewardModal);

  if (!showModal) return null;

  // Calculate the day we're claiming (next day in streak)
  let claimDay = streak;
  if (shouldResetStreak(lastClaim)) {
    claimDay = 0;
  }
  claimDay = (claimDay % 7) + 1;

  const todayReward = getDailyReward(claimDay);

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.headerText}>🎁 每日獎勵</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.dayText}>第 {claimDay} 天</Text>

            {/* Show all 7 days */}
            <View style={styles.daysRow}>
              {DAILY_REWARDS.map((reward, index) => {
                const day = index + 1;
                const isToday = day === claimDay;
                const isPast = day < claimDay || (day === 7 && claimDay === 1 && streak >= 7);

                return (
                  <View
                    key={day}
                    style={[
                      styles.dayBox,
                      isToday && styles.dayBoxToday,
                      isPast && styles.dayBoxPast,
                    ]}
                  >
                    <Text style={styles.dayNumber}>{day}</Text>
                    {isPast && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                );
              })}
            </View>

            <View style={styles.rewardBox}>
              <Text style={styles.rewardTitle}>今日獎勵</Text>
              <View style={styles.rewardList}>
                {todayReward.rewards.map((r, index) => (
                  <View key={index} style={styles.rewardItem}>
                    <Text style={styles.rewardIcon}>
                      {r.type === 'resource' ? REWARD_ICONS[r.resourceType || 'ore'] : REWARD_ICONS[r.type]}
                    </Text>
                    <Text style={styles.rewardAmount}>
                      {r.type === 'gold' && formatNumber(r.amount)}
                      {r.type === 'skill_points' && `${r.amount} 技能點`}
                      {r.type === 'prestige_points' && `${r.amount} 轉生點`}
                      {r.type === 'resource' && `${r.amount} ${r.resourceType === 'ore' ? '礦石' : r.resourceType === 'wood' ? '木材' : r.resourceType === 'fish' ? '魚獲' : '草藥'}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.claimButton} onPress={claimReward}>
              <Text style={styles.claimButtonText}>領取獎勵</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={() => setShowModal(false)}>
              <Text style={styles.laterButtonText}>稍後領取</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(16),
    width: '100%',
    maxWidth: scale(320),
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textGold,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  dayText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  dayBox: {
    width: scale(32),
    height: scale(32),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  dayBoxToday: {
    backgroundColor: COLORS.textGold,
  },
  dayBoxPast: {
    backgroundColor: 'rgba(68,255,68,0.3)',
  },
  dayNumber: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  checkmark: {
    position: 'absolute',
    fontSize: FONT_SIZES.xs,
    color: COLORS.hpFull,
  },
  rewardBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: scale(12),
    padding: SPACING.md,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  rewardTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  rewardList: {
    alignItems: 'center',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  rewardIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.sm,
  },
  rewardAmount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  claimButton: {
    backgroundColor: COLORS.textGold,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: scale(8),
    width: '100%',
    marginBottom: SPACING.sm,
  },
  claimButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.bg,
    textAlign: 'center',
  },
  laterButton: {
    paddingVertical: SPACING.sm,
  },
  laterButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
});
