import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import { formatNumber } from '../src/utils/format';

interface StatRowProps {
  label: string;
  value: string | number;
  icon?: string;
}

const StatRow: React.FC<StatRowProps> = ({ label, value, icon }) => (
  <View style={styles.statRow}>
    {icon && <Text style={styles.statIcon}>{icon}</Text>}
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{typeof value === 'number' ? formatNumber(value) : value}</Text>
  </View>
);

interface StatSectionProps {
  title: string;
  children: React.ReactNode;
}

const StatSection: React.FC<StatSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}天 ${hours % 24}時`;
  }
  if (hours > 0) {
    return `${hours}時 ${minutes % 60}分`;
  }
  if (minutes > 0) {
    return `${minutes}分 ${seconds % 60}秒`;
  }
  return `${seconds}秒`;
};

export default function StatsPage() {
  const statistics = useGameStore((state) => state.statistics);

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>📊 遊戲統計</Text>

        <StatSection title="戰鬥統計">
          <StatRow icon="💀" label="擊殺敵人" value={statistics.totalEnemiesKilled} />
          <StatRow icon="👑" label="擊殺 Boss" value={statistics.totalBossesKilled} />
          <StatRow icon="☠️" label="死亡次數" value={statistics.totalDeaths} />
          <StatRow icon="🔥" label="當前連殺" value={statistics.currentKillStreak} />
          <StatRow icon="⚡" label="最長連殺" value={statistics.longestKillStreak} />
        </StatSection>

        <StatSection title="傷害統計">
          <StatRow icon="⚔️" label="總傷害輸出" value={statistics.totalDamageDealt} />
          <StatRow icon="🛡️" label="總傷害承受" value={statistics.totalDamageTaken} />
          <StatRow icon="💥" label="暴擊次數" value={statistics.totalCriticalHits} />
          <StatRow icon="🎯" label="最高單次傷害" value={statistics.highestDamageDealt} />
        </StatSection>

        <StatSection title="經濟統計">
          <StatRow icon="💰" label="總金幣獲得" value={statistics.totalGoldEarned} />
        </StatSection>

        <StatSection title="活動統計">
          <StatRow icon="🔨" label="物品製作" value={statistics.itemsCrafted} />
          <StatRow icon="🍖" label="消耗品使用" value={statistics.consumablesUsed} />
          <StatRow icon="✨" label="技能使用" value={statistics.skillsUsed} />
        </StatSection>

        <StatSection title="時間統計">
          <StatRow icon="⏱️" label="總遊戲時間" value={formatTime(statistics.totalPlayTimeMs)} />
        </StatSection>
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
    paddingBottom: SPACING.xl,
  },
  pageTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textGold,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sectionContent: {
    padding: SPACING.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  statIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
    width: scale(24),
    textAlign: 'center',
  },
  statLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  statValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
