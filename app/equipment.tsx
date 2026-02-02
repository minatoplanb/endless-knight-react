import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, LAYOUT } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { EquipmentPanel, InventoryGrid, BackpackUpgradePanel } from '../src/components/equipment';

export default function EquipmentScreen() {
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EquipmentPanel />
        <BackpackUpgradePanel />
        <InventoryGrid />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: LAYOUT.bottomNavHeight + SPACING.md,
  },
});
