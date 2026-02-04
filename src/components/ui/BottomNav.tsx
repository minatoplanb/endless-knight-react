import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, scale, LAYOUT } from '../../constants/theme';
import { useGameStore } from '../../store/useGameStore';
import { useTranslation } from '../../locales';

interface NavItem {
  route: string;
  labelKey: keyof import('../../locales/types').LocaleStrings['nav'];
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/', labelKey: 'battle', icon: '⚔️' },
  { route: '/gathering', labelKey: 'gathering', icon: '⛏️' },
  { route: '/crafting', labelKey: 'crafting', icon: '🔨' },
  { route: '/equipment', labelKey: 'equipment', icon: '🛡️' },
  { route: '/skills', labelKey: 'skills', icon: '✨' },
  { route: '/quests', labelKey: 'quests', icon: '📋' },
  { route: '/prestige', labelKey: 'prestige', icon: '🔄' },
];

const NavButton = React.memo(
  ({
    item,
    isActive,
    onPress,
    badge,
  }: {
    item: NavItem & { label?: string };
    isActive: boolean;
    onPress: () => void;
    badge?: number;
  }) => {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.navButton,
          isActive && styles.navButtonActive,
          pressed && styles.navButtonPressed,
        ]}
        onPress={onPress}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.navIcon}>{item.icon}</Text>
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.navLabel,
            isActive && styles.navLabelActive,
          ]}
        >
          {item.label ?? item.labelKey}
        </Text>
      </Pressable>
    );
  }
);

export const BottomNav = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const quests = useGameStore((state) => state.quests);

  // Calculate unclaimed completed quests
  const unclaimedQuestCount = useMemo(() => {
    const dailyUnclaimed = quests.dailyQuests.filter((q) => q.completed && !q.claimed).length;
    const weeklyUnclaimed = quests.weeklyQuests.filter((q) => q.completed && !q.claimed).length;
    return dailyUnclaimed + weeklyUnclaimed;
  }, [quests]);

  const handlePress = useCallback(
    (route: string) => {
      if (route === '/') {
        router.replace('/');
      } else {
        router.push(route as any);
      }
    },
    [router]
  );

  const getBadge = (route: string): number | undefined => {
    if (route === '/quests') return unclaimedQuestCount;
    return undefined;
  };

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.route}
          item={{ ...item, label: t(`nav.${item.labelKey}`) }}
          isActive={pathname === item.route || (pathname === '' && item.route === '/')}
          onPress={() => handlePress(item.route)}
          badge={getBadge(item.route)}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: LAYOUT.bottomNavHeight,
    backgroundColor: COLORS.panel,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.bgLight,
  },
  navButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  navButtonActive: {
    backgroundColor: COLORS.bgLight,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: SPACING.xs,
  },
  navIcon: {
    fontSize: FONT_SIZES.xl,
  },
  badge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(8),
    backgroundColor: COLORS.hpLow,
    borderRadius: scale(8),
    minWidth: scale(16),
    height: scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  badgeText: {
    fontSize: scale(10),
    color: COLORS.text,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  navLabelActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
});
