import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, LAYOUT, scale } from '../../constants/theme';
import { formatNumber } from '../../utils/format';

export const TopBar = React.memo(() => {
  const stage = useGameStore((state) => state.stage);
  const gold = useGameStore((state) => state.gold);

  return (
    <View style={styles.container}>
      <View style={styles.stageInfo}>
        <Text style={styles.stageLabel}>關卡</Text>
        <Text style={styles.stageNumber}>{stage.currentStage}</Text>
      </View>

      <View style={styles.goldInfo}>
        <Text style={styles.goldIcon}>💰</Text>
        <Text style={styles.goldAmount}>{formatNumber(gold)}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.topBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  stageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    marginRight: SPACING.xs,
  },
  stageNumber: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  goldInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.xs,
  },
  goldAmount: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
});
