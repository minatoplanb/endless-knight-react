import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';

export const DeathModal = React.memo(() => {
  const showDeathModal = useGameStore((state) => state.showDeathModal);
  const stage = useGameStore((state) => state.stage);
  const resetAfterDeath = useGameStore((state) => state.resetAfterDeath);

  const resetStage = Math.max(1, stage.highestStage - 5);

  return (
    <Modal
      visible={showDeathModal}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>💀 你死了！</Text>

          <Text style={styles.message}>
            你在關卡 {stage.currentStage} 被擊敗了
          </Text>

          <Text style={styles.info}>
            將返回關卡 {resetStage}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={resetAfterDeath}
          >
            <Text style={styles.buttonText}>復活</Text>
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
    borderColor: COLORS.buttonDanger,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.damage,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  info: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
    textAlign: 'center',
    marginBottom: SPACING.xl,
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
