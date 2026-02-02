import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, LAYOUT, scale } from '../../constants/theme';
import { formatNumber } from '../../utils/format';
import { getAreaById } from '../../data/areas';

export const TopBar = React.memo(() => {
  const router = useRouter();
  const stage = useGameStore((state) => state.stage);
  const gold = useGameStore((state) => state.gold);
  const areaProgress = useGameStore((state) => state.areaProgress);

  const currentArea = getAreaById(stage.currentAreaId);
  const areaName = currentArea?.name || '未知區域';
  const currentAreaProgress = areaProgress[stage.currentAreaId];
  const isAreaCleared = currentAreaProgress?.cleared || false;

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <View style={styles.stageInfo}>
        <Text style={styles.areaName} numberOfLines={1}>
          {areaName}
        </Text>
        <View style={styles.stageRow}>
          <Text style={styles.stageLabel}>第</Text>
          <Text style={styles.stageNumber}>{stage.currentStage}</Text>
          <Text style={styles.stageLabel}>
            /{currentArea?.stages || '?'}關
            {isAreaCleared && ' ✓'}
          </Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={styles.goldInfo}>
          <Text style={styles.goldIcon}>💰</Text>
          <Text style={styles.goldAmount}>{formatNumber(gold)}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/achievements')}>
          <Text style={styles.iconButtonText}>🏆</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleSettingsPress}>
          <Text style={styles.iconButtonText}>⚙️</Text>
        </TouchableOpacity>
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  },
  areaName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  stageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stageLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  stageNumber: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
  iconButton: {
    marginLeft: SPACING.sm,
    padding: SPACING.xs,
  },
  iconButtonText: {
    fontSize: FONT_SIZES.lg,
  },
});
