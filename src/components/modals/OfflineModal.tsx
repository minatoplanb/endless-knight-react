import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { formatNumber, formatTime } from '../../utils/format';

export const OfflineModal = React.memo(() => {
  const showOfflineModal = useGameStore((state) => state.showOfflineModal);
  const offlineReward = useGameStore((state) => state.offlineReward);
  const lastOnlineTime = useGameStore((state) => state.lastOnlineTime);
  const setShowOfflineModal = useGameStore((state) => state.setShowOfflineModal);
  const gold = useGameStore((state) => state.gold);

  const offlineSeconds = (Date.now() - lastOnlineTime) / 1000;

  const handleCollect = useCallback(() => {
    useGameStore.setState({ gold: gold + offlineReward });
    setShowOfflineModal(false);
  }, [gold, offlineReward, setShowOfflineModal]);

  return (
    <Modal
      visible={showOfflineModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOfflineModal(false)}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>🌙 歡迎回來！</Text>

          <Text style={styles.message}>
            你離線了 {formatTime(offlineSeconds)}
          </Text>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardLabel}>離線獎勵</Text>
            <Text style={styles.rewardAmount}>
              💰 {formatNumber(offlineReward)}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCollect}
          >
            <Text style={styles.buttonText}>領取</Text>
          </Pressable>
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
    backgroundColor: COLORS.buttonSuccess,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: scale(8),
    minWidth: scale(150),
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
