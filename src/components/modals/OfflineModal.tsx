import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { formatNumber, formatTime } from '../../utils/format';
import { RESOURCES, ALL_RESOURCES } from '../../data/resources';
import { PressableButton } from '../common/PressableButton';
import { useTranslation } from '../../locales';
import { audioManager } from '../../lib/audio';

export const OfflineModal = React.memo(() => {
  const { locale } = useTranslation();
  const showOfflineModal = useGameStore((state) => state.showOfflineModal);
  const offlineReward = useGameStore((state) => state.offlineReward);
  const offlineGathering = useGameStore((state) => state.offlineGathering);
  const lastOnlineTime = useGameStore((state) => state.lastOnlineTime);
  const setShowOfflineModal = useGameStore((state) => state.setShowOfflineModal);
  const gold = useGameStore((state) => state.gold);
  const collectOfflineGathering = useGameStore((state) => state.collectOfflineGathering);

  const isZh = locale === 'zh';

  const offlineSeconds = (Date.now() - lastOnlineTime) / 1000;

  const handleCollect = useCallback(() => {
    audioManager.playCoin();
    useGameStore.setState({ gold: gold + offlineReward });
    collectOfflineGathering();
    setShowOfflineModal(false);
  }, [gold, offlineReward, collectOfflineGathering, setShowOfflineModal]);

  return (
    <Modal
      visible={showOfflineModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOfflineModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{isZh ? '歡迎回來！' : 'Welcome Back!'}</Text>

          <Text style={styles.message}>
            {isZh
              ? `你離線了 ${formatTime(offlineSeconds)}`
              : `You were offline for ${formatTime(offlineSeconds)}`}
          </Text>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>{isZh ? '離線獎勵' : 'Offline Rewards'}</Text>
            <Text style={styles.rewardAmount}>
              {formatNumber(offlineReward)} G
            </Text>

            {offlineGathering && (
              <View style={styles.gatheringRewards}>
                {ALL_RESOURCES.map((resourceType) => {
                  const amount = offlineGathering[resourceType];
                  if (amount <= 0) return null;
                  const resourceDef = RESOURCES[resourceType];
                  return (
                    <Text key={resourceType} style={styles.gatheringItem}>
                      {resourceDef.icon} {resourceDef.name} +{formatNumber(amount)}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>

          <PressableButton
            title={isZh ? '領取' : 'Collect'}
            onPress={handleCollect}
            variant="success"
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(16),
    padding: SPACING.xl,
    width: '80%',
    maxWidth: scale(300),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.textGold,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  rewardContainer: {
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(12),
    padding: SPACING.lg,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  rewardLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    marginBottom: SPACING.sm,
  },
  rewardAmount: {
    fontSize: FONT_SIZES.title,
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  button: {
    minWidth: scale(150),
  },
  gatheringRewards: {
    marginTop: SPACING.md,
    width: '100%',
  },
  gatheringItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
