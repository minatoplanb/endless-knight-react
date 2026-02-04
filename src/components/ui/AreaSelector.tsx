import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { AREAS, Area } from '../../data/areas';
import { useTranslation } from '../../locales';

export const AreaSelector = React.memo(() => {
  const { t, getDataName } = useTranslation();
  const stage = useGameStore((state) => state.stage);
  const unlockedAreas = useGameStore((state) => state.unlockedAreas);
  const areaProgress = useGameStore((state) => state.areaProgress);
  const changeArea = useGameStore((state) => state.changeArea);
  const [tooltipArea, setTooltipArea] = useState<Area | null>(null);

  const currentAreaId = stage.currentAreaId;

  const handleLongPress = useCallback((area: Area) => {
    setTooltipArea(area);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {AREAS.map((area) => {
          const isUnlocked = unlockedAreas.includes(area.id);
          const isSelected = area.id === currentAreaId;
          const progress = areaProgress[area.id];
          const isCleared = progress?.cleared || false;

          return (
            <Pressable
              key={area.id}
              style={[
                styles.areaButton,
                isSelected && styles.areaButtonSelected,
                !isUnlocked && styles.areaButtonLocked,
              ]}
              onPress={() => isUnlocked && changeArea(area.id)}
              onLongPress={() => isUnlocked && handleLongPress(area)}
              delayLongPress={300}
              disabled={!isUnlocked}
            >
              <Text
                style={[
                  styles.areaName,
                  isSelected && styles.areaNameSelected,
                  !isUnlocked && styles.areaNameLocked,
                ]}
                numberOfLines={1}
              >
                {isUnlocked ? getDataName('area', area.id, area.name) : '???'}
              </Text>
              {isUnlocked && (
                <Text style={styles.areaProgress}>
                  {isCleared ? t('area.cleared') : `${progress?.currentStage || 1}/${area.stages}`}
                </Text>
              )}
              {!isUnlocked && (
                <Text style={styles.lockedText}>🔒</Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Area Tooltip Modal */}
      <Modal
        visible={tooltipArea !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipArea(null)}
      >
        <Pressable
          style={styles.tooltipOverlay}
          onPress={() => setTooltipArea(null)}
        >
          {tooltipArea && (
            <View style={styles.tooltipContainer}>
              <Text style={styles.tooltipName}>
                {getDataName('area', tooltipArea.id, tooltipArea.name)}
              </Text>
              <View style={styles.tooltipDivider} />
              <View style={styles.tooltipRow}>
                <Text style={styles.tooltipLabel}>{t('common.stage')}:</Text>
                <Text style={styles.tooltipValue}>
                  {areaProgress[tooltipArea.id]?.currentStage || 1}/{tooltipArea.stages}
                </Text>
              </View>
              <View style={styles.tooltipRow}>
                <Text style={styles.tooltipLabel}>{t('area.recommended')}:</Text>
                <Text style={styles.tooltipValue}>Lv.{tooltipArea.requiredLevel}</Text>
              </View>
              <View style={styles.tooltipRow}>
                <Text style={styles.tooltipLabel}>👹 {t('area.enemyLevel')}:</Text>
                <Text style={styles.tooltipValue}>
                  {tooltipArea.enemies.length} types
                </Text>
              </View>
              <Text style={styles.tooltipHint}>{t('common.cancel')}</Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: scale(50),
    backgroundColor: COLORS.panel,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgLight,
  },
  scrollContent: {
    paddingHorizontal: SPACING.sm,
    alignItems: 'center',
  },
  areaButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginHorizontal: SPACING.xs,
    backgroundColor: COLORS.bgLight,
    borderRadius: scale(8),
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: scale(80),
    alignItems: 'center',
  },
  areaButtonSelected: {
    borderColor: COLORS.textGold,
    backgroundColor: COLORS.panel,
  },
  areaButtonLocked: {
    opacity: 0.5,
  },
  areaName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  areaNameSelected: {
    color: COLORS.textGold,
    fontWeight: 'bold',
  },
  areaNameLocked: {
    color: COLORS.textDim,
  },
  areaProgress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: 2,
  },
  lockedText: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
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
    borderColor: COLORS.textGold,
  },
  tooltipName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textGold,
    textAlign: 'center',
    marginBottom: scale(4),
  },
  tooltipDivider: {
    height: 1,
    backgroundColor: COLORS.textDim,
    marginVertical: scale(10),
    opacity: 0.3,
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scale(6),
  },
  tooltipLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  tooltipValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  tooltipHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: scale(12),
  },
});
