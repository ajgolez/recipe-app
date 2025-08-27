import { useState, useEffect, useMemo } from 'react';
import { Sparkles, RefreshCw, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Recipe } from '../types/recipe';
import { recipes } from '../data/recipes';

interface AIMealSuggestionsProps {
  userPreferences?: {
    dietaryRestrictions?: string[];
    preferredCuisines?: string[];
    allergies?: string[];
    dailyCalorieGoal?: number;
  } | null;
  plannedRecipes?: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  targetMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
}

interface SuggestionCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  recipes: Recipe[];
}

export function AIMealSuggestions({ 
  userPreferences, 
  plannedRecipes = [], 
  onRecipeSelect,
  targetMealType 
}: AIMealSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('personalized');

  // Calculate user's nutritional patterns from planned recipes
  const nutritionalPattern = useMemo(() => {
    if (plannedRecipes.length === 0) return null;

    const totals = plannedRecipes.reduce((acc, recipe) => ({
      calories: acc.calories + recipe.nutrition.calories,
      protein: acc.protein + recipe.nutrition.protein,
      carbs: acc.carbs + recipe.nutrition.carbs,
      fat: acc.fat + recipe.nutrition.fat,
      fiber: acc.fiber + recipe.nutrition.fiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    return {
      avgCalories: Math.round(totals.calories / plannedRecipes.length),
      avgProtein: Math.round(totals.protein / plannedRecipes.length),
      avgCarbs: Math.round(totals.carbs / plannedRecipes.length),
      avgFat: Math.round(totals.fat / plannedRecipes.length),
      avgFiber: Math.round(totals.fiber / plannedRecipes.length)
    };
  }, [plannedRecipes]);

  // AI scoring algorithm
  const calculateAIScore = (recipe: Recipe): number => {
    let score = 0;

    // Base score from recipe rating and health score
    score += (recipe.rating / 5) * 20;
    score += (recipe.healthScore || 70) * 0.3;

    // Dietary preferences match
    if (userPreferences?.dietaryRestrictions) {
      const matches = userPreferences.dietaryRestrictions.filter(restriction =>
        recipe.dietaryTags.includes(restriction)
      ).length;
      score += matches * 10;
    }

    // Preferred cuisines
    if (userPreferences?.preferredCuisines?.includes(recipe.cuisine)) {
      score += 15;
    }

    // Calorie goal alignment
    if (userPreferences?.dailyCalorieGoal) {
      const targetMealCalories = userPreferences.dailyCalorieGoal / 3; // Assuming 3 main meals
      const calorieDeviation = Math.abs(recipe.nutrition.calories - targetMealCalories);
      score += Math.max(0, 20 - (calorieDeviation / 50));
    }

    // Meal type compatibility
    if (targetMealType && recipe.mealTypes.includes(targetMealType)) {
      score += 15;
    }

    // Nutritional balance (prefer recipes with good protein/fiber ratio)
    score += (recipe.nutrition.protein / 10) + (recipe.nutrition.fiber / 2);

    // Avoid recipes already planned recently
    if (plannedRecipes.some(p => p.id === recipe.id)) {
      score -= 25;
    }

    // Cooking time bonus (prefer quicker recipes)
    if ((recipe.prepTime + recipe.cookTime) <= 30) {
      score += 10;
    }

    return Math.min(100, Math.max(0, score));
  };

  // Generate suggestion categories
  const suggestionCategories: SuggestionCategory[] = useMemo(() => {
    const scoredRecipes = recipes
      .map(recipe => ({
        ...recipe,
        aiScore: calculateAIScore(recipe)
      }))
      .sort((a, b) => b.aiScore - a.aiScore);

    return [
      {
        id: 'personalized',
        name: 'Personalized for You',
        description: 'AI-curated based on your preferences and goals',
        icon: <Sparkles className="h-4 w-4" />,
        recipes: scoredRecipes.slice(0, 6)
      },
      {
        id: 'healthy',
        name: 'Healthy Choices',
        description: 'High nutrition scores and balanced macros',
        icon: <Heart className="h-4 w-4" />,
        recipes: scoredRecipes
          .filter(r => (r.healthScore || 0) >= 80)
          .slice(0, 6)
      },
      {
        id: 'trending',
        name: 'Trending Now',
        description: 'Popular recipes with high ratings',
        icon: <TrendingUp className="h-4 w-4" />,
        recipes: scoredRecipes
          .filter(r => r.rating >= 4.5 && r.reviewCount >= 100)
          .slice(0, 6)
      },
      {
        id: 'quick',
        name: 'Quick & Easy',
        description: 'Ready in 30 minutes or less',
        icon: <RefreshCw className="h-4 w-4" />,
        recipes: scoredRecipes
          .filter(r => (r.prepTime + r.cookTime) <= 30)
          .slice(0, 6)
      }
    ];
  }, [userPreferences, plannedRecipes, targetMealType, calculateAIScore]);

  const handleRefreshSuggestions = () => {
    setIsLoading(true);
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const currentCategory = suggestionCategories.find(cat => cat.id === selectedCategory);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Meal Suggestions
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshSuggestions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {nutritionalPattern && (
          <div className="text-sm text-muted-foreground">
            Based on your recent choices: ~{nutritionalPattern.avgCalories} cal, 
            {nutritionalPattern.avgProtein}g protein, {nutritionalPattern.avgFiber}g fiber per meal
          </div>
        )}
        {!userPreferences && (
          <div className="text-sm text-muted-foreground">
            Complete your profile setup to get personalized suggestions
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-4">
            {suggestionCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex items-center gap-1 text-xs"
              >
                {category.icon}
                <span className="hidden sm:inline">{category.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {suggestionCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.recipes.map((recipe) => (
                    <Card
                      key={recipe.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onRecipeSelect(recipe)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium text-sm truncate">{recipe.title}</h5>
                            {/* {recipe.aiScore && (
                              <Badge variant="secondary" className="text-xs ml-2">
                                {Math.round(recipe.aiScore)}%
                              </Badge>
                            )} */}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{recipe.prepTime + recipe.cookTime}m</span>
                            <span>•</span>
                            <span>{recipe.nutrition.calories} cal</span>
                            <span>•</span>
                            <span>★ {recipe.rating}</span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {recipe.dietaryTags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {recipe.dietaryTags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{recipe.dietaryTags.length - 2}
                              </Badge>
                            )}
                          </div>

                          {recipe.healthScore && recipe.healthScore >= 80 && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Heart className="h-3 w-3" />
                              <span>Healthy Choice</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {category.recipes.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No suggestions available for this category</p>
                    <p className="text-sm">Try adjusting your preferences or adding more planned meals</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}