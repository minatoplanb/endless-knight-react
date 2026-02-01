import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, LAYOUT, scale } from '../../constants/theme';
import { STAGE } from '../../constants/game';

export const StageProgress = React.memo(() => {
  const stage = useGameStore((state) => state.stage);

  return (
    <View style={styles.container}>
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
            ? '移動中...'
            : `敵人 ${stage.enemiesKilled + 1}/${STAGE.enemiesPerStage}`}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.progressBarHeight,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    backgroundColor: COLORS.panel,
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
});
