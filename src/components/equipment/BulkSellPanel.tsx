import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { PressableButton } from '../common/PressableButton';
import { Rarity } from '../../types';
import { useTranslation } from '../../locales';

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

const RARITY_COLORS: Record<Rarity, string> = {
  common: COLORS.common,
  uncommon: COLORS.uncommon,
  rare: COLORS.rare,
  epic: COLORS.epic,
  legendary: COLORS.legendary,
};

const RARITY_NAMES_ZH: Record<Rarity, string> = {
  common: '普通',
  uncommon: '優良',
  rare: '稀有',
  epic: '史詩',
  legendary: '傳說',
};

const RARITY_NAMES_EN: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const BulkSellPanel: React.FC = () => {
  const { locale } = useTranslation();
  const inventory = useGameStore((state) => state.inventory);
  const sellAllByRarity = useGameStore((state) => state.sellAllByRarity);
  const sellAllUpToRarity = useGameStore((state) => state.sellAllUpToRarity);
  const getInventoryValueByRarity = useGameStore((state) => state.getInventoryValueByRarity);

  const RARITY_NAMES = locale === 'zh' ? RARITY_NAMES_ZH : RARITY_NAMES_EN;

  // Calculate counts for each rarity
  const rarityCounts = useMemo(() => {
    const counts: Record<Rarity, { count: number; gold: number }> = {
      common: { count: 0, gold: 0 },
      uncommon: { count: 0, gold: 0 },
      rare: { count: 0, gold: 0 },
      epic: { count: 0, gold: 0 },
      legendary: { count: 0, gold: 0 },
    };

    for (const rarity of RARITY_ORDER) {
      const value = getInventoryValueByRarity(rarity);
      counts[rarity] = value;
    }

    return counts;
  }, [inventory, getInventoryValueByRarity]);

  const handleSellRarity = useCallback((rarity: Rarity) => {
    const { count, gold } = rarityCounts[rarity];
    if (count === 0) return;

    const title = locale === 'zh' ? '確認賣出' : 'Confirm Sell';
    const message = locale === 'zh'
      ? `確定要賣出所有 ${count} 件${RARITY_NAMES[rarity]}裝備嗎？\n\n預計獲得：${gold.toLocaleString()} 金幣`
      : `Sell all ${count} ${RARITY_NAMES[rarity]} items?\n\nExpected: ${gold.toLocaleString()} gold`;

    Alert.alert(
      title,
      message,
      [
        { text: locale === 'zh' ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'zh' ? '賣出' : 'Sell',
          style: 'destructive',
          onPress: () => {
            const result = sellAllByRarity(rarity);
            if (result.count > 0) {
              Alert.alert(
                locale === 'zh' ? '賣出成功' : 'Sold!',
                locale === 'zh'
                  ? `賣出 ${result.count} 件裝備，獲得 ${result.gold.toLocaleString()} 金幣`
                  : `Sold ${result.count} items for ${result.gold.toLocaleString()} gold`
              );
            }
          },
        },
      ]
    );
  }, [rarityCounts, sellAllByRarity, locale, RARITY_NAMES]);

  const handleSellAllCommonUncommon = useCallback(() => {
    const commonCount = rarityCounts.common;
    const uncommonCount = rarityCounts.uncommon;
    const totalCount = commonCount.count + uncommonCount.count;
    const totalGold = commonCount.gold + uncommonCount.gold;

    if (totalCount === 0) return;

    const title = locale === 'zh' ? '快速清理' : 'Quick Sell';
    const message = locale === 'zh'
      ? `賣出所有普通+優良裝備？\n\n${commonCount.count} 件普通 + ${uncommonCount.count} 件優良\n預計獲得：${totalGold.toLocaleString()} 金幣`
      : `Sell all Common + Uncommon items?\n\n${commonCount.count} Common + ${uncommonCount.count} Uncommon\nExpected: ${totalGold.toLocaleString()} gold`;

    Alert.alert(
      title,
      message,
      [
        { text: locale === 'zh' ? '取消' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'zh' ? '賣出' : 'Sell',
          style: 'destructive',
          onPress: () => {
            const result = sellAllUpToRarity('uncommon');
            if (result.count > 0) {
              Alert.alert(
                locale === 'zh' ? '清理完成' : 'Cleared!',
                locale === 'zh'
                  ? `清理 ${result.count} 件裝備，獲得 ${result.gold.toLocaleString()} 金幣`
                  : `Cleared ${result.count} items for ${result.gold.toLocaleString()} gold`
              );
            }
          },
        },
      ]
    );
  }, [rarityCounts, sellAllUpToRarity, locale]);

  const totalItems = inventory.length;

  if (totalItems === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {locale === 'zh' ? '🗑️ 批量賣出' : '🗑️ Bulk Sell'}
        </Text>
        <Text style={styles.subtitle}>
          {locale === 'zh' ? `背包: ${totalItems} 件` : `Inventory: ${totalItems} items`}
        </Text>
      </View>

      {/* Quick sell button for common + uncommon */}
      <PressableButton
        title={locale === 'zh'
          ? `快速清理 (普通+優良) - ${rarityCounts.common.count + rarityCounts.uncommon.count} 件`
          : `Quick Clear (C+U) - ${rarityCounts.common.count + rarityCounts.uncommon.count} items`}
        onPress={handleSellAllCommonUncommon}
        variant="danger"
        size="medium"
        disabled={rarityCounts.common.count + rarityCounts.uncommon.count === 0}
        style={styles.quickSellButton}
      />

      {/* Individual rarity buttons */}
      <View style={styles.rarityGrid}>
        {RARITY_ORDER.slice(0, 4).map((rarity) => {
          const { count, gold } = rarityCounts[rarity];
          const buttonTitle = `${RARITY_NAMES[rarity]}\n${count}${locale === 'zh' ? '件' : ''} 💰${gold.toLocaleString()}`;
          return (
            <View key={rarity} style={styles.rarityItem}>
              <PressableButton
                onPress={() => handleSellRarity(rarity)}
                disabled={count === 0}
                variant="secondary"
                size="small"
                title={buttonTitle}
                textStyle={{ color: RARITY_COLORS[rarity], textAlign: 'center' }}
                style={styles.rarityButton}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(12),
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDim,
  },
  quickSellButton: {
    marginBottom: SPACING.md,
  },
  rarityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  rarityItem: {
    width: '48%',
  },
  rarityButton: {
    width: '100%',
    minHeight: scale(60),
  },
});

export default BulkSellPanel;
