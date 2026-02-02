import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../src/constants/theme';
import { TopBar } from '../src/components/ui/TopBar';
import { useGameStore } from '../src/store/useGameStore';
import {
  CRAFTING_CATEGORIES,
  RECIPES,
  getRecipesByCategory,
  canAffordRecipe,
  CraftingCategory,
  Recipe,
} from '../src/data/crafting';
import { getConsumableById } from '../src/data/consumables';
import { formatNumber } from '../src/utils/format';

const CategoryTab: React.FC<{
  category: CraftingCategory;
  isSelected: boolean;
  onPress: () => void;
}> = ({ category, isSelected, onPress }) => {
  const info = CRAFTING_CATEGORIES[category];
  return (
    <TouchableOpacity
      style={[styles.categoryTab, isSelected && styles.categoryTabSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryIcon}>{info.icon}</Text>
      <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
        {info.name}
      </Text>
    </TouchableOpacity>
  );
};

const RecipeCard: React.FC<{
  recipe: Recipe;
  canAfford: boolean;
  onCraft: () => void;
}> = ({ recipe, canAfford, onCraft }) => {
  const resources = useGameStore((state) => state.gathering.resources);
  const gold = useGameStore((state) => state.gold);

  return (
    <View style={[styles.recipeCard, !canAfford && styles.recipeCardDisabled]}>
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
          const hasEnough = resources[resource as keyof typeof resources] >= amount;
          return (
            <View key={resource} style={styles.costItem}>
              <Text style={[styles.costText, !hasEnough && styles.costTextInsufficient]}>
                {resource === 'ore' ? '🪨' :
                 resource === 'wood' ? '🪵' :
                 resource === 'fish' ? '🐟' : '🌿'}
                {' '}{amount}
              </Text>
            </View>
          );
        })}
        {recipe.goldCost && (
          <View style={styles.costItem}>
            <Text style={[styles.costText, gold < recipe.goldCost && styles.costTextInsufficient]}>
              💰 {formatNumber(recipe.goldCost)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.craftButton, !canAfford && styles.craftButtonDisabled]}
        onPress={onCraft}
        disabled={!canAfford}
        activeOpacity={0.7}
      >
        <Text style={styles.craftButtonText}>
          {canAfford ? '製作' : '材料不足'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ResourceDisplay: React.FC = () => {
  const resources = useGameStore((state) => state.gathering.resources);
  const resourceCaps = useGameStore((state) => state.gathering.resourceCaps);

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
    </View>
  );
};

export default function CraftingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<CraftingCategory>('cooking');
  const resources = useGameStore((state) => state.gathering.resources);
  const gold = useGameStore((state) => state.gold);
  const craftItem = useGameStore((state) => state.craftItem);

  const recipes = getRecipesByCategory(selectedCategory);

  const handleCraft = (recipeId: string) => {
    const success = craftItem(recipeId);
    if (success) {
      // Could add a success animation/toast here
    }
  };

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
            canAfford={canAffordRecipe(recipe, resources, gold)}
            onCraft={() => handleCraft(recipe.id)}
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
  },
  categoryTabSelected: {
    backgroundColor: COLORS.buttonPrimary,
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
  craftButton: {
    backgroundColor: COLORS.buttonSuccess,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  craftButtonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  craftButtonText: {
    color: COLORS.text,
    fontSize: 14,
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
