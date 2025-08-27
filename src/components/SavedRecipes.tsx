import { useState, useMemo, useEffect } from 'react';
import { 
  Heart, 
  Clock, 
  Folder, 
  Tag, 
  ArrowLeft, 
  Plus, 
  Search, 
  SortAsc, 
  SortDesc,
  Calendar,
  Filter,
  BookmarkPlus,
  FolderPlus,
  MoreVertical,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { QuickMealPlannerDialog } from './QuickMealPlannerDialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  Recipe, 
  SavedRecipe, 
  RecipeFolder, 
  FavoritesState, 
  FavoritesView, 
  FavoritesFilters 
} from '../types/recipe';
import { toast } from 'sonner';

interface SavedRecipesProps {
  onBack: () => void;
  onAddToMealPlan: (date: Date, mealType: string, recipe: Recipe) => void;
  userPreferences?: any;
}

// Mock saved recipes data - in a real app this would come from a database
const MOCK_FOLDERS: RecipeFolder[] = [
  {
    id: 'weeknight',
    name: 'Weeknight Favorites',
    description: 'Quick and easy meals for busy nights',
    color: '#3B82F6',
    createdAt: new Date('2024-01-15'),
    recipeCount: 8
  },
  {
    id: 'healthy',
    name: 'Healthy Options',
    description: 'Nutritious and delicious recipes',
    color: '#10B981',
    createdAt: new Date('2024-01-20'),
    recipeCount: 12
  },
  {
    id: 'special',
    name: 'Special Occasions',
    description: 'Impressive dishes for entertaining',
    color: '#F59E0B',
    createdAt: new Date('2024-02-01'),
    recipeCount: 5
  }
];

const DEFAULT_TAGS = [
  'breakfast', 'lunch', 'dinner', 'snacks', 
  'quick', 'healthy', 'comfort food', 'vegetarian', 
  'family-friendly', 'meal prep', 'low-carb', 'protein-rich'
];

export function SavedRecipes({ onBack, onAddToMealPlan, userPreferences }: SavedRecipesProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favoritesState, setFavoritesState] = useState<FavoritesState>({
    savedRecipes: new Map(),
    folders: MOCK_FOLDERS,
    recentlyViewed: [],
    defaultTags: DEFAULT_TAGS
  });

  const [filters, setFilters] = useState<FavoritesFilters>({
    view: 'all',
    selectedTags: [],
    sortBy: 'recent',
    sortOrder: 'desc'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFolderDialog, setShowAddFolderDialog] = useState(false);
  const [showEditRecipeDialog, setShowEditRecipeDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SavedRecipe | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3B82F6');
  const [showQuickPlannerDialog, setShowQuickPlannerDialog] = useState(false);
  const [plannerSelectedRecipe, setPlannerSelectedRecipe] = useState<Recipe | null>(null);
  const [showEditFolderDialog, setShowEditFolderDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<RecipeFolder | null>(null);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipe-favorites');
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites);
        
        // Convert savedRecipes back to proper format with Date objects
        const savedRecipesMap = new Map();
        if (parsed.savedRecipes) {
          parsed.savedRecipes.forEach(([recipeId, savedRecipe]: [string, any]) => {
            savedRecipesMap.set(recipeId, {
              ...savedRecipe,
              savedAt: new Date(savedRecipe.savedAt) // Convert string back to Date
            });
          });
        }

        // Convert folder dates back to Date objects
        const folders = (parsed.folders || MOCK_FOLDERS).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt)
        }));

        setFavoritesState(prev => ({
          ...prev,
          savedRecipes: savedRecipesMap,
          folders,
          recentlyViewed: parsed.recentlyViewed || []
        }));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      savedRecipes: Array.from(favoritesState.savedRecipes.entries()),
      folders: favoritesState.folders,
      recentlyViewed: favoritesState.recentlyViewed
    };
    localStorage.setItem('recipe-favorites', JSON.stringify(dataToSave));
  }, [favoritesState]);

  // Get filtered and sorted recipes
  const filteredRecipes = useMemo(() => {
    let recipes = Array.from(favoritesState.savedRecipes.values());

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      recipes = recipes.filter(savedRecipe => 
        savedRecipe.recipe.title.toLowerCase().includes(query) ||
        savedRecipe.recipe.ingredients.some(ingredient => 
          (typeof ingredient === 'string' ? ingredient : ingredient.name).toLowerCase().includes(query)
        ) ||
        savedRecipe.tags.some(tag => tag.toLowerCase().includes(query)) ||
        savedRecipe.notes?.toLowerCase().includes(query)
      );
    }

    // Apply view filter
    switch (filters.view) {
      case 'recent':
        recipes = recipes.filter(savedRecipe => {
          const daysSinceAdded = Math.floor((Date.now() - savedRecipe.savedAt.getTime()) / (1000 * 60 * 60 * 24));
          return daysSinceAdded <= 30; // Last 30 days
        });
        break;
      case 'folders':
        if (filters.selectedFolder) {
          recipes = recipes.filter(savedRecipe => savedRecipe.folder === filters.selectedFolder);
        }
        break;
      case 'tags':
        if (filters.selectedTags.length > 0) {
          recipes = recipes.filter(savedRecipe => 
            filters.selectedTags.some(tag => savedRecipe.tags.includes(tag))
          );
        }
        break;
    }

    // Apply tag filter
    if (filters.selectedTags.length > 0 && filters.view !== 'tags') {
      recipes = recipes.filter(savedRecipe => 
        filters.selectedTags.some(tag => savedRecipe.tags.includes(tag))
      );
    }

    // Sort recipes
    recipes.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'recent':
          comparison = b.savedAt.getTime() - a.savedAt.getTime();
          break;
        case 'name':
          comparison = a.recipe.title.localeCompare(b.recipe.title);
          break;
        case 'rating':
          comparison = (b.recipe.rating || 0) - (a.recipe.rating || 0);
          break;
        case 'cookingTime':
          const aTime = (a.recipe.prepTime || 0) + (a.recipe.cookTime || 0);
          const bTime = (b.recipe.prepTime || 0) + (b.recipe.cookTime || 0);
          comparison = aTime - bTime;
          break;
      }

      return filters.sortOrder === 'desc' ? comparison : -comparison;
    });

    return recipes;
  }, [favoritesState.savedRecipes, searchQuery, filters]);

  // Get recipe statistics
  const stats = useMemo(() => {
    const total = favoritesState.savedRecipes.size;
    const recent = Array.from(favoritesState.savedRecipes.values()).filter(savedRecipe => {
      const daysSinceAdded = Math.floor((Date.now() - savedRecipe.savedAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceAdded <= 7;
    }).length;

    const folderCounts = favoritesState.folders.map(folder => ({
      ...folder,
      count: Array.from(favoritesState.savedRecipes.values()).filter(
        savedRecipe => savedRecipe.folder === folder.id
      ).length
    }));

    const tagCounts = new Map<string, number>();
    Array.from(favoritesState.savedRecipes.values()).forEach(savedRecipe => {
      savedRecipe.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return { total, recent, folderCounts, tagCounts };
  }, [favoritesState]);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    const newFolder: RecipeFolder = {
      id: Math.random().toString(36).substr(2, 9),
      name: newFolderName,
      description: newFolderDescription,
      color: newFolderColor,
      createdAt: new Date(),
      recipeCount: 0
    };

    setFavoritesState(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder]
    }));

    setNewFolderName('');
    setNewFolderDescription('');
    setShowAddFolderDialog(false);
    toast.success('Folder created successfully');
  };

  const handleEditRecipe = (savedRecipe: SavedRecipe) => {
    setEditingRecipe({ ...savedRecipe });
    setShowEditRecipeDialog(true);
  };

  const handleSaveEditRecipe = () => {
    if (!editingRecipe) return;

    setFavoritesState(prev => {
      const newSavedRecipes = new Map(prev.savedRecipes);
      newSavedRecipes.set(editingRecipe.recipe.id, editingRecipe);
      return {
        ...prev,
        savedRecipes: newSavedRecipes
      };
    });

    setShowEditRecipeDialog(false);
    setEditingRecipe(null);
    toast.success('Recipe updated successfully');
  };

  const handleMoveToFolder = (recipeId: string, folderId: string | undefined) => {
    setFavoritesState(prev => {
      const newSavedRecipes = new Map(prev.savedRecipes);
      const savedRecipe = newSavedRecipes.get(recipeId);
      if (savedRecipe) {
        newSavedRecipes.set(recipeId, {
          ...savedRecipe,
          folder: folderId
        });
      }
      return {
        ...prev,
        savedRecipes: newSavedRecipes
      };
    });

    const folderName = folderId 
      ? favoritesState.folders.find(f => f.id === folderId)?.name 
      : 'No Folder';
    toast.success(`Recipe moved to ${folderName}`);
  };

  const handleDeleteFolder = (folderId: string) => {
    // Move all recipes from this folder to no folder
    setFavoritesState(prev => {
      const newSavedRecipes = new Map(prev.savedRecipes);
      const newFolders = prev.folders.filter(f => f.id !== folderId);
      
      // Update recipes that were in this folder
      Array.from(newSavedRecipes.values()).forEach(savedRecipe => {
        if (savedRecipe.folder === folderId) {
          newSavedRecipes.set(savedRecipe.recipe.id, {
            ...savedRecipe,
            folder: undefined
          });
        }
      });

      return {
        ...prev,
        savedRecipes: newSavedRecipes,
        folders: newFolders
      };
    });

    toast.success('Folder deleted and recipes moved to uncategorized');
  };

  const handleEditFolder = (folder: RecipeFolder) => {
    setEditingFolder({ ...folder });
    setNewFolderName(folder.name);
    setNewFolderDescription(folder.description);
    setNewFolderColor(folder.color);
    setShowEditFolderDialog(true);
  };

  const handleSaveEditFolder = () => {
    if (!editingFolder || !newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setFavoritesState(prev => {
      const newFolders = prev.folders.map(folder => 
        folder.id === editingFolder.id 
          ? { ...folder, name: newFolderName, description: newFolderDescription, color: newFolderColor }
          : folder
      );
      return {
        ...prev,
        folders: newFolders
      };
    });

    setShowEditFolderDialog(false);
    setEditingFolder(null);
    setNewFolderName('');
    setNewFolderDescription('');
    setNewFolderColor('#3B82F6');
    toast.success('Folder updated successfully');
  };

  const handleRemoveRecipe = (recipeId: string) => {
    setFavoritesState(prev => {
      const newSavedRecipes = new Map(prev.savedRecipes);
      newSavedRecipes.delete(recipeId);
      return {
        ...prev,
        savedRecipes: newSavedRecipes
      };
    });
    toast.success('Recipe removed from favorites');
  };

  const handleQuickAddToPlanner = (recipe: Recipe) => {
    setPlannerSelectedRecipe(recipe);
    setShowQuickPlannerDialog(true);
  };

  // Show detailed view if a recipe is selected
  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setSelectedRecipe(null)}
        onAddToMealPlan={onAddToMealPlan}
        isFavorited={favoritesState.savedRecipes.has(selectedRecipe.id)}
        // onToggleFavorite={(recipe, isFavorited) => {
        //   if (isFavorited) {
        //     setFavoritesState(prev => {
        //       const newSavedRecipes = new Map(prev.savedRecipes);
        //       newSavedRecipes.delete(recipe.id);
        //       return {
        //         ...prev,
        //         savedRecipes: newSavedRecipes
        //       };
        //     });
        //   } else {
        //     const savedRecipe: SavedRecipe = {
        //       recipe,
        //       savedAt: new Date(),
        //       tags: ['favorites'],
        //       folder: undefined
        //     };
        //     setFavoritesState(prev => {
        //       const newSavedRecipes = new Map(prev.savedRecipes);
        //       newSavedRecipes.set(recipe.id, savedRecipe);
        //       return {
        //         ...prev,
        //         savedRecipes: newSavedRecipes
        //       };
        //     });
        //   }
        // }}
      />
    );
  }

  const renderRecipeActions = (savedRecipe: SavedRecipe) => (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleEditRecipe(savedRecipe)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleQuickAddToPlanner(savedRecipe.recipe)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Add to Planner
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleMoveToFolder(savedRecipe.recipe.id, undefined)}
            disabled={!savedRecipe.folder}
          >
            <Folder className="mr-2 h-4 w-4" />
            Remove from Folder
          </DropdownMenuItem>
          {favoritesState.folders.map(folder => (
            <DropdownMenuItem 
              key={folder.id}
              onClick={() => handleMoveToFolder(savedRecipe.recipe.id, folder.id)}
              disabled={savedRecipe.folder === folder.id}
            >
              <div className="flex items-center mr-2">
                <div 
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="text-xs">{folder.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-destructive"
            onClick={() => handleRemoveRecipe(savedRecipe.recipe.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove from Favorites
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const renderRecipeGrid = (recipes: SavedRecipe[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((savedRecipe) => (
        <div key={savedRecipe.recipe.id} className="relative group" data-tour="recipe-actions">
          <RecipeCard
            recipe={savedRecipe.recipe}
            onClick={() => setSelectedRecipe(savedRecipe.recipe)}
            showFavoriteButton={false}
          />
          
          {renderRecipeActions(savedRecipe)}

          {/* Recipe Metadata */}
          <div className="mt-2 space-y-2">
            {savedRecipe.folder && (
              <Badge variant="outline" className="text-xs">
                <Folder className="mr-1 h-3 w-3" />
                {favoritesState.folders.find(f => f.id === savedRecipe.folder)?.name}
              </Badge>
            )}
            
            <div className="flex flex-wrap gap-1">
              {savedRecipe.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {savedRecipe.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{savedRecipe.tags.length - 3} more
                </Badge>
              )}
            </div>
            
            {savedRecipe.personalRating && (
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3 w-3 ${i < savedRecipe.personalRating! ? 'text-yellow-500 fill-current' : 'text-muted-foreground'}`} 
                  />
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Saved {savedRecipe.savedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                My Saved Recipes
              </h1>
              <p className="text-sm text-muted-foreground">
                {stats.total} saved recipes • {stats.recent} added this week
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setShowAddFolderDialog(true)}
            className="flex items-center gap-2"
            data-tour="new-folder"
            data-annotation="manage-favorites"
          >
            <FolderPlus className="h-4 w-4" />
            New Folder
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs 
          value={filters.view} 
          onValueChange={(value) => setFilters(prev => ({ ...prev, view: value as FavoritesView }))}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookmarkPlus className="h-4 w-4" />
              All ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent ({stats.recent})
            </TabsTrigger>
            <TabsTrigger value="folders" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Folders ({stats.folderCounts.length})
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags ({stats.tagCounts.size})
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1" data-tour="favorites-search">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select 
                value={filters.sortBy} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Saved</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="cookingTime">Cooking Time</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="space-y-6">
            {filteredRecipes.length > 0 ? (
              renderRecipeGrid(filteredRecipes)
            ) : (
              <div className="text-center py-12 space-y-4">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3>No saved recipes found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Try adjusting your search terms"
                      : "Start saving recipes you love to see them here"
                    }
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            {filteredRecipes.length > 0 ? (
              renderRecipeGrid(filteredRecipes)
            ) : (
              <div className="text-center py-12 space-y-4">
                <Clock className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3>No recent saves</h3>
                  <p className="text-muted-foreground">
                    Recipes saved in the last 30 days will appear here
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="folders" className="space-y-6">
            {/* Folder Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-annotation="folder-system" data-tour="favorites-overview">
              {stats.folderCounts.map((folder) => (
                <Card 
                  key={folder.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    filters.selectedFolder === folder.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-2 flex-1"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          selectedFolder: prev.selectedFolder === folder.id ? undefined : folder.id 
                        }))}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <h4>{folder.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{folder.count}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteFolder(folder.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Folder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {folder.description && (
                      <p 
                        className="text-sm text-muted-foreground"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          selectedFolder: prev.selectedFolder === folder.id ? undefined : folder.id 
                        }))}
                      >
                        {folder.description}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Show recipes from selected folder */}
            {filters.selectedFolder && filteredRecipes.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3>
                  {stats.folderCounts.find(f => f.id === filters.selectedFolder)?.name} 
                  ({filteredRecipes.length})
                </h3>
                {renderRecipeGrid(filteredRecipes)}
              </div>
            )}

            {filters.selectedFolder && filteredRecipes.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <Folder className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                <div className="space-y-2">
                  <h3>No recipes in this folder</h3>
                  <p className="text-muted-foreground">
                    Move some recipes to this folder to see them here
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tags" className="space-y-6">
            {/* Tag Cloud */}
            <div className="space-y-4">
              <h3>Select Tags to Filter</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(stats.tagCounts.entries())
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <Badge
                      key={tag}
                      variant={filters.selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          selectedTags: prev.selectedTags.includes(tag)
                            ? prev.selectedTags.filter(t => t !== tag)
                            : [...prev.selectedTags, tag]
                        }));
                      }}
                    >
                      {tag} ({count})
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Show recipes with selected tags */}
            {filters.selectedTags.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3>
                  Recipes tagged with: {filters.selectedTags.join(', ')} 
                  ({filteredRecipes.length})
                </h3>
                {filteredRecipes.length > 0 ? (
                  renderRecipeGrid(filteredRecipes)
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <Tag className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    <div className="space-y-2">
                      <h3>No recipes with selected tags</h3>
                      <p className="text-muted-foreground">
                        Try selecting different tags or clear your selection
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick meal planner dialog */}
        {/* {showQuickPlannerDialog && plannerSelectedRecipe && (
          <QuickMealPlannerDialog
            recipe={plannerSelectedRecipe}
            onClose={() => setShowQuickPlannerDialog(false)}
            onAddToMealPlan={onAddToMealPlan}
          />
        )} */}

        {/* Add Folder Dialog */}
        <Dialog open={showAddFolderDialog} onOpenChange={setShowAddFolderDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Organize your saved recipes into custom folders
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Weeknight Dinners"
                />
              </div>
              <div>
                <Label htmlFor="folder-description">Description (Optional)</Label>
                <Textarea
                  id="folder-description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="What kind of recipes will you save here?"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="folder-color">Folder Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newFolderColor === color ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolderColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddFolderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddFolder}>
                  Create Folder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Folder Dialog */}
        <Dialog open={showEditFolderDialog} onOpenChange={setShowEditFolderDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
              <DialogDescription>
                Update your folder details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-folder-name">Folder Name</Label>
                <Input
                  id="edit-folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Weeknight Dinners"
                />
              </div>
              <div>
                <Label htmlFor="edit-folder-description">Description (Optional)</Label>
                <Textarea
                  id="edit-folder-description"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="What kind of recipes will you save here?"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit-folder-color">Folder Color</Label>
                <div className="flex gap-2 mt-2">
                  {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newFolderColor === color ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewFolderColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditFolderDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEditFolder}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Recipe Dialog */}
        <Dialog open={showEditRecipeDialog} onOpenChange={setShowEditRecipeDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Recipe Details</DialogTitle>
              <DialogDescription>
                Update your personal notes and organization for this recipe
              </DialogDescription>
            </DialogHeader>
            {editingRecipe && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <ImageWithFallback
                    src={editingRecipe.recipe.image}
                    alt={editingRecipe.recipe.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div>
                    <h4>{editingRecipe.recipe.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {editingRecipe.recipe.cuisine} • {editingRecipe.recipe.difficulty}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipe-folder">Folder</Label>
                  <Select 
                    value={editingRecipe.folder || ''} 
                    onValueChange={(value) => setEditingRecipe({
                      ...editingRecipe,
                      folder: value || undefined
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No folder</SelectItem>
                      {favoritesState.folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: folder.color }}
                            />
                            {folder.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipe-tags">Tags</Label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {editingRecipe.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                          {tag}
                          <button
                            onClick={() => setEditingRecipe({
                              ...editingRecipe,
                              tags: editingRecipe.tags.filter((_, i) => i !== index)
                            })}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {DEFAULT_TAGS.filter(tag => !editingRecipe.tags.includes(tag)).slice(0, 6).map(tag => (
                        <Badge 
                          key={tag} 
                          variant="outline" 
                          className="text-xs cursor-pointer hover:bg-secondary"
                          onClick={() => setEditingRecipe({
                            ...editingRecipe,
                            tags: [...editingRecipe.tags, tag]
                          })}
                        >
                          + {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipe-notes">Personal Notes</Label>
                  <Textarea
                    id="recipe-notes"
                    value={editingRecipe.notes || ''}
                    onChange={(e) => setEditingRecipe({
                      ...editingRecipe,
                      notes: e.target.value
                    })}
                    placeholder="Add your personal notes, modifications, or reminders..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="personal-rating">Personal Rating</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setEditingRecipe({
                          ...editingRecipe,
                          personalRating: rating
                        })}
                        className={`p-1 ${
                          (editingRecipe.personalRating || 0) >= rating 
                            ? 'text-yellow-500' 
                            : 'text-muted-foreground hover:text-yellow-500'
                        }`}
                      >
                        <Star className="h-5 w-5 fill-current" />
                      </button>
                    ))}
                    {editingRecipe.personalRating && (
                      <button
                        onClick={() => setEditingRecipe({
                          ...editingRecipe,
                          personalRating: undefined
                        })}
                        className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowEditRecipeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEditRecipe}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}