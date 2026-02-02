import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { AreaSelector } from '../src/components/ui/AreaSelector';
import { BattleView } from '../src/components/battle/BattleView';
import { StageProgress } from '../src/components/battle/StageProgress';
import { UpgradePanel } from '../src/components/ui/UpgradePanel';
import { DeathModal } from '../src/components/modals/DeathModal';
import { OfflineModal } from '../src/components/modals/OfflineModal';

export default function GameScreen() {
  return (
    <View style={styles.container}>
      <TopBar />
      <AreaSelector />
      <BattleView />
      <StageProgress />
      <UpgradePanel />

      {/* Modals */}
      <DeathModal />
      <OfflineModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
