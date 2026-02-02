import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import {
  ALL_COMBAT_STYLES,
  getStyleInfo,
  hasAdvantage,
  CombatStyle,
} from '../../data/combatStyles';
import { COLORS } from '../../constants/theme';

export const CombatStyleSelector: React.FC = () => {
  const combatStyle = useGameStore((state) => state.combatStyle);
  const currentEnemy = useGameStore((state) => state.currentEnemy);
  const setCombatStyle = useGameStore((state) => state.setCombatStyle);

  const renderStyleButton = (style: CombatStyle) => {
    const info = getStyleInfo(style);
    const isSelected = combatStyle === style;
    const enemyStyle = currentEnemy?.combatStyle;

    // Determine relationship with current enemy
    let relationship: 'advantage' | 'disadvantage' | 'neutral' | null = null;
    if (enemyStyle) {
      if (hasAdvantage(style, enemyStyle)) {
        relationship = 'advantage';
      } else if (hasAdvantage(enemyStyle, style)) {
        relationship = 'disadvantage';
      } else if (style !== enemyStyle) {
        relationship = 'neutral';
      }
    }

    return (
      <TouchableOpacity
        key={style}
        style={[
          styles.styleButton,
          isSelected && styles.selectedButton,
          isSelected && { borderColor: info.color },
        ]}
        onPress={() => setCombatStyle(style)}
        activeOpacity={0.7}
      >
        <Text style={styles.styleIcon}>{info.icon}</Text>
        <Text style={[styles.styleName, isSelected && { color: info.color }]}>
          {info.name}
        </Text>
        {relationship && enemyStyle && (
          <View
            style={[
              styles.relationshipBadge,
              relationship === 'advantage' && styles.advantageBadge,
              relationship === 'disadvantage' && styles.disadvantageBadge,
            ]}
          >
            <Text style={styles.relationshipText}>
              {relationship === 'advantage' ? '+50%' : relationship === 'disadvantage' ? '-50%' : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>戰鬥風格</Text>
        {currentEnemy && (
          <View style={styles.enemyStyleContainer}>
            <Text style={styles.enemyLabel}>敵人: </Text>
            <Text style={styles.enemyStyle}>
              {getStyleInfo(currentEnemy.combatStyle).icon}{' '}
              {getStyleInfo(currentEnemy.combatStyle).name}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.buttonRow}>
        {ALL_COMBAT_STYLES.map(renderStyleButton)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  enemyStyleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enemyLabel: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  enemyStyle: {
    color: COLORS.text,
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  styleButton: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedButton: {
    backgroundColor: COLORS.bg,
    borderWidth: 2,
  },
  styleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  styleName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  relationshipBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  advantageBadge: {
    backgroundColor: '#22c55e',
  },
  disadvantageBadge: {
    backgroundColor: '#ef4444',
  },
  relationshipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
