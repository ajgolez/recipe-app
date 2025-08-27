import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, X } from 'lucide-react';
import { RecipeFilters as RecipeFiltersType } from '../types/recipe';

interface RecipeFiltersProps {
  filters: RecipeFiltersType;
  onFiltersChange: (filters: RecipeFiltersType) => void;
}

const cuisineOptions = ['Italian', 'Thai', 'Mediterranean', 'American', 'French', 'Mexican', 'Chinese', 'Japanese', 'Indian'];
const difficultyOptions = ['Easy', 'Medium', 'Hard'];
const dietaryOptions = ['Vegetarian', 'Vegan', 'Keto', 'Gluten-Free', 'Dairy-Free', 'Paleo'];

export function RecipeFilters({ filters, onFiltersChange }: RecipeFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<RecipeFiltersType>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleArrayFilter = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const handleCookingTimeChange = (values: number[]) => {
    updateFilters({
      cookingTime: { min: values[0], max: values[1] }
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      cuisine: [],
      cookingTime: null,
      difficulty: [],
      dietaryTags: [],
      searchQuery: filters.searchQuery // Keep search query
    });
  };

  const getActiveFiltersCount = () => {
    return filters.cuisine.length + 
           filters.difficulty.length + 
           filters.dietaryTags.length + 
           (filters.cookingTime ? 1 : 0);
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getActiveFiltersCount() > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFilters();
                    }}
                    className="h-8 px-2"
                  >
                    Clear
                  </Button>
                )}
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Cuisine Filter */}
            <div className="space-y-3">
              <Label>Cuisine</Label>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((cuisine) => (
                  <div key={cuisine} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-${cuisine}`}
                      checked={filters.cuisine.includes(cuisine)}
                      onCheckedChange={() => 
                        updateFilters({ 
                          cuisine: toggleArrayFilter(filters.cuisine, cuisine) 
                        })
                      }
                    />
                    <Label 
                      htmlFor={`cuisine-${cuisine}`}
                      className="cursor-pointer text-sm"
                    >
                      {cuisine}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking Time Filter */}
            <div className="space-y-3">
              <Label>Cooking Time (minutes)</Label>
              <div className="px-3">
                <Slider
                  value={filters.cookingTime ? [filters.cookingTime.min, filters.cookingTime.max] : [0, 120]}
                  onValueChange={handleCookingTimeChange}
                  max={120}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{filters.cookingTime?.min || 0} min</span>
                  <span>{filters.cookingTime?.max || 120} min</span>
                </div>
              </div>
            </div>

            {/* Difficulty Filter */}
            <div className="space-y-3">
              <Label>Difficulty</Label>
              <div className="flex gap-4">
                {difficultyOptions.map((difficulty) => (
                  <div key={difficulty} className="flex items-center space-x-2">
                    <Checkbox
                      id={`difficulty-${difficulty}`}
                      checked={filters.difficulty.includes(difficulty)}
                      onCheckedChange={() => 
                        updateFilters({ 
                          difficulty: toggleArrayFilter(filters.difficulty, difficulty) 
                        })
                      }
                    />
                    <Label 
                      htmlFor={`difficulty-${difficulty}`}
                      className="cursor-pointer text-sm"
                    >
                      {difficulty}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Tags Filter */}
            <div className="space-y-3">
              <Label>Dietary Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dietary-${tag}`}
                      checked={filters.dietaryTags.includes(tag)}
                      onCheckedChange={() => 
                        updateFilters({ 
                          dietaryTags: toggleArrayFilter(filters.dietaryTags, tag) 
                        })
                      }
                    />
                    <Label 
                      htmlFor={`dietary-${tag}`}
                      className="cursor-pointer text-sm"
                    >
                      {tag}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters Display */}
            {getActiveFiltersCount() > 0 && (
              <div className="space-y-2">
                <Label>Active Filters</Label>
                <div className="flex flex-wrap gap-2">
                  {filters.cuisine.map((cuisine) => (
                    <Badge key={`active-cuisine-${cuisine}`} variant="secondary" className="gap-1">
                      {cuisine}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => 
                          updateFilters({ 
                            cuisine: filters.cuisine.filter(c => c !== cuisine) 
                          })
                        }
                      />
                    </Badge>
                  ))}
                  {filters.difficulty.map((difficulty) => (
                    <Badge key={`active-difficulty-${difficulty}`} variant="secondary" className="gap-1">
                      {difficulty}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => 
                          updateFilters({ 
                            difficulty: filters.difficulty.filter(d => d !== difficulty) 
                          })
                        }
                      />
                    </Badge>
                  ))}
                  {filters.dietaryTags.map((tag) => (
                    <Badge key={`active-dietary-${tag}`} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => 
                          updateFilters({ 
                            dietaryTags: filters.dietaryTags.filter(t => t !== tag) 
                          })
                        }
                      />
                    </Badge>
                  ))}
                  {filters.cookingTime && (
                    <Badge variant="secondary" className="gap-1">
                      {filters.cookingTime.min}-{filters.cookingTime.max} min
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => updateFilters({ cookingTime: null })}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}