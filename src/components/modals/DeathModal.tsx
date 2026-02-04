import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { useTranslation } from '../../locales';

export const DeathModal = React.memo(() => {
  const { t } = useTranslation();
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
          <Text style={styles.title}>💀 {t('modals.death.title')}</Text>

          <Text style={styles.message}>
            {t('modals.death.message').replace('{0}', String(stage.currentStage))}
          </Text>

          <Text style={styles.info}>
            {t('modals.death.info').replace('{0}', String(resetStage))}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={resetAfterDeath}
          >
            <Text style={styles.buttonText}>{t('modals.death.revive')}</Text>
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
