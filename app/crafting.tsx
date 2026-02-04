import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { COLORS } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import { CraftingCategory } from '../src/types';
import {
  CRAFTING_CATEGORIES,
  RECIPES,
  getRecipesByCategory,
  canAffordRecipe,
  Recipe,
} from '../src/data/crafting';
import { getConsumableById } from '../src/data/consumables';
import { formatNumber } from '../src/utils/format';
import { audioManager } from '../src/lib/audio';

const CategoryTab: React.FC<{
  category: CraftingCategory;
  isSelected: boolean;
  onPress: () => void;
}> = ({ category, isSelected, onPress }) => {
  const info = CRAFTING_CATEGORIES[category];
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    audioManager.playClick();
    onPress();
  }, [onPress]);

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      {(state) => {
        const hovered = Platform.OS === 'web' && (state as any).hovered;
        return (
          <Animated.View
            style={[
              styles.categoryTab,
              isSelected && styles.categoryTabSelected,
              hovered && !isSelected && styles.categoryTabHovered,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.categoryIcon}>{info.icon}</Text>
            <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
              {info.name}
            </Text>
          </Animated.View>
        );
      }}
    </Pressable>
  );
};

const CraftButton: React.FC<{
  canAfford: boolean;
  onPress: () => void;
}> = ({ canAfford, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (!canAfford) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim, canAfford]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (canAfford) {
      audioManager.playSuccess();
      onPress();
    } else {
      audioManager.playError();
    }
  }, [canAfford, onPress]);

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={!canAfford}
      style={styles.craftButtonContainer}
    >
      {(state) => {
        const hovered = Platform.OS === 'web' && (state as any).hovered;
        return (
          <Animated.View
            style={[
              styles.craftButton,
              !canAfford && styles.craftButtonDisabled,
              canAfford && hovered && styles.craftButtonHovered,
              canAfford && state.pressed && styles.craftButtonPressed,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <Text style={styles.craftButtonText}>
              {canAfford ? '製作' : '材料不足'}
            </Text>
          </Animated.View>
        );
      }}
    </Pressable>
  );
};

const PART_ICONS: Record<string, string> = {
  common_part: '🦴',
  rare_part: '💎',
  boss_part: '👑',
};

const RecipeCard: React.FC<{
  recipe: Recipe;
  canAfford: boolean;
  onCraft: (quantity: number) => void;
}> = ({ recipe, canAfford, onCraft }) => {
  const [quantity, setQuantity] = useState(1);
  const resources = useGameStore((state) => state.gathering.resources);
  const gold = useGameStore((state) => state.gold);
  const monsterParts = useGameStore((state) => state.monsterParts);

  // Calculate max craftable quantity
  const maxQuantity = React.useMemo(() => {
    let max = 99;
    for (const [resource, amount] of Object.entries(recipe.costs)) {
      const available = resources[resource as keyof typeof resources] || 0;
      max = Math.min(max, Math.floor(available / amount));
    }
    if (recipe.goldCost) {
      max = Math.min(max, Math.floor(gold / recipe.goldCost));
    }
    if (recipe.partCosts) {
      for (const [part, amount] of Object.entries(recipe.partCosts)) {
        const available = monsterParts[part as keyof typeof monsterParts] || 0;
        max = Math.min(max, Math.floor(available / amount));
      }
    }
    return Math.max(0, max);
  }, [recipe, resources, gold, monsterParts]);

  // Only show quantity controls for consumables
  const showQuantity = recipe.itemType === 'consumable' && maxQuantity > 1;

  const handleQuantityChange = useCallback((delta: number) => {
    setQuantity(prev => Math.max(1, Math.min(maxQuantity, prev + delta)));
  }, [maxQuantity]);

  const handleCraft = useCallback(() => {
    onCraft(quantity);
    setQuantity(1); // Reset after craft
  }, [onCraft, quantity]);

  return (
    <View style={[
      styles.recipeCard,
      !canAfford && styles.recipeCardDisabled,
      canAfford && styles.recipeCardCraftable,
    ]}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeIcon}>{recipe.icon}</Text>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeDesc}>{recipe.description}</Text>
        </View>
        <Text style={styles.recipeAmount}>x{recipe.outputAmount}</Text>
      </View>

      <View style={styles.recipeCosts}>
        {Object.entries(recipe.costs).map(([resource, amount]) => {
          const totalCost = amount * quantity;
          const hasEnough = resources[resource as keyof typeof resources] >= totalCost;
          return (
            <View key={resource} style={styles.costItem}>
              <Text style={[styles.costText, !hasEnough && styles.costTextInsufficient]}>
                {resource === 'ore' ? '🪨' :
                 resource === 'wood' ? '🪵' :
                 resource === 'fish' ? '🐟' : '🌿'}
                {' '}{totalCost}
              </Text>
            </View>
          );
        })}
        {recipe.goldCost && (
          <View style={styles.costItem}>
            <Text style={[styles.costText, gold < recipe.goldCost * quantity && styles.costTextInsufficient]}>
              💰 {formatNumber(recipe.goldCost * quantity)}
            </Text>
          </View>
        )}
        {recipe.partCosts && Object.entries(recipe.partCosts).map(([part, amount]) => {
          const totalCost = amount * quantity;
          const hasEnough = (monsterParts[part as keyof typeof monsterParts] || 0) >= totalCost;
          return (
            <View key={part} style={styles.costItem}>
              <Text style={[styles.costText, !hasEnough && styles.costTextInsufficient]}>
                {PART_ICONS[part] || '❓'} {totalCost}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.craftRow}>
        {showQuantity && (
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => handleQuantityChange(-1)}
              style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              onPress={() => handleQuantityChange(1)}
              style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
            <Pressable
              onPress={() => setQuantity(maxQuantity)}
              style={[styles.maxButton, maxQuantity === 0 && styles.quantityButtonDisabled]}
            >
              <Text style={styles.maxButtonText}>MAX</Text>
            </Pressable>
          </View>
        )}
        <CraftButton canAfford={canAfford && quantity <= maxQuantity} onPress={handleCraft} />
      </View>
    </View>
  );
};

const ResourceDisplay: React.FC = () => {
  const resources = useGameStore((state) => state.gathering.resources);
  const resourceCaps = useGameStore((state) => state.gathering.resourceCaps);
  const monsterParts = useGameStore((state) => state.monsterParts);

  return (
    <View style={styles.resourceDisplay}>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>🪨</Text>
        <Text style={styles.resourceText}>{resources.ore}/{resourceCaps.ore}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>🪵</Text>
        <Text style={styles.resourceText}>{resources.wood}/{resourceCaps.wood}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>🐟</Text>
        <Text style={styles.resourceText}>{resources.fish}/{resourceCaps.fish}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>🌿</Text>
        <Text style={styles.resourceText}>{resources.herb}/{resourceCaps.herb}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>🦴</Text>
        <Text style={styles.resourceText}>{monsterParts.common_part}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>💎</Text>
        <Text style={styles.resourceText}>{monsterParts.rare_part}</Text>
      </View>
      <View style={styles.resourceItem}>
        <Text style={styles.resourceIcon}>👑</Text>
        <Text style={styles.resourceText}>{monsterParts.boss_part}</Text>
      </View>
    </View>
  );
};

export default function CraftingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CraftingCategory>('cooking');
  const resources = useGameStore((state) => state.gathering.resources);
  const gold = useGameStore((state) => state.gold);
  const monsterParts = useGameStore((state) => state.monsterParts);
  const craftItem = useGameStore((state) => state.craftItem);

  const recipes = getRecipesByCategory(selectedCategory);

  const handleCraft = useCallback((recipeId: string, quantity: number = 1) => {
    let successCount = 0;
    for (let i = 0; i < quantity; i++) {
      const success = craftItem(recipeId);
      if (success) {
        successCount++;
      } else {
        break; // Stop if we can't craft anymore
      }
    }
    // Could add a success animation/toast here
  }, [craftItem]);

  return (
    <View style={styles.container}>
      <TopBar />

      <ResourceDisplay />

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        {(['cooking', 'alchemy', 'forge', 'fletching'] as CraftingCategory[]).map((cat) => (
          <CategoryTab
            key={cat}
            category={cat}
            isSelected={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </View>

      {/* Category Description */}
      <View style={styles.categoryDescription}>
        <Text style={styles.categoryDescText}>
          {CRAFTING_CATEGORIES[selectedCategory].description}
        </Text>
      </View>

      {/* Recipes */}
      <ScrollView style={styles.recipeList} contentContainerStyle={styles.recipeListContent}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            canAfford={canAffordRecipe(recipe, resources, gold, monsterParts)}
            onCraft={(quantity) => handleCraft(recipe.id, quantity)}
          />
        ))}
        {recipes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>此類別沒有可用配方</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  resourceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.panel,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceIcon: {
    fontSize: 16,
  },
  resourceText: {
    color: COLORS.text,
    fontSize: 12,
  },
  categoryTabs: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  categoryTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.2)',
  },
  categoryTabSelected: {
    backgroundColor: COLORS.buttonPrimary,
    borderBottomColor: '#3355aa',
  },
  categoryTabHovered: {
    backgroundColor: '#1f2a4d',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    color: COLORS.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  categoryNameSelected: {
    color: COLORS.text,
  },
  categoryDescription: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryDescText: {
    color: COLORS.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
  recipeList: {
    flex: 1,
  },
  recipeListContent: {
    padding: 8,
    gap: 8,
  },
  recipeCard: {
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    padding: 12,
  },
  recipeCardDisabled: {
    opacity: 0.6,
  },
  recipeCardCraftable: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeDesc: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  recipeAmount: {
    color: COLORS.textGold,
    fontSize: 14,
    fontWeight: 'bold',
  },
  recipeCosts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  costItem: {
    backgroundColor: COLORS.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  costText: {
    color: COLORS.text,
    fontSize: 12,
  },
  costTextInsufficient: {
    color: '#ef4444',
  },
  craftButtonContainer: {
    flex: 1,
  },
  craftButton: {
    backgroundColor: COLORS.buttonSuccess,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#55cc55',
    borderBottomWidth: 4,
    borderBottomColor: '#338833',
  },
  craftButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
    borderColor: '#444466',
    borderBottomColor: '#222233',
  },
  craftButtonHovered: {
    backgroundColor: '#55bb55',
    borderColor: '#66dd66',
  },
  craftButtonPressed: {
    borderBottomWidth: 2,
    marginTop: 2,
  },
  craftButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  craftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgLight,
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 4,
  },
  quantityButtonDisabled: {
    opacity: 0.4,
  },
  quantityButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 32,
    textAlign: 'center',
  },
  maxButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.textGold,
    borderRadius: 4,
    marginLeft: 4,
  },
  maxButtonText: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
});
