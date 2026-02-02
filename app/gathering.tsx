import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale, LAYOUT } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { WorkerCard, ResourceBar } from '../src/components/gathering';
import { ALL_WORKERS } from '../src/data/gathering';

export default function GatheringScreen() {
  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>採集</Text>
        <Text style={styles.subtitle}>工人在背景自動採集資源</Text>

        <View style={styles.workersGrid}>
          {ALL_WORKERS.map((workerType) => (
            <WorkerCard key={workerType} workerType={workerType} />
          ))}
        </View>

        <ResourceBar />
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
    paddingBottom: SPACING.xxl,
  },
  title: {
    color: COLORS.text,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.lg,
  },
  workersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
