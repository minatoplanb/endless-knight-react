import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import { SAVE_KEY } from '../src/constants/game';
import { useRouter } from 'expo-router';

interface SettingRowProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, title, description, onPress, danger }) => (
  <TouchableOpacity
    style={[styles.settingRow, danger && styles.settingRowDanger]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.settingIcon}>{icon}</Text>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingTitle, danger && styles.settingTitleDanger]}>{title}</Text>
      <Text style={styles.settingDesc}>{description}</Text>
    </View>
    <Text style={styles.arrow}>›</Text>
  </TouchableOpacity>
);

export default function SettingsPage() {
  const router = useRouter();
  const saveGame = useGameStore((state) => state.saveGame);
  const statistics = useGameStore((state) => state.statistics);

  const handleManualSave = async () => {
    await saveGame();
    Alert.alert('已儲存', '遊戲進度已手動儲存');
  };

  const handleResetGame = () => {
    Alert.alert(
      '重置遊戲',
      '確定要重置所有遊戲進度嗎？此操作無法復原！',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(SAVE_KEY);
              Alert.alert('已重置', '請重新啟動遊戲以套用變更');
            } catch (error) {
              console.error('Failed to reset:', error);
            }
          },
        },
      ]
    );
  };

  const handleViewStats = () => {
    router.push('/stats');
  };

  const formatPlaytime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}時 ${minutes}分`;
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>⚙️ 設定</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>遊戲</Text>
          <SettingRow
            icon="💾"
            title="手動儲存"
            description="立即儲存遊戲進度"
            onPress={handleManualSave}
          />
          <SettingRow
            icon="📊"
            title="遊戲統計"
            description={`總遊戲時間: ${formatPlaytime(statistics.totalPlayTimeMs)}`}
            onPress={handleViewStats}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>版本資訊</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>遊戲版本</Text>
            <Text style={styles.infoValue}>v1.1.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>擊殺總數</Text>
            <Text style={styles.infoValue}>{statistics.totalEnemiesKilled.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>金幣總計</Text>
            <Text style={styles.infoValue}>{statistics.totalGoldEarned.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>危險區域</Text>
          <SettingRow
            icon="🗑️"
            title="重置遊戲"
            description="刪除所有進度並重新開始"
            onPress={handleResetGame}
            danger
          />
        </View>

        <View style={styles.credits}>
          <Text style={styles.creditsText}>Endless Knight</Text>
          <Text style={styles.creditsSubtext}>Made with Claude Code</Text>
        </View>
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
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textGold,
    padding: SPACING.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dangerTitle: {
    color: COLORS.hpLow,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingRowDanger: {
    backgroundColor: 'rgba(255,68,68,0.1)',
  },
  settingIcon: {
    fontSize: FONT_SIZES.lg,
    marginRight: SPACING.md,
    width: scale(30),
    textAlign: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  settingTitleDanger: {
    color: COLORS.hpLow,
  },
  settingDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
  arrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textDim,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  infoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  credits: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textDim,
    fontWeight: 'bold',
  },
  creditsSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDim,
    marginTop: SPACING.xs,
  },
});
