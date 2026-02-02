import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/useGameStore';
import { getConsumableById } from '../../data/consumables';
import { COLORS } from '../../constants/theme';

export const ConsumableSlots: React.FC = () => {
  const consumables = useGameStore((state) => state.consumables);
  const activeBuffs = useGameStore((state) => state.activeBuffs);
  const useConsumable = useGameStore((state) => state.useConsumable);

  // Show first 4 consumables as quick slots
  const slots = consumables.slice(0, 4);

  const handleUse = (consumableId: string) => {
    useConsumable(consumableId);
  };

  // Format remaining buff time
  const formatBuffTime = (expiresAt: number) => {
    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    return `${remaining}s`;
  };

  if (slots.length === 0 && activeBuffs.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Active Buffs */}
      {activeBuffs.length > 0 && (
        <View style={styles.buffsRow}>
          {activeBuffs.map((buff) => {
            const consumable = getConsumableById(buff.sourceId);
            return (
              <View key={buff.id} style={styles.buffBadge}>
                <Text style={styles.buffIcon}>
                  {consumable?.icon || '✨'}
                </Text>
                <Text style={styles.buffTime}>
                  {formatBuffTime(buff.expiresAt)}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Quick Slots */}
      {slots.length > 0 && (
        <View style={styles.slotsRow}>
          {slots.map((stack) => {
            const consumable = getConsumableById(stack.consumableId);
            if (!consumable) return null;

            return (
              <TouchableOpacity
                key={stack.consumableId}
                style={styles.slot}
                onPress={() => handleUse(stack.consumableId)}
                activeOpacity={0.7}
              >
                <Text style={styles.slotIcon}>{consumable.icon}</Text>
                <View style={styles.slotAmount}>
                  <Text style={styles.slotAmountText}>{stack.amount}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  buffsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  buffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  buffIcon: {
    fontSize: 14,
  },
  buffTime: {
    color: COLORS.textGold,
    fontSize: 10,
    fontWeight: 'bold',
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  slot: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  slotIcon: {
    fontSize: 24,
  },
  slotAmount: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  slotAmountText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
