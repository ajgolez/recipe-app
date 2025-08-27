export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  tags?: string[];
  dietaryTags: string[];
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
    calcium: number;
    iron: number;
    vitaminD: number;
    potassium: number;
    vitaminC: number;
    vitaminA: number;
    vitaminB12: number;
    vitaminE: number;
    folate: number;
    magnesium: number;
    zinc: number;
    phosphorus: number;
  };
  rating: number;
  reviewCount: number;
  healthScore: number;
  mealTypes: string[];
  createdAt?: string;
}

export interface CustomRecipe extends Recipe {
  isCustom: true;
  createdAt: string;
  source?: 'manual' | 'import' | 'photo';
}

export type AnyRecipe = Recipe | CustomRecipe;

export interface MealPlanEntry {
  id: string;
  recipeId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  servings?: number;
}

export interface WeeklyMealPlan {
  [date: string]: {
    breakfast: MealPlanEntry[];
    lunch: MealPlanEntry[];
    dinner: MealPlanEntry[];
    snack: MealPlanEntry[];
  };
}

export interface RecipeFilters {
  cuisine: string[];
  cookingTime: { min: number; max: number } | null;
  difficulty: string[];
  dietaryTags: string[];
  searchQuery: string;
}

export interface SavedRecipe {
  recipe: Recipe;
  savedAt: Date;
  tags: string[];
  folder?: string;
  notes?: string;
  personalRating?: number;
}

export interface RecipeFolder {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  recipeCount: number;
}

export interface FavoritesState {
  savedRecipes: Map<string, SavedRecipe>;
  folders: RecipeFolder[];
  recentlyViewed: Recipe[];
  defaultTags: string[];
}

export type FavoritesView = 'all' | 'recent' | 'folders' | 'tags';

export interface FavoritesFilters {
  view: FavoritesView;
  selectedTags: string[];
  sortBy: 'recent' | 'name' | 'rating' | 'cookingTime';
  sortOrder: 'asc' | 'desc';
  selectedFolder?: string;
}