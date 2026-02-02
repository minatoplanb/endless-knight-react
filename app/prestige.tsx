import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import {
  PRESTIGE_UPGRADES,
  PRESTIGE_REQUIREMENTS,
  getUpgradeCost,
} from '../src/data/prestige';
import { formatNumber } from '../src/utils/format';

const PrestigeUpgradeCard: React.FC<{
  upgrade: typeof PRESTIGE_UPGRADES[0];
  currentLevel: number;
  prestigePoints: number;
  onBuy: () => void;
}> = ({ upgrade, currentLevel, prestigePoints, onBuy }) => {
  const cost = getUpgradeCost(upgrade, currentLevel);
  const canAfford = prestigePoints >= cost;
  const isMaxed = currentLevel >= upgrade.maxLevel;
  const currentEffect = upgrade.effect.valuePerLevel * currentLevel;
  const nextEffect = upgrade.effect.valuePerLevel * (currentLevel + 1);

  const formatEffect = (value: number) => {
    switch (upgrade.effect.type) {
      case 'starting_gold':
        return `+${formatNumber(value)} 金幣`;
      case 'crit_chance':
      case 'atk_percent':
      case 'def_percent':
      case 'hp_percent':
      case 'gold_percent':
      case 'attack_speed':
      case 'offline_efficiency':
        return `+${value}%`;
      default:
        return `+${value}`;
    }
  };

  return (
    <View style={[styles.upgradeCard, isMaxed && styles.upgradeCardMaxed]}>
      <View style={styles.upgradeHeader}>
        <Text style={styles.upgradeIcon}>{upgrade.icon}</Text>
        <View style={styles.upgradeInfo}>
          <Text style={styles.upgradeName}>{upgrade.name}</Text>
          <Text style={styles.upgradeDesc}>{upgrade.description}</Text>
        </View>
        <View style={styles.upgradeLevel}>
          <Text style={styles.upgradeLevelText}>
            {currentLevel}/{upgrade.maxLevel}
          </Text>
        </View>
      </View>

      <View style={styles.upgradeEffect}>
        <Text style={styles.effectLabel}>目前效果:</Text>
        <Text style={styles.effectValue}>
          {currentLevel > 0 ? formatEffect(currentEffect) : '無'}
        </Text>
        {!isMaxed && (
          <>
            <Text style={styles.effectArrow}> → </Text>
            <Text style={styles.effectValueNext}>{formatEffect(nextEffect)}</Text>
          </>
        )}
      </View>

      {!isMaxed && (
        <TouchableOpacity
          style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
          onPress={onBuy}
          disabled={!canAfford}
          activeOpacity={0.7}
        >
          <Text style={styles.buyButtonText}>
            {canAfford ? `購買 (${cost} 點)` : `需要 ${cost} 點`}
          </Text>
        </TouchableOpacity>
      )}

      {isMaxed && (
        <View style={styles.maxedBadge}>
          <Text style={styles.maxedText}>已滿級</Text>
        </View>
      )}
    </View>
  );
};

const PrestigeInfoPanel: React.FC = () => {
  const totalGoldEarned = useGameStore((state) => state.totalGoldEarned);
  const highestStage = useGameStore((state) => state.stage.highestStage);
  const prestige = useGameStore((state) => state.prestige);
  const canPrestigeNow = useGameStore((state) => state.canPrestige());
  const pointsPreview = useGameStore((state) => state.getPrestigePointsPreview());
  const doPrestige = useGameStore((state) => state.doPrestige);

  const handlePrestige = () => {
    Alert.alert(
      '確認轉生',
      `你將獲得 ${pointsPreview} 轉生點數。\n\n這會重置：\n• 金幣和升級\n• 裝備和背包\n• 區域進度\n• 採集資源\n\n轉生升級會保留。\n\n確定要轉生嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確認轉生',
          style: 'destructive',
          onPress: () => {
            const success = doPrestige();
            if (success) {
              Alert.alert('轉生成功', `獲得 ${pointsPreview} 轉生點數！`);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.infoPanel}>
      <View style={styles.pointsDisplay}>
        <Text style={styles.pointsLabel}>轉生點數</Text>
        <Text style={styles.pointsValue}>{prestige.prestigePoints}</Text>
        <Text style={styles.pointsTotal}>
          (累計獲得: {prestige.totalPrestigePoints})
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>轉生次數</Text>
          <Text style={styles.statValue}>{prestige.prestigeCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>最高關卡</Text>
          <Text style={styles.statValue}>{highestStage}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>累計金幣</Text>
          <Text style={styles.statValue}>{formatNumber(totalGoldEarned)}</Text>
        </View>
      </View>

      <View style={styles.prestigeSection}>
        <Text style={styles.prestigePreviewLabel}>
          轉生可獲得: <Text style={styles.prestigePreviewValue}>{pointsPreview} 點</Text>
        </Text>

        {!canPrestigeNow && (
          <Text style={styles.requirementText}>
            需要: {formatNumber(PRESTIGE_REQUIREMENTS.minGold)} 金幣 / 第 {PRESTIGE_REQUIREMENTS.minStage} 關
          </Text>
        )}

        <TouchableOpacity
          style={[styles.prestigeButton, !canPrestigeNow && styles.prestigeButtonDisabled]}
          onPress={handlePrestige}
          disabled={!canPrestigeNow}
          activeOpacity={0.7}
        >
          <Text style={styles.prestigeButtonText}>
            {canPrestigeNow ? '🔄 轉生' : '條件未達成'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PrestigeScreen() {
  const prestige = useGameStore((state) => state.prestige);
  const buyPrestigeUpgrade = useGameStore((state) => state.buyPrestigeUpgrade);

  return (
    <View style={styles.container}>
      <TopBar />

      <PrestigeInfoPanel />

      <Text style={styles.sectionTitle}>轉生升級</Text>

      <ScrollView style={styles.upgradeList} contentContainerStyle={styles.upgradeListContent}>
        {PRESTIGE_UPGRADES.map((upgrade) => (
          <PrestigeUpgradeCard
            key={upgrade.id}
            upgrade={upgrade}
            currentLevel={prestige.upgrades[upgrade.id] || 0}
            prestigePoints={prestige.prestigePoints}
            onBuy={() => buyPrestigeUpgrade(upgrade.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  infoPanel: {
    backgroundColor: COLORS.panel,
    margin: 8,
    borderRadius: 12,
    padding: 16,
  },
  pointsDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  pointsLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  pointsValue: {
    color: COLORS.textGold,
    fontSize: 36,
    fontWeight: 'bold',
  },
  pointsTotal: {
    color: COLORS.textDim,
    fontSize: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.bgLight,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: COLORS.textDim,
    fontSize: 10,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  prestigeSection: {
    alignItems: 'center',
  },
  prestigePreviewLabel: {
    color: COLORS.textDim,
    fontSize: 14,
    marginBottom: 4,
  },
  prestigePreviewValue: {
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  requirementText: {
    color: '#ef4444',
    fontSize: 11,
    marginBottom: 8,
  },
  prestigeButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  prestigeButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  prestigeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  upgradeList: {
    flex: 1,
  },
  upgradeListContent: {
    padding: 8,
    gap: 8,
  },
  upgradeCard: {
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    padding: 12,
  },
  upgradeCardMaxed: {
    opacity: 0.7,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  upgradeInfo: {
    flex: 1,
  },
  upgradeName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  upgradeDesc: {
    color: COLORS.textDim,
    fontSize: 11,
  },
  upgradeLevel: {
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  upgradeLevelText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  upgradeEffect: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  effectValue: {
    color: COLORS.text,
    fontSize: 12,
    marginLeft: 4,
  },
  effectArrow: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  effectValueNext: {
    color: '#22c55e',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buyButtonText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  maxedBadge: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  maxedText: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
