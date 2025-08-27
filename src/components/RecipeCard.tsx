import { Heart, Clock, Users, ChefHat, Activity, Zap, Eye } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Recipe } from '../types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onClick?: () => void;
  onView?: () => void;
  isCustom?: boolean;
  showHealthTags?: boolean;
  showFavoriteButton?: boolean;
}

export function RecipeCard({ recipe, isSaved = false, onToggleSave, onClick, onView, isCustom = false, showHealthTags = false, showFavoriteButton = true }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  
  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'manual': return '✏️';
      case 'import': return '🔗';
      case 'photo': return '📷';
      default: return '📝';
    }
  };

  const getSourceLabel = (source?: string) => {
    switch (source) {
      case 'manual': return 'Manual';
      case 'import': return 'Imported';
      case 'photo': return 'Photo OCR';
      default: return 'Custom';
    }
  };

  const getHealthBenefits = (recipe: Recipe): string[] => {
    const benefits: string[] = [];
    const recipeTags = recipe.tags?.map(tag => tag.toLowerCase()) ?? [];
    const dietaryTags = recipe.dietaryTags?.map(tag => tag.toLowerCase()) ?? [];
    const allTags = [...recipeTags, ...dietaryTags];

    if (allTags.some(tag => ['low-sodium', 'heart-healthy'].includes(tag))) {
      benefits.push('Heart Healthy');
    }
    if (allTags.some(tag => ['high-protein', 'protein'].includes(tag))) {
      benefits.push('High Protein');
    }
    if (allTags.some(tag => ['low-carb', 'keto'].includes(tag))) {
      benefits.push('Low Carb');
    }
    if (allTags.some(tag => ['fiber', 'high-fiber'].includes(tag))) {
      benefits.push('High Fiber');
    }
    if (allTags.some(tag => ['anti-inflammatory', 'antioxidant'].includes(tag))) {
      benefits.push('Anti-inflammatory');
    }

    return benefits;
  };

  const handleCardClick = () => {
    if (onView) {
      onView();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer">
      <div className="relative aspect-video bg-muted" onClick={handleCardClick}>
        <ImageWithFallback
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Custom Recipe Badge */}
        {isCustom && 'source' in recipe && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-background/90">
              <ChefHat className="h-3 w-3 mr-1" />
              {getSourceIcon(recipe.source as string)} {getSourceLabel(recipe.source as string)}
            </Badge>
          </div>
        )}
        
        {/* Save Button */}
        {onToggleSave && showFavoriteButton && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 hover:bg-background"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave();
            }}
          >
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        )}

        {/* Difficulty Badge */}
        <div className="absolute bottom-2 right-2">
          <Badge variant="outline" className="bg-background/90 text-xs">
            {recipe.difficulty}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4" onClick={handleCardClick}>
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="line-clamp-2 leading-tight">{recipe.title}</h3>
            {recipe.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{totalTime}m</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{recipe.servings}</span>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {recipe.cuisine}
            </Badge>
          </div>

          {recipe.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.dietaryTags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.dietaryTags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{recipe.dietaryTags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Health Benefits for AI Assistant */}
          {showHealthTags && (
            <div className="space-y-2">
              {getHealthBenefits(recipe).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {getHealthBenefits(recipe).map((benefit) => (
                    <Badge key={benefit} variant="secondary" className="text-xs bg-green-100 text-green-800">
                      <Activity className="h-3 w-3 mr-1" />
                      {benefit}
                    </Badge>
                  ))}
                </div>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Recipe
              </Button>
            </div>
          )}

          {/* Custom recipe creation date */}
          {isCustom && 'createdAt' in recipe && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Created: {new Date(recipe.createdAt ?? Date.now()).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}