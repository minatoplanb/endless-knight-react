import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, Platform } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale, PIXEL_ART_IMAGE_STYLE, EQUIPMENT_EMOJI } from '../../constants/theme';
import { RARITY_NAMES, SLOT_NAMES } from '../../data/equipment';
import { Rarity, Equipment } from '../../types';

const RARITY_COLORS: Record<Rarity, string> = {
  common: COLORS.common,
  uncommon: COLORS.uncommon,
  rare: COLORS.rare,
  epic: COLORS.epic,
  legendary: COLORS.legendary,
};

const EQUIPMENT_ICONS: Record<string, any> = {
  sword_basic: require('../../../assets/icons/sword_basic.png'),
  sword_iron: require('../../../assets/icons/sword_iron.png'),
  axe: require('../../../assets/icons/axe.png'),
  bow: require('../../../assets/icons/bow.png'),
  staff: require('../../../assets/icons/staff.png'),
  helmet: require('../../../assets/icons/helmet.png'),
  armor: require('../../../assets/icons/armor.png'),
  shield: require('../../../assets/icons/shield.png'),
  ring: require('../../../assets/icons/ring.png'),
  amulet: require('../../../assets/icons/amulet.png'),
  gloves: require('../../../assets/icons/gloves.png'),
  boots: require('../../../assets/icons/boots.png'),
};

const formatStat = (key: string, value: number): string => {
  const sign = value >= 0 ? '+' : '';
  switch (key) {
    case 'atk':
      return `${sign}${value} 攻擊`;
    case 'def':
      return `${sign}${value} 防禦`;
    case 'maxHp':
      return `${sign}${value} 生命`;
    case 'attackSpeed':
      return `${sign}${(value * 100).toFixed(0)}% 攻速`;
    case 'critChance':
      return `${sign}${(value * 100).toFixed(1)}% 暴擊`;
    case 'critMultiplier':
      return `${sign}${(value * 100).toFixed(0)}% 暴傷`;
    default:
      return `${sign}${value}`;
  }
};

// Auto-dismiss duration in ms
const TOAST_DURATION = 3000;

export const LootModal = React.memo(() => {
  const showLootModal = useGameStore((state) => state.showLootModal);
  const pendingLoot = useGameStore((state) => state.pendingLoot);
  const dismissLootToast = useGameStore((state) => state.dismissLootToast);

  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const dismissTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showLootModal && pendingLoot) {
      // Clear previous timer
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }

      // Slide in animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after duration
      dismissTimer.current = setTimeout(() => {
        handleDismiss();
      }, TOAST_DURATION);
    }

    return () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, [showLootModal, pendingLoot?.id]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissLootToast();
    });
  };

  if (!showLootModal || !pendingLoot) return null;

  const rarityColor = RARITY_COLORS[pendingLoot.rarity];
  const iconSource = EQUIPMENT_ICONS[pendingLoot.icon];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity activeOpacity={0.8} onPress={handleDismiss}>
        <View style={[styles.toast, { borderColor: rarityColor }]}>
          <View style={styles.header}>
            <Text style={styles.headerText}>獲得裝備！</Text>
          </View>
          <View style={styles.content}>
            {iconSource && (
              Platform.OS === 'web' ? (
                <Image source={iconSource} style={[styles.icon, PIXEL_ART_IMAGE_STYLE]} resizeMode="contain" />
              ) : (
                <Text style={styles.iconEmoji}>{EQUIPMENT_EMOJI[pendingLoot.icon] ?? '❓'}</Text>
              )
            )}
            <View style={styles.info}>
              <Text style={[styles.itemName, { color: rarityColor }]}>
                {pendingLoot.name}
              </Text>
              <Text style={styles.itemMeta}>
                {RARITY_NAMES[pendingLoot.rarity]} {SLOT_NAMES[pendingLoot.slot]}
              </Text>
              <View style={styles.statsRow}>
                {Object.entries(pendingLoot.stats).map(([key, value]) =>
                  value !== 0 ? (
                    <Text
                      key={key}
                      style={[
                        styles.statText,
                        { color: value > 0 ? COLORS.hpFull : COLORS.hpLow },
                      ]}
                    >
                      {formatStat(key, value)}
                    </Text>
                  ) : null
                )}
              </View>
            </View>
          </View>
          <Text style={styles.autoText}>點擊關閉</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: scale(60),
    left: SPACING.lg,
    right: SPACING.lg,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    borderWidth: 2,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textGold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  icon: {
    width: scale(40),
    height: scale(40),
    marginRight: SPACING.md,
  },
  iconEmoji: {
    fontSize: scale(24),
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  itemMeta: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
  },
  autoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    textAlign: 'center',
    paddingBottom: SPACING.sm,
  },
});
