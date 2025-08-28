"use client"; //	In Next.js App Router, files are Server Components by default.
import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
 import { Card, CardContent } from './ui/card';
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
 import { Plus, ChefHat, BookOpen, Heart, Calendar, ShoppingCart, Utensils, Settings, Bot } from 'lucide-react';
import { Badge } from './ui/badge';
 import { RecipeCard } from './RecipeCard';
 import { RecipeDetail } from './RecipeDetail';
 import { RecipeFilters } from './RecipeFilters';
 import { SearchBar } from './SearchBar';
 import { MealPlanner } from './MealPlanner';
 import { ShoppingList } from './ShoppingList';
 import { ProfileSettings } from './ProfileSettings';
 import { AIAssistant } from './AIAssistant';
 import { SavedRecipes } from './SavedRecipes';

 import { CustomRecipeCreator } from './CustomRecipeCreator';
import { CustomRecipeManager } from './CustomRecipeManager';
 //import { recipes as systemRecipes } from '../data/recipes'; // Sample STATIC data for system recipes
 import type { Recipe } from '../types/recipe';
 import { toast } from 'sonner';

interface CustomRecipe extends Recipe {
  isCustom: true;
  createdAt: string;
  source?: 'manual' | 'import' | 'photo';
}

interface RecipeBrowserProps {
  userPreferences?: any;
  onStorageError?: (error: Error) => void;
}

export function RecipeBrowser({ userPreferences, onStorageError }: RecipeBrowserProps) {
   const [activeTab, setActiveTab] = useState('browse');
   const [selectedRecipe, setSelectedRecipe] = useState<Recipe | CustomRecipe | null>(null);
   const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<import('../types/recipe').RecipeFilters>({
    cuisine: [],
    dietaryTags: [],
    difficulty: [],
    cookingTime: null,
    searchQuery: '',
  });
   const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
   const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
   const [showCustomCreator, setShowCustomCreator] = useState(false);
   const [showCustomManager, setShowCustomManager] = useState(false);
  const [editingCustomRecipe, setEditingCustomRecipe] = useState<CustomRecipe | null>(null);
   const [showSavedRecipes, setShowSavedRecipes] = useState(false);
const [systemRecipes, setSystemRecipes] = useState<Recipe[]>([]);

useEffect(() => {
  const fetchRecipes = async () => {
    try {
      const res = await fetch('/api/recipes', {
        cache: 'no-store',
      });
      const data = await res.json();
      setSystemRecipes(data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      toast.error('Failed to load recipes.');
    }
  };

  fetchRecipes();
}, []);

  // Load saved data from localStorage with error handling
  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('savedRecipes');
      if (savedIds) {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds)) {
          setSavedRecipeIds(parsedIds);
        }
      }

      const customRecipesData = localStorage.getItem('customRecipes');
      if (customRecipesData) {
        const parsedRecipes = JSON.parse(customRecipesData);
        if (Array.isArray(parsedRecipes)) {
          setCustomRecipes(parsedRecipes);
        }
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
      if (onStorageError) {
        onStorageError(error as Error);
      }
      toast.error('Failed to load some saved data. Starting fresh.');
    }
  }, [onStorageError]);

  // Save custom recipes to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('customRecipes', JSON.stringify(customRecipes));
    } catch (error) {
      console.error('Failed to save custom recipes:', error);
      if (onStorageError) {
        onStorageError(error as Error);
      }
    }
  }, [customRecipes, onStorageError]);

  // Get all recipes (system + custom)
const allRecipes = useMemo(() => {
  return [...systemRecipes, ...customRecipes];
}, [systemRecipes, customRecipes]);

  // Filter recipes based on search and filters
  useEffect(() => {
    let filtered = allRecipes;

    // Apply search filter
    if (selectedFilters.searchQuery) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(selectedFilters.searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => {
          const ingredientName = typeof ing === 'string' ? ing : (ing.name || '');
          return ingredientName.toLowerCase().includes(selectedFilters.searchQuery.toLowerCase());
        }) ||
        recipe.cuisine.toLowerCase().includes(selectedFilters.searchQuery.toLowerCase()) ||
        recipe.dietaryTags.some(tag => 
          tag.toLowerCase().includes(selectedFilters.searchQuery.toLowerCase())
        )
      );
    }

    // Apply filters
    if (selectedFilters.cuisine.length > 0) {
      filtered = filtered.filter(recipe => 
        selectedFilters.cuisine.includes(recipe.cuisine)
      );
    }

    if (selectedFilters.dietaryTags.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedFilters.dietaryTags.some(tag => 
          recipe.dietaryTags.includes(tag)
        )
      );
    }

    if (selectedFilters.difficulty.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedFilters.difficulty.includes(recipe.difficulty)
      );
    }

    if (selectedFilters.cookingTime) {
      const totalTime = selectedFilters.cookingTime.min + selectedFilters.cookingTime.max;
      filtered = filtered.filter(recipe =>
        (recipe.prepTime + recipe.cookTime) >= selectedFilters.cookingTime!.min &&
        (recipe.prepTime + recipe.cookTime) <= selectedFilters.cookingTime!.max
      );
    }

     setFilteredRecipes(filtered);
   }, [selectedFilters, systemRecipes, customRecipes, allRecipes]);

  const toggleSaveRecipe = (recipeId: string) => {
    try {
      const newSavedIds = savedRecipeIds.includes(recipeId)
        ? savedRecipeIds.filter(id => id !== recipeId)
        : [...savedRecipeIds, recipeId];
      
      setSavedRecipeIds(newSavedIds);
      localStorage.setItem('savedRecipes', JSON.stringify(newSavedIds));
      
      toast.success(
        savedRecipeIds.includes(recipeId) 
          ? 'Recipe removed from favorites' 
          : 'Recipe saved to favorites'
      );
    } catch (error) {
      console.error('Failed to save recipe:', error);
      if (onStorageError) {
        onStorageError(error as Error);
      }
      toast.error('Failed to save recipe. Please try again.');
    }
  };

  const handleSaveCustomRecipe = (recipe: CustomRecipe) => {
    if (editingCustomRecipe) {
      // Update existing recipe
      setCustomRecipes(prev => prev.map(r => 
        r.id === editingCustomRecipe.id ? recipe : r
      ));
      setEditingCustomRecipe(null);
      toast.success('Recipe updated successfully');
    } else {
      // Add new recipe
      setCustomRecipes(prev => [...prev, recipe]);
      toast.success('Custom recipe created successfully');
    }
    setShowCustomCreator(false);
  };

  const handleEditCustomRecipe = (recipe: CustomRecipe) => {
    setEditingCustomRecipe(recipe);
    setShowCustomCreator(true);
    setShowCustomManager(false);
  };

  const handleDeleteCustomRecipe = (recipeId: string) => {
    try {
      setCustomRecipes(prev => prev.filter(r => r.id !== recipeId));
      // Also remove from saved if it was saved
      if (savedRecipeIds.includes(recipeId)) {
        const newSavedIds = savedRecipeIds.filter(id => id !== recipeId);
        setSavedRecipeIds(newSavedIds);
        localStorage.setItem('savedRecipes', JSON.stringify(newSavedIds));
      }
      toast.success('Recipe deleted successfully');
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      if (onStorageError) {
        onStorageError(error as Error);
      }
      toast.error('Failed to delete recipe. Please try again.');
    }
  };

  if (showCustomCreator) {
    return (
      // <CustomRecipeCreator
      //   onBack={() => {
      //     setShowCustomCreator(false);
      //     setEditingCustomRecipe(null);
      //   }}
      //   onSave={handleSaveCustomRecipe}
      // />
      <div>test1</div>
    );
  }

  if (showCustomManager) {
    return (
      // <CustomRecipeManager
      //   customRecipes={customRecipes}
      //   onBack={() => setShowCustomManager(false)}
      //   onCreateNew={() => {
      //     setShowCustomManager(false);
      //     setShowCustomCreator(true);
      //   }}
      //   onEdit={handleEditCustomRecipe}
      //   onDelete={handleDeleteCustomRecipe}
      //   onViewRecipe={setSelectedRecipe}
      // />
      <div>test</div>
    );
  }

  if (showSavedRecipes) {
    return (
      <SavedRecipes
        onBack={() => setShowSavedRecipes(false)}
        onAddToMealPlan={(date: Date, mealType: string, recipe: Recipe) => {
          // You can implement meal planning logic here
          toast.success(`${recipe.title} added to ${mealType} on ${date.toLocaleDateString()}`);
        }}
        userPreferences={userPreferences}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4">
              <TabsList className="grid grid-cols-7 w-fit" data-tour="app-header">
                <TabsTrigger value="browse" className="flex items-center gap-2" data-tour="browse-tab">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Browse</span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="flex items-center gap-2" data-tour="favorites-tab">
                  <Heart className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                </TabsTrigger>
                <TabsTrigger value="meal-planner" className="flex items-center gap-2" data-tour="meal-planner-tab">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Meal Plan</span>
                </TabsTrigger>
                <TabsTrigger value="shopping" className="flex items-center gap-2" data-tour="shopping-tab">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Shopping</span>
                </TabsTrigger>
                <TabsTrigger value="ai-assistant" className="flex items-center gap-2" data-tour="ai-tab">
                  <Bot className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Chef</span>
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2" data-tour="custom-tab">
                  <ChefHat className="h-4 w-4" />
                  <span className="hidden sm:inline">My Recipes</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Quick Action Buttons */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCustomCreator(true)}
                  className="hidden sm:flex"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipe
                </Button>
                {customRecipes.length > 0 && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {customRecipes.length} custom
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>      
       <div className="container mx-auto px-4">
          <TabsContent value="browse" className="py-6">
            <div className="space-y-6">
              {/* Header with Custom Recipe Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1>Recipe Collection</h1>
                  <p className="text-muted-foreground">
                    {systemRecipes.length} recipes + {customRecipes.length} custom recipes
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCustomManager(true)}
                    disabled={customRecipes.length === 0}
                  >
                    <ChefHat className="h-4 w-4 mr-2" />
                    My Recipes ({customRecipes.length})
                  </Button>
                  <Button 
                    onClick={() => setShowCustomCreator(true)}
                    data-tour="create-recipe"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Recipe
                  </Button>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="space-y-4">
                <SearchBar 
                  value={selectedFilters.searchQuery}
                  onChange={(term) => {
                    setSelectedFilters(prev => ({ ...prev, searchQuery: term }));
                  }} 
                />
                <RecipeFilters 
                  filters={selectedFilters}
                  onFiltersChange={setSelectedFilters}
                />
              </div>

              {/* Recipe Categories */}
              {selectedFilters.searchQuery === '' && selectedFilters.cuisine.length === 0 && selectedFilters.dietaryTags.length === 0 && (
                <div className="space-y-6">
                  {/* Custom Recipes Section */}
                  {customRecipes.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2>Your Custom Recipes</h2>
                          <Badge variant="secondary">{customRecipes.length}</Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setShowCustomManager(true)}
                        >
                          View All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {customRecipes.slice(0, 4).map((recipe) => (
                          <RecipeCard
                            key={recipe.id}
                            recipe={recipe}
                            isSaved={savedRecipeIds.includes(recipe.id)}
                            onToggleSave={() => toggleSaveRecipe(recipe.id)}
                            onClick={() => setSelectedRecipe(recipe)}
                            isCustom={true}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* System Recipes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2>All Recipes</h2>
                      <Badge variant="outline">{systemRecipes.length} recipes</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipe Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    isSaved={savedRecipeIds.includes(recipe.id)}
                    onToggleSave={() => toggleSaveRecipe(recipe.id)}
                    onClick={() => setSelectedRecipe(recipe)}
                    isCustom={'isCustom' in recipe && (recipe as CustomRecipe).isCustom}
                  />
                ))}
              </div>

              {filteredRecipes.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <Utensils className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <h3>No recipes found</h3>
                      <p className="text-muted-foreground mt-2">
                        Try adjusting your search or filters, or create your own custom recipe
                      </p>
                    </div>
                    <Button onClick={() => setShowCustomCreator(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Custom Recipe
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="py-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1>Saved Recipes</h1>
                  <p className="text-muted-foreground">
                    {savedRecipeIds.length} saved recipes
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSavedRecipes(true)}
                  className="flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Manage Favorites
                </Button>
              </div>

              {savedRecipeIds.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    <div>
                      <h3>No saved recipes yet</h3>
                      <p className="text-muted-foreground mt-2">
                        Save recipes you love to see them here
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab('browse')}>
                      Browse Recipes
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allRecipes
                      .filter(recipe => savedRecipeIds.includes(recipe.id))
                      .slice(0, 8)
                      .map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          isSaved={true}
                          onToggleSave={() => toggleSaveRecipe(recipe.id)}
                          onClick={() => setSelectedRecipe(recipe)}
                          isCustom={'isCustom' in recipe && (recipe as CustomRecipe).isCustom}
                        />
                      ))}
                  </div>
                  {savedRecipeIds.length > 8 && (
                    <div className="text-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowSavedRecipes(true)}
                      >
                        View All {savedRecipeIds.length} Saved Recipes
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

           <TabsContent value="meal-planner">
            <MealPlanner 
              onBack={() => setActiveTab('browse')}
              userPreferences={userPreferences}
            />
          </TabsContent>

          <TabsContent value="shopping">
            <ShoppingList />
          </TabsContent> 

          <TabsContent value="custom" className="py-6">
            <div className="space-y-6" data-tour="custom-recipes">
              <div className="text-center space-y-4">
                <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h2>Your Custom Recipes</h2>
                  <p className="text-muted-foreground">
                    Create and manage your personal recipe collection
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button onClick={() => setShowCustomCreator(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Recipe
                  </Button>
                  
                  {customRecipes.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCustomManager(true)}
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Manage Recipes ({customRecipes.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Recent Custom Recipes */}
              {customRecipes.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3>Recent Recipes</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCustomManager(true)}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customRecipes
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 6)
                      .map((recipe) => (
                        <RecipeCard
                          key={recipe.id}
                          recipe={recipe}
                          isSaved={savedRecipeIds.includes(recipe.id)}
                          onToggleSave={() => toggleSaveRecipe(recipe.id)}
                          onClick={() => setSelectedRecipe(recipe)}
                          isCustom={true}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent> 

          <TabsContent value="ai-assistant" className="h-[80vh]">
            <AIAssistant 
              userPreferences={userPreferences}
              onRecipeSelect={setSelectedRecipe}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ProfileSettings />
          </TabsContent>
        </div>


      </Tabs>
      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <Dialog open={!!selectedRecipe} onOpenChange={() => setSelectedRecipe(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sr-only">
              <DialogTitle>Recipe Details</DialogTitle>
              <DialogDescription>View recipe details and instructions</DialogDescription>
            </DialogHeader>
            <RecipeDetail 
              recipe={selectedRecipe}
              isSaved={savedRecipeIds.includes(selectedRecipe.id)}
              onToggleSave={() => toggleSaveRecipe(selectedRecipe.id)}
            />
          </DialogContent>
        </Dialog>
      )}
      {/* // <Button
      //   variant="default"
      //   size="default"
      //   //onClick={() => setShowCustomCreator(true)}
      //   //className="hidden sm:flex"
      // >
      //   <Plus className="h-4 w-4 mr-2" />
      //   Just a sample Button
      // </Button> */}
    </div>
  );
}