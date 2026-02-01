import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { useGameStore } from '../src/store/useGameStore';
import { GameEngine } from '../src/engine/GameEngine';

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
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.bg },
          animation: Platform.OS === 'web' ? 'none' : 'fade',
        }}
      />
    </>
  );

  if (Platform.OS === 'web') {
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
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
  } as any,
});
