import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TouchableOpacity, Modal } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { getConsumableById } from '../../data/consumables';
import { SKILLS, ALL_SKILL_IDS, getSkillDescription, getSkillEffectValue } from '../../data/skills';
import { COLORS, FONT_SIZES, scale } from '../../constants/theme';
import { useTranslation } from '../../locales';
import type { SkillId } from '../../types';

// Small skill button for compact display
const SkillButton = React.memo<{
  skillId: SkillId;
  level: number;
  cooldownRemaining: number;
  isReady: boolean;
  onPress: () => void;
  onLongPress: () => void;
}>(({ skillId, level, cooldownRemaining, isReady, onPress, onLongPress }) => {
  const skill = SKILLS[skillId];
  const isUnlocked = level > 0;

  const cooldownPercent = isUnlocked && !isReady
    ? cooldownRemaining / skill.cooldown
    : 0;

  return (
    <Pressable
      style={[
        styles.actionButton,
        styles.skillButton,
        !isUnlocked && styles.locked,
        !isReady && isUnlocked && styles.onCooldown,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
      disabled={!isUnlocked || !isReady}
    >
      {isUnlocked && !isReady && (
        <View style={[styles.cooldownOverlay, { height: `${cooldownPercent * 100}%` }]} />
      )}
      <Text style={styles.buttonIcon}>{skill.icon}</Text>
      {isUnlocked && <Text style={styles.levelBadge}>{level}</Text>}
    </Pressable>
  );
});

// Small consumable button
const ConsumableButton = React.memo<{
  consumableId: string;
  amount: number;
  onPress: () => void;
  onLongPress: () => void;
}>(({ consumableId, amount, onPress, onLongPress }) => {
  const consumable = getConsumableById(consumableId);
  if (!consumable) return null;

  return (
    <Pressable
      style={[styles.actionButton, styles.consumableButton]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={300}
    >
      <Text style={styles.buttonIcon}>{consumable.icon}</Text>
      <Text style={styles.amountBadge}>{amount}</Text>
    </Pressable>
  );
});

// Map skill buff types to icons
const SKILL_BUFF_ICONS: Record<string, string> = {
  defense: '🛡️',
  attack_speed: '⚡',
  crit: '🎯',
  gold: '💰',
};

export const ActionBar = React.memo(() => {
  const { t, getDataName } = useTranslation();
  const skills = useGameStore((state) => state.skills);
  const consumables = useGameStore((state) => state.consumables);
  const activeBuffs = useGameStore((state) => state.activeBuffs);
  const skillBuffs = useGameStore((state) => state.skillBuffs);
  const useSkill = useGameStore((state) => state.useSkill);
  const useConsumable = useGameStore((state) => state.useConsumable);
  const isSkillReady = useGameStore((state) => state.isSkillReady);
  const getSkillCooldownRemaining = useGameStore((state) => state.getSkillCooldownRemaining);
  const isBattlePaused = useGameStore((state) => state.isBattlePaused);
  const toggleBattlePause = useGameStore((state) => state.toggleBattlePause);

  // Tooltip states
  const [tooltipSkill, setTooltipSkill] = useState<SkillId | null>(null);
  const [tooltipConsumable, setTooltipConsumable] = useState<string | null>(null);

  const handleSkillPress = useCallback((skillId: SkillId) => {
    useSkill(skillId);
  }, [useSkill]);

  const handleSkillLongPress = useCallback((skillId: SkillId) => {
    setTooltipSkill(skillId);
  }, []);

  const handleConsumablePress = useCallback((consumableId: string) => {
    useConsumable(consumableId);
  }, [useConsumable]);

  const handleConsumableLongPress = useCallback((consumableId: string) => {
    setTooltipConsumable(consumableId);
  }, []);

  // Get unlocked skills (max 3 for display)
  const unlockedSkills = ALL_SKILL_IDS.filter((id) => skills.unlockedSkills[id] > 0).slice(0, 3);

  // Get consumables (max 2 for display)
  const displayConsumables = consumables.slice(0, 2);

  // Format buff time
  const formatBuffTime = (expiresAt: number) => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    return `${remaining}s`;
  };

  return (
    <View style={styles.container}>
      {/* Active Buffs */}
      {activeBuffs.length > 0 && (
        <View style={styles.buffsRow}>
          {activeBuffs.map((buff) => {
            const consumable = getConsumableById(buff.sourceId);
            return (
              <View key={buff.id} style={styles.buffBadge}>
                <Text style={styles.buffIcon}>{consumable?.icon || '✨'}</Text>
                <Text style={styles.buffTime}>{formatBuffTime(buff.expiresAt)}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Main Action Row */}
      <View style={styles.actionRow}>
        {/* Pause Button */}
        <Pressable
          style={[styles.actionButton, styles.pauseButton, isBattlePaused && styles.pauseButtonActive]}
          onPress={toggleBattlePause}
        >
          <Text style={styles.buttonIcon}>{isBattlePaused ? '▶️' : '⏸️'}</Text>
        </Pressable>

        {/* Consumables */}
        {displayConsumables.map((stack) => (
          <ConsumableButton
            key={stack.consumableId}
            consumableId={stack.consumableId}
            amount={stack.amount}
            onPress={() => handleConsumablePress(stack.consumableId)}
            onLongPress={() => handleConsumableLongPress(stack.consumableId)}
          />
        ))}

        {/* SP indicator */}
        <View style={styles.spContainer}>
          <Text style={styles.spText}>SP:{skills.skillPoints}</Text>
        </View>

        {/* Skills */}
        {unlockedSkills.map((skillId) => (
          <SkillButton
            key={skillId}
            skillId={skillId}
            level={skills.unlockedSkills[skillId]}
            cooldownRemaining={getSkillCooldownRemaining(skillId)}
            isReady={isSkillReady(skillId)}
            onPress={() => handleSkillPress(skillId)}
            onLongPress={() => handleSkillLongPress(skillId)}
          />
        ))}
      </View>

      {/* Skill Tooltip Modal */}
      <Modal
        visible={tooltipSkill !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipSkill(null)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setTooltipSkill(null)}
        >
          {tooltipSkill && (
            <View style={styles.tooltipContainer}>
              <View style={styles.tooltipHeader}>
                <Text style={styles.tooltipIcon}>{SKILLS[tooltipSkill].icon}</Text>
                <View>
                  <Text style={styles.tooltipName}>
                    {getDataName('skill', tooltipSkill, SKILLS[tooltipSkill].name)}
                  </Text>
                  <Text style={styles.tooltipLevel}>
                    Lv.{skills.unlockedSkills[tooltipSkill]}
                  </Text>
                </View>
              </View>
              <View style={styles.tooltipDivider} />
              <Text style={styles.tooltipEffect}>
                {getSkillDescription(SKILLS[tooltipSkill], skills.unlockedSkills[tooltipSkill])}
              </Text>
              <View style={styles.tooltipStats}>
                <Text style={styles.tooltipStat}>
                  ⏱️ {SKILLS[tooltipSkill].cooldown / 1000}s
                </Text>
                {skills.unlockedSkills[tooltipSkill] < SKILLS[tooltipSkill].maxLevel && (
                  <Text style={styles.tooltipStat}>
                    ⬆️ +{SKILLS[tooltipSkill].effectPerLevel}
                  </Text>
                )}
              </View>
              <Text style={styles.tooltipHint}>
                {t('common.cancel')}
              </Text>
            </View>
          )}
        </Pressable>
      </Modal>

      {/* Consumable Tooltip Modal */}
      <Modal
        visible={tooltipConsumable !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipConsumable(null)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setTooltipConsumable(null)}
        >
          {tooltipConsumable && (() => {
            const consumable = getConsumableById(tooltipConsumable);
            if (!consumable) return null;
            const stack = consumables.find(s => s.consumableId === tooltipConsumable);

            return (
              <View style={[styles.tooltipContainer, styles.consumableTooltip]}>
                <View style={styles.tooltipHeader}>
                  <Text style={styles.tooltipIcon}>{consumable.icon}</Text>
                  <View>
                    <Text style={styles.tooltipName}>
                      {getDataName('consumable', consumable.id, consumable.name)}
                    </Text>
                    <Text style={styles.tooltipType}>
                      {consumable.type === 'food' ? '🍖 ' + t('consumable.food') : '🧪 ' + t('consumable.potion')}
                    </Text>
                  </View>
                </View>
                <View style={styles.tooltipDivider} />
                <Text style={styles.tooltipEffect}>
                  {consumable.description}
                </Text>
                <View style={styles.tooltipStats}>
                  {consumable.effect.type === 'heal' && (
                    <Text style={[styles.tooltipStat, styles.healStat]}>
                      ❤️ +{consumable.effect.amount} HP
                    </Text>
                  )}
                  {consumable.effect.type === 'buff' && (
                    <>
                      <Text style={[styles.tooltipStat, styles.buffStat]}>
                        ⬆️ +{Math.round((consumable.effect.multiplier - 1) * 100)}%
                      </Text>
                      <Text style={styles.tooltipStat}>
                        ⏱️ {consumable.effect.duration / 1000}s
                      </Text>
                    </>
                  )}
                </View>
                {stack && (
                  <Text style={styles.tooltipAmount}>
                    {t('consumable.owned')}: {stack.amount}
                  </Text>
                )}
                <Text style={styles.tooltipHint}>
                  {t('common.cancel')}
                </Text>
              </View>
            );
          })()}
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(8),
    paddingVertical: scale(2),
  },
  buffsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scale(6),
    marginBottom: scale(2),
  },
  buffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    paddingHorizontal: scale(6),
    paddingVertical: scale(1),
    borderRadius: scale(10),
    gap: scale(2),
  },
  buffIcon: {
    fontSize: scale(12),
  },
  buffTime: {
    color: COLORS.textGold,
    fontSize: scale(9),
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(6),
  },
  actionButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(6),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  skillButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.buttonPrimary,
  },
  consumableButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.uncommon,
  },
  pauseButton: {
    backgroundColor: COLORS.panel,
    borderWidth: 1,
    borderColor: COLORS.textDim,
  },
  pauseButtonActive: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  locked: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: COLORS.textDim,
    opacity: 0.4,
  },
  onCooldown: {
    opacity: 0.6,
  },
  cooldownOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  buttonIcon: {
    fontSize: scale(18),
  },
  levelBadge: {
    position: 'absolute',
    bottom: scale(1),
    right: scale(2),
    fontSize: scale(8),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  amountBadge: {
    position: 'absolute',
    bottom: scale(1),
    right: scale(2),
    fontSize: scale(8),
    color: COLORS.text,
    fontWeight: 'bold',
    backgroundColor: COLORS.bg,
    paddingHorizontal: scale(2),
    borderRadius: scale(2),
  },
  spContainer: {
    paddingHorizontal: scale(6),
  },
  spText: {
    fontSize: scale(10),
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  // Tooltip styles
  tooltipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    padding: scale(16),
    minWidth: scale(200),
    maxWidth: scale(280),
    borderWidth: 2,
    borderColor: COLORS.buttonPrimary,
  },
  tooltipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
  },
  tooltipIcon: {
    fontSize: scale(32),
  },
  tooltipName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tooltipLevel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: COLORS.textDim,
    marginVertical: scale(10),
    opacity: 0.3,
  },
  tooltipEffect: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: scale(8),
  },
  tooltipStats: {
    flexDirection: 'row',
    gap: scale(16),
    marginBottom: scale(12),
  },
  tooltipStat: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  tooltipHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // Consumable tooltip specific
  consumableTooltip: {
    borderColor: COLORS.uncommon,
  },
  tooltipType: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  healStat: {
    color: COLORS.hpFull,
  },
  buffStat: {
    color: COLORS.textGold,
  },
  tooltipAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginBottom: scale(8),
  },
});
