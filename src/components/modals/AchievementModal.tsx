import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { getAchievementById } from '../../data/achievements';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { formatNumber } from '../../utils/format';

export const AchievementModal = React.memo(() => {
  const pendingAchievement = useGameStore((state) => state.pendingAchievement);
  const dismissAchievement = useGameStore((state) => state.dismissAchievement);

  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingAchievement) {
      // Slide in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [pendingAchievement]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissAchievement();
    });
  };

  if (!pendingAchievement) return null;

  const achievement = getAchievementById(pendingAchievement);
  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handleDismiss}>
        <View style={styles.toast}>
          <View style={styles.header}>
            <Text style={styles.headerText}>🏆 成就解鎖！</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{achievement.icon}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.achievementName}>{achievement.name}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
              {achievement.reward && (
                <Text style={styles.rewardText}>
                  獎勵:{' '}
                  {achievement.reward.type === 'gold' && `💰 ${formatNumber(achievement.reward.amount)}`}
                  {achievement.reward.type === 'skill_points' && `✨ ${achievement.reward.amount} 技能點`}
                  {achievement.reward.type === 'prestige_points' && `🔄 ${achievement.reward.amount} 轉生點`}
                </Text>
              )}
            </View>
          </View>
          <Text style={styles.dismissText}>點擊關閉</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: scale(60),
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1001, // Above loot modal
  },
  toast: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: COLORS.textGold,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(255,215,0,0.2)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: scale(50),
    height: scale(50),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: scale(8),
    marginRight: SPACING.md,
  },
  icon: {
    fontSize: FONT_SIZES.xxl,
  },
  info: {
    flex: 1,
  },
  achievementName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
  },
  achievementDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  rewardText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.hpFull,
    marginTop: SPACING.xs,
    fontWeight: 'bold',
  },
  dismissText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    textAlign: 'center',
    paddingBottom: SPACING.sm,
  },
});
