import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, scale, LAYOUT } from '../../constants/theme';

interface NavItem {
  route: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { route: '/', label: '戰鬥', icon: '⚔️' },
  { route: '/gathering', label: '採集', icon: '⛏️' },
  { route: '/crafting', label: '製作', icon: '🔨' },
  { route: '/equipment', label: '裝備', icon: '🛡️' },
  { route: '/skills', label: '技能', icon: '✨' },
  { route: '/prestige', label: '轉生', icon: '🔄' },
];

const NavButton = React.memo(
  ({
    item,
    isActive,
    onPress,
  }: {
    item: NavItem;
    isActive: boolean;
    onPress: () => void;
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
        <Text style={styles.navIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.navLabel,
            isActive && styles.navLabelActive,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  }
);

export const BottomNav = React.memo(() => {
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <View style={styles.container}>
      {NAV_ITEMS.map((item) => (
        <NavButton
          key={item.route}
          item={item}
          isActive={pathname === item.route || (pathname === '' && item.route === '/')}
          onPress={() => handlePress(item.route)}
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
  navIcon: {
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.xs,
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
