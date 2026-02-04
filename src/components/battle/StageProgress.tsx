import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, LAYOUT, scale } from '../../constants/theme';
import { STAGE } from '../../constants/game';
import { getAreaById } from '../../data/areas';
import { useTranslation } from '../../locales';

export const StageProgress = React.memo(() => {
  const { locale } = useTranslation();
  const stage = useGameStore((state) => state.stage);

  // Get current area info for stage count
  const currentArea = getAreaById(stage.currentAreaId);
  const totalStages = currentArea?.stages ?? 100;
  const areaProgress = Math.min(100, (stage.currentStage / totalStages) * 100);

  return (
    <View style={styles.container}>
      {/* Main Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              {
                width: stage.isTraveling
                  ? `${stage.travelProgress}%`
                  : '100%',
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {stage.isTraveling
            ? (locale === 'zh' ? '移動中...' : 'Moving...')
            : (locale === 'zh'
                ? `敵人 ${stage.enemiesKilled + 1}/${STAGE.enemiesPerStage}`
                : `Enemy ${stage.enemiesKilled + 1}/${STAGE.enemiesPerStage}`)}
        </Text>
      </View>

      {/* Area Progress Bar */}
      <View style={styles.areaProgressContainer}>
        <View style={styles.areaProgressBg}>
          <View
            style={[
              styles.areaProgressFill,
              { width: `${areaProgress}%` },
            ]}
          />
        </View>
        <Text style={styles.areaProgressText}>
          {locale === 'zh' ? '關卡' : 'Stage'} {stage.currentStage}/{totalStages}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.progressBarHeight + scale(20),
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    backgroundColor: COLORS.panel,
    gap: SPACING.xs,
  },
  progressContainer: {
    position: 'relative',
  },
  progressBg: {
    height: scale(12),
    backgroundColor: COLORS.hpBg,
    borderRadius: scale(6),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: scale(6),
  },
  progressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  areaProgressContainer: {
    position: 'relative',
  },
  areaProgressBg: {
    height: scale(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: scale(4),
    overflow: 'hidden',
  },
  areaProgressFill: {
    height: '100%',
    backgroundColor: COLORS.textGold,
    borderRadius: scale(4),
  },
  areaProgressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: FONT_SIZES.xxs,
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
