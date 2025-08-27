import { useState } from 'react';
import { ArrowLeft, Clock, Star, Users, ChefHat, Calendar, Check, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { MealPlannerDialog } from './MealPlannerDialog';
import { Recipe } from '../types/recipe';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack?: () => void;
  onAddToMealPlan?: (date: Date, mealType: string, recipe: Recipe) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  isFavorited?: boolean;
}

export function RecipeDetail({ 
  recipe, 
  onBack, 
  onAddToMealPlan, 
  isSaved = false, 
  isFavorited = false,
  onToggleSave 
}: RecipeDetailProps) {
  const [showPlannerDialog, setShowPlannerDialog] = useState(false);

  const handleAddToPlanner = () => {
    setShowPlannerDialog(true);
  };

  const handleAddToMeal = (date: Date, mealType: string, recipe: Recipe) => {
    if (onAddToMealPlan) {
      onAddToMealPlan(date, mealType, recipe);
    }
    // Dialog will auto-close with success feedback
  };

  const handleToggleSave = () => {
    if (onToggleSave) {
      onToggleSave();
      toast.success(isSaved ? 'Removed from favorites' : 'Added to favorites');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        {onBack && (
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Recipes
            </Button>
          </div>
        )}

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="aspect-video lg:aspect-square overflow-hidden rounded-lg">
            <ImageWithFallback
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{recipe.cuisine}</Badge>
                <Badge variant="secondary">{recipe.difficulty}</Badge>
              </div>
              <h1>{recipe.title}</h1>
              <p className="text-muted-foreground">{recipe.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p>{recipe.prepTime + recipe.cookTime} minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-2" data-annotation="servings">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p>{recipe.servings} people</p>
                </div>
              </div>
              <div className="flex items-center gap-2" data-annotation="nutrition">
                <ChefHat className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p>{recipe.nutrition?.calories || 0} per serving</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p>{recipe.rating || 0} ({recipe.reviewCount || 0} reviews)</p>
                </div>
              </div>
            </div>

            {recipe.dietaryTags && recipe.dietaryTags.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Dietary Information</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.dietaryTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ingredients */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">
                      {typeof ingredient === 'string' 
                        ? ingredient 
                        : `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.name || ''}`.trim()
                      }
                    </span>
                  </li>
                )) || []}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions?.map((instruction, index) => (
                  <li key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <p className="text-sm mt-1">{instruction}</p>
                  </li>
                )) || []}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={handleAddToPlanner}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Add to Planner
          </Button>
          <Button 
            variant={isSaved ? "secondary" : "outline"}
            onClick={handleToggleSave}
            className="flex items-center gap-2"
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            {isSaved ? 'Saved' : 'Save Recipe'}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            Share Recipe
          </Button>
        </div>

        {/* Meal Planner Dialog */}
        <MealPlannerDialog
          isOpen={showPlannerDialog}
          onClose={() => setShowPlannerDialog(false)}
          recipe={recipe}
          onAddToMeal={handleAddToMeal}
        />
      </div>
    </div>
  );
}