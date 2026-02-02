import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import { SAVE_KEY } from '../src/constants/game';
import { useRouter } from 'expo-router';
import { CONSUMABLES, Consumable } from '../src/data/consumables';

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

// Get healing consumables only
const getHealingConsumables = (): Consumable[] => {
  return Object.values(CONSUMABLES).filter((c) => c.effect.type === 'heal');
};

export default function SettingsPage() {
  const router = useRouter();
  const saveGame = useGameStore((state) => state.saveGame);
  const statistics = useGameStore((state) => state.statistics);
  const consumables = useGameStore((state) => state.consumables);
  const autoConsumeEnabled = useGameStore((state) => state.autoConsumeEnabled);
  const autoConsumeThreshold = useGameStore((state) => state.autoConsumeThreshold);
  const autoConsumeSlot = useGameStore((state) => state.autoConsumeSlot);
  const setAutoConsume = useGameStore((state) => state.setAutoConsume);

  const handleAutoConsumeToggle = useCallback((value: boolean) => {
    setAutoConsume(value);
  }, [setAutoConsume]);

  const handleSelectConsumable = useCallback(() => {
    const healingItems = getHealingConsumables();
    const ownedItems = healingItems.filter((item) =>
      consumables.some((c) => c.consumableId === item.id && c.amount > 0)
    );

    if (ownedItems.length === 0) {
      Alert.alert('沒有回復道具', '你目前沒有任何回復道具。請先製作一些食物或藥水。');
      return;
    }

    const options = ownedItems.map((item) => {
      const stack = consumables.find((c) => c.consumableId === item.id);
      return {
        text: `${item.icon} ${item.name} (x${stack?.amount || 0})`,
        onPress: () => setAutoConsume(autoConsumeEnabled, undefined, item.id),
      };
    });

    options.push({
      text: '清除選擇',
      onPress: () => setAutoConsume(autoConsumeEnabled, undefined, null),
    });

    options.push({ text: '取消', onPress: () => {} });

    Alert.alert('選擇自動使用的道具', '選擇要在 HP 低於閾值時自動使用的道具：', options);
  }, [consumables, autoConsumeEnabled, setAutoConsume]);

  const handleSelectThreshold = useCallback(() => {
    const thresholds = [
      { text: '20%', value: 0.2 },
      { text: '30%', value: 0.3 },
      { text: '40%', value: 0.4 },
      { text: '50%', value: 0.5 },
      { text: '60%', value: 0.6 },
    ];

    const options = thresholds.map((t) => ({
      text: t.text,
      onPress: () => setAutoConsume(autoConsumeEnabled, t.value),
    }));

    options.push({ text: '取消', onPress: () => {} });

    Alert.alert('選擇 HP 閾值', '當 HP 低於此百分比時自動使用道具：', options);
  }, [autoConsumeEnabled, setAutoConsume]);

  const getSelectedConsumableName = (): string => {
    if (!autoConsumeSlot) return '未選擇';
    const consumable = CONSUMABLES[autoConsumeSlot];
    if (!consumable) return '未選擇';
    const stack = consumables.find((c) => c.consumableId === autoConsumeSlot);
    return `${consumable.icon} ${consumable.name} (x${stack?.amount || 0})`;
  };

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
          <Text style={styles.sectionTitle}>自動消耗品</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.settingTitle}>啟用自動吃藥</Text>
              <Text style={styles.settingDesc}>HP 低於閾值時自動使用回復道具</Text>
            </View>
            <Switch
              value={autoConsumeEnabled}
              onValueChange={handleAutoConsumeToggle}
              trackColor={{ false: COLORS.bgLight, true: COLORS.buttonSuccess }}
              thumbColor={autoConsumeEnabled ? COLORS.text : COLORS.textDim}
            />
          </View>
          <TouchableOpacity
            style={[styles.settingRow, !autoConsumeEnabled && styles.settingRowDisabled]}
            onPress={handleSelectThreshold}
            disabled={!autoConsumeEnabled}
          >
            <Text style={styles.settingIcon}>📉</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, !autoConsumeEnabled && styles.settingTitleDisabled]}>HP 閾值</Text>
              <Text style={styles.settingDesc}>低於 {Math.round(autoConsumeThreshold * 100)}% 時觸發</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingRow, !autoConsumeEnabled && styles.settingRowDisabled]}
            onPress={handleSelectConsumable}
            disabled={!autoConsumeEnabled}
          >
            <Text style={styles.settingIcon}>🍖</Text>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, !autoConsumeEnabled && styles.settingTitleDisabled]}>選擇道具</Text>
              <Text style={styles.settingDesc}>{getSelectedConsumableName()}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>版本資訊</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>遊戲版本</Text>
            <Text style={styles.infoValue}>v1.2.0</Text>
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
  settingRowDisabled: {
    opacity: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  switchInfo: {
    flex: 1,
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
  settingTitleDisabled: {
    color: COLORS.textDim,
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
