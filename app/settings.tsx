import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, scale } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import { SAVE_KEY } from '../src/constants/game';
import { useRouter } from 'expo-router';
import { CONSUMABLES, Consumable } from '../src/data/consumables';
import { useTranslation } from '../src/locales';
import { firebaseService } from '../src/services/firebase';
import { useGoogleSignIn } from '../src/hooks/useGoogleSignIn';

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
  const { t, locale, setLocale, getDataName } = useTranslation();
  const saveGame = useGameStore((state) => state.saveGame);
  const statistics = useGameStore((state) => state.statistics);
  const consumables = useGameStore((state) => state.consumables);
  const autoConsumeEnabled = useGameStore((state) => state.autoConsumeEnabled);
  const autoConsumeThreshold = useGameStore((state) => state.autoConsumeThreshold);
  const autoConsumeSlot = useGameStore((state) => state.autoConsumeSlot);
  const setAutoConsume = useGameStore((state) => state.setAutoConsume);

  // Cloud sync state
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [cloudSaveInfo, setCloudSaveInfo] = useState<{ exists: boolean; updatedAt?: Date } | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Google Sign-In
  const { signIn: googleSignIn, signOut: googleSignOut, isLoading: isGoogleLoading, user, isAnonymous } = useGoogleSignIn();

  // Initialize Firebase and check status
  useEffect(() => {
    const initAndCheck = async () => {
      await firebaseService.initialize();
      if (firebaseService.isReady()) {
        setIsFirebaseReady(true);
        const info = await firebaseService.getCloudSaveInfo();
        setCloudSaveInfo(info);
      }
    };
    initAndCheck();
  }, []);

  // Refresh cloud save info when user changes
  useEffect(() => {
    const refreshCloudInfo = async () => {
      if (firebaseService.isReady()) {
        const info = await firebaseService.getCloudSaveInfo();
        setCloudSaveInfo(info);
      }
    };
    refreshCloudInfo();
  }, [user]);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      Alert.alert(
        locale === 'zh' ? '登入失敗' : 'Sign In Failed',
        locale === 'zh' ? '無法使用 Google 登入，請稍後再試' : 'Could not sign in with Google, please try again'
      );
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      locale === 'zh' ? '登出帳號' : 'Sign Out',
      locale === 'zh' ? '登出後將使用匿名帳戶，雲端存檔將與新帳戶綁定' : 'After signing out, you will use an anonymous account. Cloud saves will be linked to the new account.',
      [
        { text: locale === 'zh' ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'zh' ? '登出' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await googleSignOut();
          }
        },
      ]
    );
  };

  const handleCloudSync = async () => {
    if (!isFirebaseReady) {
      Alert.alert(
        locale === 'zh' ? '雲端服務未就緒' : 'Cloud Service Not Ready',
        locale === 'zh' ? '請稍後再試' : 'Please try again later'
      );
      return;
    }

    setIsCloudSyncing(true);
    try {
      await saveGame();
      const info = await firebaseService.getCloudSaveInfo();
      setCloudSaveInfo(info);
      Alert.alert(
        locale === 'zh' ? '同步成功' : 'Sync Successful',
        locale === 'zh' ? '遊戲進度已同步到雲端' : 'Game progress synced to cloud'
      );
    } catch (error) {
      Alert.alert(
        locale === 'zh' ? '同步失敗' : 'Sync Failed',
        locale === 'zh' ? '無法同步到雲端，請稍後再試' : 'Could not sync to cloud, please try again'
      );
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const formatCloudSaveTime = (): string => {
    if (!cloudSaveInfo?.exists || !cloudSaveInfo.updatedAt) {
      return locale === 'zh' ? '尚無雲端存檔' : 'No cloud save';
    }
    const date = cloudSaveInfo.updatedAt;
    return locale === 'zh'
      ? `上次同步: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
      : `Last sync: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleAutoConsumeToggle = useCallback((value: boolean) => {
    setAutoConsume(value);
  }, [setAutoConsume]);

  const handleSelectConsumable = useCallback(() => {
    const healingItems = getHealingConsumables();
    const ownedItems = healingItems.filter((item) =>
      consumables.some((c) => c.consumableId === item.id && c.amount > 0)
    );

    if (ownedItems.length === 0) {
      Alert.alert(t('settings.noHealingItems'), t('settings.noHealingItemsDesc'));
      return;
    }

    const options = ownedItems.map((item) => {
      const stack = consumables.find((c) => c.consumableId === item.id);
      const name = getDataName('consumable', item.id, item.name);
      return {
        text: `${item.icon} ${name} (x${stack?.amount || 0})`,
        onPress: () => setAutoConsume(autoConsumeEnabled, undefined, item.id),
      };
    });

    options.push({
      text: t('settings.clearSelection'),
      onPress: () => setAutoConsume(autoConsumeEnabled, undefined, null),
    });

    options.push({ text: t('common.cancel'), onPress: () => {} });

    Alert.alert(t('settings.selectConsumable'), t('settings.selectConsumableMessage'), options);
  }, [consumables, autoConsumeEnabled, setAutoConsume, t, getDataName]);

  const handleSelectThreshold = useCallback(() => {
    const thresholds = [
      { text: '20%', value: 0.2 },
      { text: '30%', value: 0.3 },
      { text: '40%', value: 0.4 },
      { text: '50%', value: 0.5 },
      { text: '60%', value: 0.6 },
    ];

    const options = thresholds.map((th) => ({
      text: th.text,
      onPress: () => setAutoConsume(autoConsumeEnabled, th.value),
    }));

    options.push({ text: t('common.cancel'), onPress: () => {} });

    Alert.alert(t('settings.selectThreshold'), t('settings.selectThresholdMessage'), options);
  }, [autoConsumeEnabled, setAutoConsume, t]);

  const getSelectedConsumableName = (): string => {
    if (!autoConsumeSlot) return t('common.unselected');
    const consumable = CONSUMABLES[autoConsumeSlot];
    if (!consumable) return t('common.unselected');
    const stack = consumables.find((c) => c.consumableId === autoConsumeSlot);
    const name = getDataName('consumable', consumable.id, consumable.name);
    return `${consumable.icon} ${name} (x${stack?.amount || 0})`;
  };

  const handleManualSave = async () => {
    await saveGame();
    Alert.alert(t('settings.saved'), t('settings.savedDesc'));
  };

  const handleResetGame = () => {
    Alert.alert(
      t('settings.resetGame'),
      t('settings.resetConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' as const },
        {
          text: t('settings.resetButton'),
          style: 'destructive' as const,
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(SAVE_KEY);
              Alert.alert(t('settings.resetDone'), t('settings.resetDoneDesc'));
            } catch (error) {
              console.error('Failed to reset:', error);
            }
          },
        },
      ]
    );
  };

  const handleLanguagePress = () => {
    Alert.alert(
      t('settings.language'),
      undefined,
      [
        { text: t('common.cancel'), style: 'cancel' as const },
        { text: t('settings.languageZh'), onPress: () => setLocale('zh') },
        { text: t('settings.languageEn'), onPress: () => setLocale('en') },
      ]
    );
  };

  const handleViewStats = () => {
    router.push('/stats');
  };

  const formatPlaytime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return locale === 'zh' ? `${hours}時 ${minutes}分` : `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <TopBar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>⚙️ {t('settings.title')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <TouchableOpacity style={styles.settingRow} onPress={handleLanguagePress}>
            <Text style={styles.settingIcon}>🌐</Text>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {locale === 'zh' ? t('settings.languageZh') : t('settings.languageEn')}
              </Text>
              <Text style={styles.settingDesc}>{t('settings.languageDesc')}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionGame')}</Text>
          <SettingRow
            icon="💾"
            title={t('settings.manualSave')}
            description={t('settings.manualSaveDesc')}
            onPress={handleManualSave}
          />
          <SettingRow
            icon="📊"
            title={t('settings.statistics')}
            description={`${t('settings.playtime')}: ${formatPlaytime(statistics.totalPlayTimeMs)}`}
            onPress={handleViewStats}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{locale === 'zh' ? '☁️ 雲端同步' : '☁️ Cloud Sync'}</Text>

          {/* Account Status */}
          <View style={styles.accountRow}>
            <Text style={styles.settingIcon}>{isAnonymous ? '👤' : '🔗'}</Text>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {isAnonymous
                  ? (locale === 'zh' ? '訪客帳戶' : 'Guest Account')
                  : (user?.email || (locale === 'zh' ? 'Google 帳戶' : 'Google Account'))}
              </Text>
              <Text style={styles.settingDesc}>
                {isAnonymous
                  ? (locale === 'zh' ? '登入 Google 以跨設備同步' : 'Sign in with Google to sync across devices')
                  : (locale === 'zh' ? '已連結 Google 帳戶' : 'Google account linked')}
              </Text>
            </View>
          </View>

          {/* Google Sign In / Sign Out Button */}
          <TouchableOpacity
            style={[styles.settingRow, isGoogleLoading && styles.settingRowDisabled]}
            onPress={isAnonymous ? handleGoogleSignIn : handleSignOut}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={COLORS.textGold} style={styles.settingIcon} />
            ) : (
              <Text style={styles.settingIcon}>{isAnonymous ? '🔑' : '🚪'}</Text>
            )}
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, !isAnonymous && styles.settingTitleDanger]}>
                {isAnonymous
                  ? (locale === 'zh' ? '使用 Google 登入' : 'Sign in with Google')
                  : (locale === 'zh' ? '登出' : 'Sign Out')}
              </Text>
              <Text style={styles.settingDesc}>
                {isAnonymous
                  ? (locale === 'zh' ? '跨設備同步遊戲進度' : 'Sync game progress across devices')
                  : (locale === 'zh' ? '切換回訪客帳戶' : 'Switch back to guest account')}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Sync Button */}
          <TouchableOpacity
            style={[styles.settingRow, isCloudSyncing && styles.settingRowDisabled]}
            onPress={handleCloudSync}
            disabled={isCloudSyncing}
          >
            {isCloudSyncing ? (
              <ActivityIndicator size="small" color={COLORS.textGold} style={styles.settingIcon} />
            ) : (
              <Text style={styles.settingIcon}>🔄</Text>
            )}
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>
                {locale === 'zh' ? '同步到雲端' : 'Sync to Cloud'}
              </Text>
              <Text style={styles.settingDesc}>{formatCloudSaveTime()}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Connection Status */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{locale === 'zh' ? '連線狀態' : 'Connection'}</Text>
            <Text style={[styles.infoValue, { color: isFirebaseReady ? COLORS.hpFull : COLORS.textDim }]}>
              {isFirebaseReady
                ? (locale === 'zh' ? '已連線' : 'Connected')
                : (locale === 'zh' ? '未連線' : 'Not Connected')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionAutoConsume')}</Text>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.settingTitle}>{t('settings.enableAutoConsume')}</Text>
              <Text style={styles.settingDesc}>{t('settings.autoConsumeDesc')}</Text>
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
              <Text style={[styles.settingTitle, !autoConsumeEnabled && styles.settingTitleDisabled]}>
                {t('settings.hpThreshold')}
              </Text>
              <Text style={styles.settingDesc}>
                {t('settings.triggerBelow').replace('{0}', String(Math.round(autoConsumeThreshold * 100)))}
              </Text>
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
              <Text style={[styles.settingTitle, !autoConsumeEnabled && styles.settingTitleDisabled]}>
                {t('settings.selectItem')}
              </Text>
              <Text style={styles.settingDesc}>{getSelectedConsumableName()}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.sectionVersion')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.gameVersion')}</Text>
            <Text style={styles.infoValue}>v1.2.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.totalKills')}</Text>
            <Text style={styles.infoValue}>{statistics.totalEnemiesKilled.toLocaleString()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('settings.totalGold')}</Text>
            <Text style={styles.infoValue}>{statistics.totalGoldEarned.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>{t('settings.sectionDanger')}</Text>
          <SettingRow
            icon="🗑️"
            title={t('settings.resetGame')}
            description={t('settings.resetDesc')}
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
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(68,102,170,0.2)',
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
