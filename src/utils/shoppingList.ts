import { Recipe } from '../types/recipe';
import { ShoppingListItem, ShoppingCategory, ShoppingListSection } from '../types/mealPlan';

// Define shopping categories
export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  { id: 'produce', name: 'Produce', icon: '🥬', order: 1 },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩', order: 2 },
  { id: 'dairy', name: 'Dairy & Eggs', icon: '🥛', order: 3 },
  { id: 'pantry', name: 'Pantry', icon: '🥫', order: 4 },
  { id: 'bakery', name: 'Bakery', icon: '🍞', order: 5 },
  { id: 'frozen', name: 'Frozen', icon: '🧊', order: 6 },
  { id: 'spices', name: 'Spices & Condiments', icon: '🧂', order: 7 },
  { id: 'beverages', name: 'Beverages', icon: '🥤', order: 8 },
  { id: 'other', name: 'Other', icon: '🛒', order: 9 }
];

// Ingredient categorization mapping
const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Produce
  'tomato': 'produce', 'cucumber': 'produce', 'onion': 'produce', 'garlic': 'produce',
  'lemon': 'produce', 'lime': 'produce', 'avocado': 'produce', 'lettuce': 'produce',
  'spinach': 'produce', 'carrot': 'produce', 'bell pepper': 'produce', 'jalapeño': 'produce',
  'cilantro': 'produce', 'basil': 'produce', 'parsley': 'produce', 'ginger': 'produce',
  'mushroom': 'produce', 'potato': 'produce', 'sweet potato': 'produce',
  
  // Meat & Seafood
  'chicken': 'meat', 'beef': 'meat', 'pork': 'meat', 'salmon': 'meat', 'fish': 'meat',
  'turkey': 'meat', 'lamb': 'meat', 'shrimp': 'meat', 'crab': 'meat', 'tofu': 'meat',
  
  // Dairy & Eggs
  'milk': 'dairy', 'cheese': 'dairy', 'yogurt': 'dairy', 'butter': 'dairy', 'cream': 'dairy',
  'egg': 'dairy', 'mozzarella': 'dairy', 'parmesan': 'dairy', 'cheddar': 'dairy',
  'gruyère': 'dairy', 'feta': 'dairy',
  
  // Pantry
  'rice': 'pantry', 'quinoa': 'pantry', 'pasta': 'pantry', 'flour': 'pantry', 'sugar': 'pantry',
  'beans': 'pantry', 'lentils': 'pantry', 'chickpeas': 'pantry', 'nuts': 'pantry',
  'almonds': 'pantry', 'walnuts': 'pantry', 'pecans': 'pantry', 'pine nuts': 'pantry',
  'oats': 'pantry', 'barley': 'pantry', 'cornmeal': 'pantry',
  
  // Bakery
  'bread': 'bakery', 'bagel': 'bakery', 'tortilla': 'bakery', 'pita': 'bakery',
  'croissant': 'bakery', 'buns': 'bakery', 'rolls': 'bakery',
  
  // Spices & Condiments
  'salt': 'spices', 'pepper': 'spices', 'paprika': 'spices', 'cumin': 'spices',
  'oregano': 'spices', 'thyme': 'spices', 'rosemary': 'spices', 'sage': 'spices',
  'cinnamon': 'spices', 'nutmeg': 'spices', 'vanilla': 'spices', 'soy sauce': 'spices',
  'fish sauce': 'spices', 'oyster sauce': 'spices', 'vinegar': 'spices', 'olive oil': 'spices',
  'vegetable oil': 'spices', 'sesame oil': 'spices', 'tahini': 'spices', 'mustard': 'spices',
  'ketchup': 'spices', 'mayonnaise': 'spices', 'hot sauce': 'spices',
  
  // Beverages
  'water': 'beverages', 'juice': 'beverages', 'soda': 'beverages', 'tea': 'beverages',
  'coffee': 'beverages', 'wine': 'beverages', 'beer': 'beverages', 'broth': 'beverages',
  'stock': 'beverages'
};

function categorizeIngredient(ingredient: string): string {
  const normalizedIngredient = ingredient.toLowerCase();
  
  // Check for exact matches first
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (normalizedIngredient.includes(key)) {
      return category;
    }
  }
  
  return 'other';
}

function parseIngredient(ingredient: string | { name: string; amount: string; unit: string }): { amount: string; unit: string; quantity: number; name: string } {
  // Handle ingredient objects from recipe data
  if (typeof ingredient === 'object' && ingredient.name) {
    return {
      amount: ingredient.amount || '1',
      unit: ingredient.unit || 'item',
      quantity: parseFloat(ingredient.amount) || 1,
      name: ingredient.name.trim()
    };
  }
  
  // Handle string ingredients - simple ingredient parsing
  const ingredientStr = typeof ingredient === 'string' ? ingredient : '';
  const match = ingredientStr.match(/^(\d+(?:\/\d+)?|\d*\.?\d+)?\s*(\w+)?\s*(.+)$/);
  
  if (match) {
    const [, amount = '1', unit = 'item', name] = match;
    return {
      amount,
      unit: unit || 'item',
      quantity: parseFloat(amount) || 1,
      name: name.trim()
    };
  }
  
  return {
    amount: '1',
    unit: 'item',
    quantity: 1,
    name: ingredientStr || 'Unknown ingredient'
  };
}

export function generateShoppingList(recipes: Recipe[]): ShoppingListItem[] {
  const ingredientMap = new Map<string, ShoppingListItem>();

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      const parsed = parseIngredient(ingredient);
      const normalizedIngredient = parsed.name.toLowerCase().trim();
      const category = SHOPPING_CATEGORIES.find(cat => cat.id === categorizeIngredient(parsed.name)) || SHOPPING_CATEGORIES[8]; // Default to 'other'
      
      if (ingredientMap.has(normalizedIngredient)) {
        const existing = ingredientMap.get(normalizedIngredient)!;
        existing.quantity += parsed.quantity;
        if (!existing.recipes.includes(recipe.title)) {
          existing.recipes.push(recipe.title);
        }
      } else {
        ingredientMap.set(normalizedIngredient, {
          id: Math.random().toString(36).substr(2, 9),
          ingredient: parsed.name,
          amount: parsed.amount,
          unit: parsed.unit,
          quantity: parsed.quantity,
          category,
          recipes: [recipe.title],
          checked: false,
          isCustom: false
        });
      }
    });
  });

  return Array.from(ingredientMap.values()).sort((a, b) => {
    // Sort by category first, then by ingredient name
    const categoryOrder = a.category.order - b.category.order;
    if (categoryOrder !== 0) return categoryOrder;
    return a.ingredient.localeCompare(b.ingredient);
  });
}

export function groupItemsByCategory(items: ShoppingListItem[]): ShoppingListSection[] {
  const grouped = new Map<string, ShoppingListItem[]>();
  
  // Initialize all categories
  SHOPPING_CATEGORIES.forEach(category => {
    grouped.set(category.id, []);
  });
  
  // Group items by category
  items.forEach(item => {
    const categoryItems = grouped.get(item.category.id) || [];
    categoryItems.push(item);
    grouped.set(item.category.id, categoryItems);
  });
  
  // Convert to sections and filter out empty categories
  return SHOPPING_CATEGORIES
    .map(category => ({
      category,
      items: grouped.get(category.id) || []
    }))
    .filter(section => section.items.length > 0)
    .sort((a, b) => a.category.order - b.category.order);
}

export function createCustomItem(ingredient: string, category?: ShoppingCategory): ShoppingListItem {
  const parsed = parseIngredient(ingredient);
  const selectedCategory = category || SHOPPING_CATEGORIES.find(cat => cat.id === categorizeIngredient(parsed.name)) || SHOPPING_CATEGORIES[8];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    ingredient: parsed.name,
    amount: parsed.amount,
    unit: parsed.unit,
    quantity: parsed.quantity,
    category: selectedCategory,
    recipes: [],
    checked: false,
    isCustom: true
  };
}

export function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  
  // Get start of week (Sunday)
  const dayOfWeek = start.getDay();
  start.setDate(start.getDate() - dayOfWeek);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }
  
  return dates;
}

export function formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  }
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}