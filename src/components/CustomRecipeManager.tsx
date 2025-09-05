import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Search, Plus, MoreVertical, Edit, Trash2, Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';

interface CustomRecipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
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
  isCustom: true;
  createdAt: string;
  source?: 'manual' | 'import' | 'photo';
}

interface CustomRecipeManagerProps {
  customRecipes: CustomRecipe[];
  onBack: () => void;
  onCreateNew: () => void;
  onEdit: (recipe: CustomRecipe) => void;
  onDelete: (recipeId: string) => void;
  onViewRecipe: (recipe: CustomRecipe) => void;
}

export function CustomRecipeManager({ 
  customRecipes, 
  onBack, 
  onCreateNew, 
  onEdit, 
  onDelete, 
  onViewRecipe 
}: CustomRecipeManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<CustomRecipe[]>(customRecipes);
  const [selectedSource, setSelectedSource] = useState<string>('all');

  useEffect(() => {
    let filtered = customRecipes;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.cuisine.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.dietaryTags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by source
    if (selectedSource !== 'all') {
      filtered = filtered.filter(recipe => recipe.source === selectedSource);
    }

    setFilteredRecipes(filtered);
  }, [customRecipes, searchTerm, selectedSource]);

  const handleDeleteRecipe = (recipeId: string) => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      onDelete(recipeId);
      toast.success('Recipe deleted successfully');
    }
  };

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1>My Custom Recipes</h1>
              <p className="text-muted-foreground">{customRecipes.length} custom recipes</p>
            </div>
            <Button onClick={onCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Recipe
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your recipes..."
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedSource === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedSource('all')}
                size="sm"
              >
                All ({customRecipes.length})
              </Button>
              <Button
                variant={selectedSource === 'manual' ? 'default' : 'outline'}
                onClick={() => setSelectedSource('manual')}
                size="sm"
              >
                Manual ({customRecipes.filter(r => r.source === 'manual').length})
              </Button>
              <Button
                variant={selectedSource === 'import' ? 'default' : 'outline'}
                onClick={() => setSelectedSource('import')}
                size="sm"
              >
                Imported ({customRecipes.filter(r => r.source === 'import').length})
              </Button>
              <Button
                variant={selectedSource === 'photo' ? 'default' : 'outline'}
                onClick={() => setSelectedSource('photo')}
                size="sm"
              >
                Photo ({customRecipes.filter(r => r.source === 'photo').length})
              </Button>
            </div>
          </div>
        </div>

        {/* Recipe Grid */}
        {filteredRecipes.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <ChefHat className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3>No recipes found</h3>
                <p className="text-muted-foreground mt-2">
                  {searchTerm ? 
                    "Try adjusting your search or filters" : 
                    "Start by creating your first custom recipe"
                  }
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Recipe
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div 
                  className="aspect-video relative bg-muted"
                  onClick={() => onViewRecipe(recipe)}
                >
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {getSourceIcon(recipe.source)} {getSourceLabel(recipe.source)}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-background/80 hover:bg-background">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(recipe)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Recipe
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Recipe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <CardContent className="p-4" onClick={() => onViewRecipe(recipe)}>
                  <div className="space-y-3">
                    <div>
                      <h3 className="line-clamp-2">{recipe.title}</h3>
                      {recipe.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {recipe.prepTime + recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {recipe.servings}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    {recipe.dietaryTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {recipe.dietaryTags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {recipe.dietaryTags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{recipe.dietaryTags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Separator />
                    
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(recipe.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}