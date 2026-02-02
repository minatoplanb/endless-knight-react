import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { WorkerType } from '../../types';
import { WORKERS, WORKER_MAX_LEVEL, getWorkerInterval } from '../../data/gathering';
import { RESOURCES } from '../../data/resources';
import { useGameStore } from '../../store/useGameStore';

interface WorkerCardProps {
  workerType: WorkerType;
}

export const WorkerCard = React.memo(({ workerType }: WorkerCardProps) => {
  const worker = useGameStore((state) => state.gathering.workers[workerType]);
  const gold = useGameStore((state) => state.gold);
  const upgradeWorker = useGameStore((state) => state.upgradeWorker);
  const getWorkerUpgradeCost = useGameStore((state) => state.getWorkerUpgradeCost);

  const workerDef = WORKERS[workerType];
  const resourceDef = RESOURCES[workerDef.resource];
  const interval = getWorkerInterval(worker.level);
  const upgradeCost = getWorkerUpgradeCost(workerType);
  const canUpgrade = worker.level < WORKER_MAX_LEVEL && gold >= upgradeCost;
  const isMaxLevel = worker.level >= WORKER_MAX_LEVEL;

  const handleUpgrade = useCallback(() => {
    upgradeWorker(workerType);
  }, [upgradeWorker, workerType]);

  const formatCost = (cost: number): string => {
    if (cost >= 1000000) return `${(cost / 1000000).toFixed(1)}M`;
    if (cost >= 1000) return `${(cost / 1000).toFixed(1)}K`;
    return cost.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>{workerDef.icon}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{workerDef.name}</Text>
          <Text style={styles.level}>Lv.{worker.level}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.resourceIcon}>{resourceDef.icon}</Text>
        <Text style={styles.resourceName}>{resourceDef.name}</Text>
        <Text style={styles.rate}>1/{interval}秒</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${worker.progress * 100}%` }]} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.upgradeButton,
          !canUpgrade && styles.upgradeButtonDisabled,
          pressed && canUpgrade && styles.upgradeButtonPressed,
        ]}
        onPress={handleUpgrade}
        disabled={!canUpgrade}
      >
        {isMaxLevel ? (
          <Text style={styles.upgradeButtonText}>MAX</Text>
        ) : (
          <Text style={styles.upgradeButtonText}>
            {formatCost(upgradeCost)} G
          </Text>
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(8),
    padding: SPACING.md,
    width: '48%',
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: FONT_SIZES.xxl,
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  name: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  level: {
    color: COLORS.textGold,
    fontSize: FONT_SIZES.sm,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resourceIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  resourceName: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  rate: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  progressContainer: {
    height: scale(4),
    backgroundColor: COLORS.hpBg,
    borderRadius: scale(2),
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.hpFull,
    borderRadius: scale(2),
  },
  upgradeButton: {
    backgroundColor: COLORS.buttonPrimary,
    paddingVertical: SPACING.sm,
    borderRadius: scale(4),
    alignItems: 'center',
  },
  upgradeButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  upgradeButtonPressed: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
});
