import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { AREAS, getAreaById } from '../../data/areas';

export const AreaSelector = React.memo(() => {
  const stage = useGameStore((state) => state.stage);
  const unlockedAreas = useGameStore((state) => state.unlockedAreas);
  const areaProgress = useGameStore((state) => state.areaProgress);
  const changeArea = useGameStore((state) => state.changeArea);

  const currentAreaId = stage.currentAreaId;

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
            <TouchableOpacity
              key={area.id}
              style={[
                styles.areaButton,
                isSelected && styles.areaButtonSelected,
                !isUnlocked && styles.areaButtonLocked,
              ]}
              onPress={() => isUnlocked && changeArea(area.id)}
              disabled={!isUnlocked}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.areaName,
                  isSelected && styles.areaNameSelected,
                  !isUnlocked && styles.areaNameLocked,
                ]}
                numberOfLines={1}
              >
                {isUnlocked ? area.name : '???'}
              </Text>
              {isUnlocked && (
                <Text style={styles.areaProgress}>
                  {isCleared ? '完成' : `${progress?.currentStage || 1}/${area.stages}`}
                </Text>
              )}
              {!isUnlocked && (
                <Text style={styles.lockedText}>🔒</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
});
