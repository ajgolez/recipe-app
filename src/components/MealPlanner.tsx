import { useState, useMemo, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ShoppingCart, ArrowLeft, Sparkles, BarChart3, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MealSlot } from './MealSlot';
import { EnhancedShoppingList } from './EnhancedShoppingList';
import { ShoppingListExport } from './ShoppingListExport';
import { RecipeDetail } from './RecipeDetail';
import { AIMealSuggestions } from './AIMealSuggestions';
import { NutritionTracker } from './NutritionTracker';
import { ViewMode, DayPlan, MealSlot as MealSlotType } from '../types/mealPlan';
import { Recipe } from '../types/recipe';
import { recipes } from '../data/recipes';
import { generateShoppingList, getWeekDates, formatDate, isToday } from '../utils/shoppingList';

interface MealPlannerProps {
  onBack: () => void;
  initialMealPlans?: Map<string, DayPlan>;
  onMealPlansChange?: (mealPlans: Map<string, DayPlan>) => void;
  userPreferences?: {
    dietaryRestrictions?: string[];
    preferredCuisines?: string[];
    allergies?: string[];
    dailyCalorieGoal?: number;

    proteinGoal?: number;
    carbGoal?: number;
    fatGoal?: number;
    fiberGoal?: number;
  } | null;
}

export function MealPlanner({ onBack, initialMealPlans, onMealPlansChange, userPreferences }: MealPlannerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [mealPlans, setMealPlans] = useState<Map<string, DayPlan>>(initialMealPlans || new Map());
  const [shoppingListItems, setShoppingListItems] = useState(generateShoppingList([]));

  // Helper function to update shopping list from meal plan
  const updateShoppingListFromMealPlan = () => {
    // Calculate current planned recipes
    let plannedRecipes: Recipe[] = [];
    mealPlans.forEach(dayPlan => {
      dayPlan.meals.forEach(meal => {
        plannedRecipes.push(...meal.recipes);
      });
    });
    
    if (plannedRecipes.length > 0) {
      const items = generateShoppingList(plannedRecipes);
      
      try {
        const existingShoppingList = localStorage.getItem('shoppingList');
        let existingItems = [];
        
        if (existingShoppingList) {
          existingItems = JSON.parse(existingShoppingList).filter((item: any) => item.isCustom && !item.fromMealPlan);
        }
        
        // Mark meal plan items with a special flag
        const mealPlanItems = items.map(item => ({ ...item, fromMealPlan: true }));
        
        // Combine existing custom items with new meal plan items
        const combinedItems = [...existingItems, ...mealPlanItems];
        
        localStorage.setItem('shoppingList', JSON.stringify(combinedItems));
      } catch (error) {
        console.error('Failed to update shopping list:', error);
      }
    } else {
      // If no planned recipes, remove meal plan items but keep custom items
      try {
        const existingShoppingList = localStorage.getItem('shoppingList');
        if (existingShoppingList) {
          const existingItems = JSON.parse(existingShoppingList).filter((item: any) => item.isCustom && !item.fromMealPlan);
          localStorage.setItem('shoppingList', JSON.stringify(existingItems));
        }
      } catch (error) {
        console.error('Failed to update shopping list:', error);
      }
    }
  };

  // Update shopping list whenever meal plans change
  useEffect(() => {
    updateShoppingListFromMealPlan();
  }, [mealPlans]);

  // Create initial meal slots for a day
  const createEmptyDay = (date: Date): DayPlan => ({
    date: date.toISOString().split('T')[0],
    meals: [
      { id: 'breakfast', type: 'breakfast', recipes: [] },
      { id: 'lunch', type: 'lunch', recipes: [] },
      { id: 'dinner', type: 'dinner', recipes: [] },
      { id: 'snacks', type: 'snacks', recipes: [] }
    ]
  });

  // Get meal plan for a specific date
  const getMealPlan = (date: Date): DayPlan => {
    const dateKey = date.toISOString().split('T')[0];
    return mealPlans.get(dateKey) || createEmptyDay(date);
  };

  // Update meal plan
  const updateMealPlan = (date: Date, updatedPlan: DayPlan) => {
    const dateKey = date.toISOString().split('T')[0];
    const newMealPlans = new Map(mealPlans.set(dateKey, updatedPlan));
    setMealPlans(newMealPlans);
    if (onMealPlansChange) {
      onMealPlansChange(newMealPlans);
    }
    
  };

  // Add recipe to meal slot
  const addRecipeToMeal = (date: Date, mealType: string, recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const dayPlan = getMealPlan(date);
    const updatedMeals = dayPlan.meals.map(meal => {
      if (meal.id === mealType && !meal.recipes.some(r => r.id === recipeId)) {
        return { ...meal, recipes: [...meal.recipes, recipe] };
      }
      return meal;
    });

    updateMealPlan(date, { ...dayPlan, meals: updatedMeals });
  };

  // Remove recipe from meal slot
  const removeRecipeFromMeal = (date: Date, mealType: string, recipeId: string) => {
    const dayPlan = getMealPlan(date);
    const updatedMeals = dayPlan.meals.map(meal => {
      if (meal.id === mealType) {
        return { ...meal, recipes: meal.recipes.filter(r => r.id !== recipeId) };
      }
      return meal;
    });

    updateMealPlan(date, { ...dayPlan, meals: updatedMeals });
  };

  // Generate shopping list from all planned meals
  const generateCurrentShoppingList = () => {
    const items = generateShoppingList(allPlannedRecipes);
    setShoppingListItems(items);
    
    // Save meal plan items to localStorage so they appear in the main shopping list
    try {
      const existingShoppingList = localStorage.getItem('shoppingList');
      let existingItems = [];
      
      if (existingShoppingList) {
        existingItems = JSON.parse(existingShoppingList).filter((item: any) => item.isCustom);
      }
      
      // Mark meal plan items with a special flag
      const mealPlanItems = items.map(item => ({ ...item, fromMealPlan: true }));
      
      // Combine existing custom items with new meal plan items
      const combinedItems = [...existingItems, ...mealPlanItems];
      
      localStorage.setItem('shoppingList', JSON.stringify(combinedItems));
    } catch (error) {
      console.error('Failed to save shopping list to localStorage:', error);
    }
    
    setShowShoppingList(true);
  };

  // Initialize shopping list if empty when trying to export
  const handleShowExport = () => {
    if (shoppingListItems.length === 0 && allPlannedRecipes.length > 0) {
      const items = generateShoppingList(allPlannedRecipes);
      setShoppingListItems(items);
    }
    setShowExportDialog(true);
  };

  // Handle AI recipe suggestions
  const handleAIRecipeSuggestion = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  // Get dates to display based on view mode
  const displayDates = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDate];
    } else {
      return getWeekDates(currentDate);
    }
  }, [currentDate, viewMode]);

  // Calculate total planned recipes and get all planned recipes
  const { totalPlannedRecipes, allPlannedRecipes } = useMemo(() => {
    let count = 0;
    const recipes: Recipe[] = [];
    mealPlans.forEach(dayPlan => {
      dayPlan.meals.forEach(meal => {
        count += meal.recipes.length;
        recipes.push(...meal.recipes);
      });
    });
    return { totalPlannedRecipes: count, allPlannedRecipes: recipes };
  }, [mealPlans]);

  // Show recipe detail if selected
  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
            <div>
              <h1>Meal Planner</h1>
              <p className="text-muted-foreground">
                AI-powered meal planning with nutrition tracking
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {totalPlannedRecipes > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={generateCurrentShoppingList}
                  className="flex items-center gap-2"
                  data-tour="generate-shopping"
                >
                  <ShoppingCart className="h-4 w-4" />
                  View List
                  <Badge variant="secondary">{totalPlannedRecipes}</Badge>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShowExport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Planner
            </TabsTrigger>
            <TabsTrigger value="suggestions" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planner" className="space-y-6">

            {/* View Mode and Date Navigation */}
            <div className="flex items-center justify-between">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="day">Day View</TabsTrigger>
                  <TabsTrigger value="week">Week View</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Card className="px-4 py-2">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="text-center min-w-48">
                    <p className="font-medium">
                      {viewMode === 'day' 
                        ? formatDate(currentDate, 'long')
                        : `${formatDate(displayDates[0])} - ${formatDate(displayDates[6])}`
                      }
                    </p>
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </div>

        {/* Meal Planning Grid */}
        <div 
          className={`grid gap-4 ${
            viewMode === 'day' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7'
          }`}
          data-tour="meal-calendar"
        >
          {displayDates.map((date, dateIndex) => {
            const dayPlan = getMealPlan(date);
            const isCurrentDay = isToday(date);
            
            return (
              <div key={date.toISOString()} className="space-y-4">
                {viewMode === 'week' && (
                  <div className={`text-center p-2 rounded-lg ${
                    isCurrentDay ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    <p className="font-medium">{formatDate(date).split(',')[0]}</p>
                    <p className="text-sm opacity-80">{formatDate(date).split(',')[1]?.trim()}</p>
                  </div>
                )}
                
                <div className={`grid gap-3 ${
                  viewMode === 'day' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'
                }`}>
                  {dayPlan.meals.map((meal) => (
                    <MealSlot
                      key={`${date.toISOString()}-${meal.id}`}
                      mealSlot={meal}
                      onAddRecipe={(recipeId) => addRecipeToMeal(date, meal.id, recipeId)}
                      onRemoveRecipe={(recipeId) => removeRecipeFromMeal(date, meal.id, recipeId)}
                      onRecipeClick={setSelectedRecipe}
                      availableRecipes={recipes}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

            {/* Quick Add Recipes */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Add Recipes</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag and drop these recipes into your meal slots
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {recipes.slice(0, 6).map((recipe) => (
                    <div
                      key={recipe.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', recipe.id)}
                      className="p-3 border rounded-lg cursor-move hover:bg-accent/50 transition-colors"
                    >
                      <p className="text-sm font-medium truncate">{recipe.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{recipe.prepTime + recipe.cookTime}m</span>
                        <span>•</span>
                        <span>{recipe.nutrition.calories} cal</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="text-xs">
                          {recipe.cuisine}
                        </Badge>
                        {recipe.healthScore && recipe.healthScore >= 80 && (
                          <Badge variant="secondary" className="text-xs">
                            ♥
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <AIMealSuggestions
              userPreferences={userPreferences}
              plannedRecipes={allPlannedRecipes}
              onRecipeSelect={handleAIRecipeSuggestion}
            />
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <NutritionTracker
              mealPlans={mealPlans}
              userGoals={{
                dailyCalories: userPreferences?.dailyCalorieGoal,
                proteinGoal: userPreferences?.proteinGoal,
                carbGoal: userPreferences?.carbGoal,
                fatGoal: userPreferences?.fatGoal,
                fiberGoal: userPreferences?.fiberGoal,
              }}
              selectedDate={currentDate}
            />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Meals Planned</span>
                      <Badge>{totalPlannedRecipes}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unique Recipes</span>
                      <Badge>{new Set(allPlannedRecipes.map(r => r.id)).size}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg Health Score</span>
                      <Badge variant="secondary">
                        {allPlannedRecipes.length > 0 
                          ? Math.round(allPlannedRecipes.reduce((sum, r) => sum + (r.healthScore || 70), 0) / allPlannedRecipes.length)
                          : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dietary Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto'].map(tag => {
                      const count = allPlannedRecipes.filter(r => r.dietaryTags.includes(tag)).length;
                      const percentage = allPlannedRecipes.length > 0 
                        ? Math.round((count / allPlannedRecipes.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={tag} className="flex items-center justify-between">
                          <span className="text-sm">{tag}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-8">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Shopping List Modal */}
        {showShoppingList && (
          <EnhancedShoppingList
            items={shoppingListItems}
            onItemsChange={setShoppingListItems}
            onClose={() => setShowShoppingList(false)}
            onExport={() => {
              setShowShoppingList(false);
              setShowExportDialog(true);
            }}
          />
        )}

        {/* Shopping List Export Modal */}
        {showExportDialog && (
          <ShoppingListExport
            items={shoppingListItems.length > 0 ? shoppingListItems : generateShoppingList(allPlannedRecipes)}
            isOpen={showExportDialog}
            onClose={() => setShowExportDialog(false)}
          />
        )}
      </div>
    </div>
  );
}