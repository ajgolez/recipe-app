import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MealSlot as MealSlotType } from '../types/mealPlan';
import { Recipe } from '../types/recipe';

interface MealSlotProps {
  mealSlot: MealSlotType;
  onAddRecipe: (recipeId: string) => void;
  onRemoveRecipe: (recipeId: string) => void;
  onRecipeClick: (recipe: Recipe) => void;
  availableRecipes: Recipe[];
}

const mealTypeLabels = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  snacks: 'Snacks'
};

const mealTypeIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snacks: '🍎'
};

export function MealSlot({ 
  mealSlot, 
  onAddRecipe, 
  onRemoveRecipe, 
  onRecipeClick,
  availableRecipes 
}: MealSlotProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-accent/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-accent/50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-accent/50');
    
    const recipeId = e.dataTransfer.getData('text/plain');
    if (recipeId && !mealSlot.recipes.some(r => r.id === recipeId)) {
      onAddRecipe(recipeId);
    }
  };

  const totalCalories = mealSlot.recipes.reduce((sum, recipe) => sum + (recipe.nutrition?.calories || 0), 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span>{mealTypeIcons[mealSlot.type]}</span>
            <span>{mealTypeLabels[mealSlot.type]}</span>
            {mealSlot.recipes.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalCalories} cal
              </Badge>
            )}
          </div>
          {mealSlot.recipes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-6 w-6"
            >
              <Plus className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent
        className="space-y-2 min-h-24 border-2 border-dashed border-transparent transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {mealSlot.recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-4">
            <Plus className="h-8 w-8 mb-2" />
            <p className="text-sm">Drop recipe here or click to add</p>
          </div>
        ) : (
          <div className="space-y-2">
            {mealSlot.recipes.slice(0, isExpanded ? undefined : 2).map((recipe) => (
              <div
                key={recipe.id}
                className="flex items-center justify-between p-2 bg-accent/30 rounded-md group hover:bg-accent/50 transition-colors"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onRecipeClick(recipe)}
                >
                  <p className="text-sm truncate">{recipe.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)}m</span>
                    <span>•</span>
                    <span>{recipe.nutrition?.calories || 0} cal</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveRecipe(recipe.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {!isExpanded && mealSlot.recipes.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="w-full text-xs text-muted-foreground"
              >
                +{mealSlot.recipes.length - 2} more recipes
              </Button>
            )}
          </div>
        )}

        {(mealSlot.recipes.length > 0 || isExpanded) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full mt-2"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Recipe
          </Button>
        )}
      </CardContent>
    </Card>
  );
}