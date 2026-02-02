import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, scale } from '../../constants/theme';
import { ResourceType } from '../../types';
import { RESOURCES, ALL_RESOURCES } from '../../data/resources';
import { useGameStore } from '../../store/useGameStore';

interface ResourceItemProps {
  resourceType: ResourceType;
}

const ResourceItem = React.memo(({ resourceType }: ResourceItemProps) => {
  const amount = useGameStore((state) => state.gathering.resources[resourceType]);
  const cap = useGameStore((state) => state.gathering.resourceCaps[resourceType]);
  const resourceDef = RESOURCES[resourceType];

  const isFull = amount >= cap;

  return (
    <View style={styles.resourceItem}>
      <Text style={styles.resourceIcon}>{resourceDef.icon}</Text>
      <Text style={[styles.resourceText, isFull && styles.resourceFull]}>
        {amount}/{cap}
      </Text>
    </View>
  );
});

export const ResourceBar = React.memo(() => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>資源倉庫</Text>
      <View style={styles.resourceGrid}>
        {ALL_RESOURCES.map((resourceType) => (
          <ResourceItem key={resourceType} resourceType={resourceType} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: scale(8),
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  title: {
    color: COLORS.textDim,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
  },
  resourceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.xs,
  },
  resourceIcon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.xs,
  },
  resourceText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.sm,
  },
  resourceFull: {
    color: COLORS.textGold,
  },
});
