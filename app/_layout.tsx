import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { useGameStore } from '../src/store/useGameStore';
import { GameEngine } from '../src/engine/GameEngine';
import { LocaleProvider } from '../src/locales';
import { BottomNav } from '../src/components/ui/BottomNav';
import { LootModal } from '../src/components/modals/LootModal';
import { AchievementModal } from '../src/components/modals/AchievementModal';
import { DailyRewardModal } from '../src/components/modals/DailyRewardModal';

export default function RootLayout() {
  const loadGame = useGameStore((state) => state.loadGame);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await loadGame();
        GameEngine.start();
        setIsReady(true);
      } catch (e) {
        console.error('Init error:', e);
        setIsReady(true);
      }
    };
    init();

    return () => {
      GameEngine.stop();
    };
  }, []);

  const content = (
    <LocaleProvider>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <View style={styles.mainContent}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: Platform.OS === 'web' ? 'none' : 'fade',
          }}
        />
      </View>
      <BottomNav />
      <LootModal />
      <AchievementModal />
      <DailyRewardModal />
    </LocaleProvider>
  );

  if (Platform.OS === 'web') {
    // Check if on mobile browser (touch device)
    const isMobileWeb = typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (isMobileWeb) {
      // Full screen on mobile web - no phone frame
      return (
        <View style={styles.mobileWebContainer}>
          {content}
        </View>
      );
    }

    // Desktop: show phone frame emulation
    return (
      <View style={styles.webWrapper}>
        <View style={styles.phoneFrame}>
          {content}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        {content}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  mainContent: {
    flex: 1,
  },
  mobileWebContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    width: '100%',
    height: '100dvh', // Dynamic viewport height for mobile browsers
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', // Ensure minimum bottom padding
    display: 'flex',
    flexDirection: 'column',
  } as any,
  webWrapper: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneFrame: {
    width: 375,
    height: 812,
    maxHeight: '100vh',
    backgroundColor: COLORS.bg,
    overflow: 'hidden',
    borderRadius: 20,
    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
  } as any,
});
