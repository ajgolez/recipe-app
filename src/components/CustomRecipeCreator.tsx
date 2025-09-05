import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Plus, X, Upload, Link, Camera, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImageBrowser } from './ImageBrowser';

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

interface CustomRecipeCreatorProps {
  onBack: () => void;
  onSave: (recipe: CustomRecipe) => void;
}

export function CustomRecipeCreator({ onBack, onSave }: CustomRecipeCreatorProps) {
  const [activeTab, setActiveTab] = useState('manual');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
          <h1>Create Custom Recipe</h1>
          <p className="text-muted-foreground">Add your own recipes to your collection</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="import">Import from URL</TabsTrigger>
            <TabsTrigger value="photo">Photo/OCR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual">
            <ManualRecipeForm onSave={onSave} />
          </TabsContent>
          
          <TabsContent value="import">
            <ImportRecipeForm onSave={onSave} />
          </TabsContent>
          
          <TabsContent value="photo">
            <PhotoRecipeForm onSave={onSave} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ManualRecipeForm({ onSave }: { onSave: (recipe: CustomRecipe) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    cuisine: '',
    dietaryTags: [] as string[],
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [''],
    nutrition: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
      cholesterol: '',
      calcium: '',
      iron: '',
      vitaminD: '',
      potassium: '',
      vitaminC: '',
      vitaminA: '',
      vitaminB12: '',
      vitaminE: '',
      folate: '',
      magnesium: '',
      zinc: '',
      phosphorus: ''
    }
  });

  const [newTag, setNewTag] = useState('');

  const cuisines = [
    'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian',
    'French', 'Thai', 'Chinese', 'Japanese', 'Greek', 'Middle Eastern'
  ];

  const commonTags = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb',
    'High-Protein', 'Quick & Easy', 'One-Pot', 'Freezer-Friendly'
  ];

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const addTag = (tag: string) => {
    if (!formData.dietaryTags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        dietaryTags: [...prev.dietaryTags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.filter(t => t !== tag)
    }));
  };

  const handleAddCustomTag = () => {
    if (newTag.trim() && !formData.dietaryTags.includes(newTag.trim())) {
      addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Recipe title is required');
      return;
    }
    if (formData.ingredients.some(ing => !ing.name.trim())) {
      toast.error('All ingredients must have a name');
      return;
    }
    if (formData.instructions.some(inst => !inst.trim())) {
      toast.error('All instruction steps must be filled');
      return;
    }

    const recipe: CustomRecipe = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: formData.title,
      description: formData.description,
      image: formData.image || '/placeholder-recipe.jpg',
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      servings: parseInt(formData.servings) || 1,
      difficulty: formData.difficulty as 'Easy' | 'Medium' | 'Hard' || 'Medium',
      cuisine: formData.cuisine || 'Other',
      dietaryTags: formData.dietaryTags,
      ingredients: formData.ingredients.filter(ing => ing.name.trim()),
      instructions: formData.instructions.filter(inst => inst.trim()),
      nutrition: {
        calories: parseInt(formData.nutrition.calories) || 0,
        protein: parseInt(formData.nutrition.protein) || 0,
        carbs: parseInt(formData.nutrition.carbs) || 0,
        fat: parseInt(formData.nutrition.fat) || 0,
        fiber: parseInt(formData.nutrition.fiber) || 0,
        sugar: parseInt(formData.nutrition.sugar) || 0,
        sodium: 0,
        cholesterol: 0,
        calcium: 0,
        iron: 0,
        vitaminD: 0,
        potassium: 0,
        vitaminC: 0,
        vitaminA: 0,
        vitaminB12: 0,
        vitaminE: 0,
        folate: 0,
        magnesium: 0,
        zinc: 0,
        phosphorus: 0
      },
      rating: 0,
      reviewCount: 0,
      healthScore: 0,
      mealTypes: [],
      isCustom: true,
      createdAt: new Date().toISOString(),
      source: 'manual'
    };

    onSave(recipe);
    toast.success('Recipe saved successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Recipe Entry</CardTitle>
        <CardDescription>Enter your recipe details manually</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter recipe title"
            />
          </div>
          
          <ImageBrowser
            selectedImage={formData.image}
            onImageSelect={(imageUrl) => setFormData(prev => ({ ...prev, image: imageUrl }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of your recipe"
            rows={3}
          />
        </div>

        {/* Recipe Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prep-time">Prep Time (min)</Label>
            <Input
              id="prep-time"
              type="number"
              value={formData.prepTime}
              onChange={(e) => setFormData(prev => ({ ...prev, prepTime: e.target.value }))}
              placeholder="15"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cook-time">Cook Time (min)</Label>
            <Input
              id="cook-time"
              type="number"
              value={formData.cookTime}
              onChange={(e) => setFormData(prev => ({ ...prev, cookTime: e.target.value }))}
              placeholder="30"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData(prev => ({ ...prev, servings: e.target.value }))}
              placeholder="4"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cuisine">Cuisine</Label>
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, cuisine: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select cuisine" />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map(cuisine => (
                <SelectItem key={cuisine} value={cuisine}>{cuisine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dietary Tags */}
        <div className="space-y-3">
          <Label>Dietary Tags</Label>
          <div className="flex flex-wrap gap-2">
            {commonTags.map(tag => (
              <Badge
                key={tag}
                variant={formData.dietaryTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => formData.dietaryTags.includes(tag) ? removeTag(tag) : addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add custom tag"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
            />
            <Button type="button" onClick={handleAddCustomTag} variant="outline" size="sm">
              Add
            </Button>
          </div>
          {formData.dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.dietaryTags.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Ingredients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Ingredients *</Label>
            <Button type="button" onClick={addIngredient} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Ingredient
            </Button>
          </div>
          
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-5">
                <Input
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                />
              </div>
              <div className="col-span-3">
                <Input
                  value={ingredient.amount}
                  onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                  placeholder="Amount"
                />
              </div>
              <div className="col-span-3">
                <Input
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                  placeholder="Unit"
                />
              </div>
              <div className="col-span-1">
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Instructions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Instructions *</Label>
            <Button type="button" onClick={addInstruction} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Step
            </Button>
          </div>
          
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={instruction}
                  onChange={(e) => updateInstruction(index, e.target.value)}
                  placeholder={`Step ${index + 1}`}
                  rows={2}
                />
              </div>
              {formData.instructions.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInstruction(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Separator />

        {/* Nutrition Information */}
        <div className="space-y-4">
          <Label>Nutrition Information (per serving)</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.nutrition.calories}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nutrition: { ...prev.nutrition, calories: e.target.value }
                }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.nutrition.protein}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nutrition: { ...prev.nutrition, protein: e.target.value }
                }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.nutrition.carbs}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nutrition: { ...prev.nutrition, carbs: e.target.value }
                }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.nutrition.fat}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nutrition: { ...prev.nutrition, fat: e.target.value }
                }))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiber">Fiber (g)</Label>
              <Input
                id="fiber"
                type="number"
                value={formData.nutrition.fiber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  nutrition: { ...prev.nutrition, fiber: e.target.value }
                }))}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Recipe</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ImportRecipeForm({ onSave }: { onSave: (recipe: CustomRecipe) => void }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [importedData, setImportedData] = useState<Partial<CustomRecipe> | null>(null);

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to import recipe
    setTimeout(() => {
      // Mock imported recipe data
      const mockImportedRecipe = {
        title: "Imported: Delicious Pasta Dish",
        description: "A wonderful pasta recipe imported from the web",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500",
        prepTime: 15,
        cookTime: 25,
        servings: 4,
        difficulty: 'Medium' as const,
        cuisine: 'Italian',
        dietaryTags: ['Vegetarian'],
        ingredients: [
          { name: 'Pasta', amount: '1', unit: 'lb' },
          { name: 'Tomatoes', amount: '2', unit: 'cups' },
          { name: 'Garlic', amount: '3', unit: 'cloves' },
          { name: 'Olive Oil', amount: '2', unit: 'tbsp' }
        ],
        instructions: [
          'Boil water in a large pot',
          'Cook pasta according to package directions',
          'Heat olive oil in a pan and sauté garlic',
          'Add tomatoes and simmer',
          'Combine pasta with sauce and serve'
        ],
        nutrition: {
          calories: 320,
          protein: 12,
          carbs: 58,
          fat: 8,
          fiber: 4,
          sugar: 6,
          sodium: 0,
          cholesterol: 0,
          calcium: 0,
          iron: 0,
          vitaminD: 0,
          potassium: 0,
          vitaminC: 0,
          vitaminA: 0,
          vitaminB12: 0,
          vitaminE: 0,
          folate: 0,
          magnesium: 0,
          zinc: 0,
          phosphorus: 0
        }
      };
      
      setImportedData(mockImportedRecipe);
      setIsLoading(false);
      toast.success('Recipe imported successfully! Review and save.');
    }, 2000);
  };

  const handleSave = () => {
    if (!importedData) return;
    
    const recipe: CustomRecipe = {
      ...importedData as CustomRecipe,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      source: 'import'
    };

    onSave(recipe);
    toast.success('Imported recipe saved successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Recipe from URL</CardTitle>
        <CardDescription>Import recipes from cooking websites and blogs</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-url">Recipe URL</Label>
            <div className="flex gap-2">
              <Input
                id="import-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="flex-1"
              />
              <Button onClick={handleImport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Import
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>Supported sites: AllRecipes, Food Network, Serious Eats, NYT Cooking, and many more.</p>
          </div>
        </div>

        {importedData && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3>Imported Recipe Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4>{importedData.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{importedData.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>⏰ {(importedData.prepTime || 0) + (importedData.cookTime || 0)} min</span>
                  <span>👥 {importedData.servings} servings</span>
                  <span>📊 {importedData.difficulty}</span>
                </div>
              </div>
              {importedData.image && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={importedData.image} 
                    alt={importedData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setImportedData(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Recipe</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PhotoRecipeForm({ onSave }: { onSave: (recipe: CustomRecipe) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<CustomRecipe> | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleProcessPhoto = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setIsProcessing(true);
    
    // Simulate OCR processing
    setTimeout(() => {
      const mockExtractedRecipe = {
        title: "OCR Extracted Recipe",
        description: "Recipe extracted from photo using OCR technology",
        image: URL.createObjectURL(selectedFile),
        prepTime: 20,
        cookTime: 30,
        servings: 6,
        difficulty: 'Medium' as const,
        cuisine: 'American',
        dietaryTags: [],
        ingredients: [
          { name: 'Flour', amount: '2', unit: 'cups' },
          { name: 'Sugar', amount: '1', unit: 'cup' },
          { name: 'Eggs', amount: '2', unit: 'large' },
          { name: 'Butter', amount: '1/2', unit: 'cup' }
        ],
        instructions: [
          'Mix dry ingredients in a bowl',
          'Cream butter and sugar',
          'Add eggs one at a time',
          'Combine wet and dry ingredients',
          'Bake at 350°F for 25-30 minutes'
        ],
        nutrition: {
          calories: 250,
          protein: 6,
          carbs: 35,
          fat: 10,
          fiber: 2,
          sugar: 15,
          sodium: 0,
          cholesterol: 0,
          calcium: 0,
          iron: 0,
          vitaminD: 0,
          potassium: 0,
          vitaminC: 0,
          vitaminA: 0,
          vitaminB12: 0,
          vitaminE: 0,
          folate: 0,
          magnesium: 0,
          zinc: 0,
          phosphorus: 0
        }
      };
      
      setExtractedData(mockExtractedRecipe);
      setIsProcessing(false);
      toast.success('Recipe extracted successfully! Review and edit as needed.');
    }, 3000);
  };

  const handleSave = () => {
    if (!extractedData) return;
    
    const recipe: CustomRecipe = {
      ...extractedData as CustomRecipe,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      source: 'photo'
    };

    onSave(recipe);
    toast.success('Photo recipe saved successfully!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extract Recipe from Photo</CardTitle>
        <CardDescription>Upload a photo of a recipe and let OCR extract the details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p>Upload a photo of your recipe</p>
              <p className="text-sm text-muted-foreground">
                Supports images of recipe cards, cookbook pages, or handwritten recipes
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-4"
            />
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="text-sm">
                <strong>Selected file:</strong> {selectedFile.name}
              </div>
              
              <Button onClick={handleProcessPhoto} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Processing Image...
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4 mr-2" />
                    Extract Recipe
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {extractedData && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h3>Extracted Recipe Data</h3>
            <p className="text-sm text-muted-foreground">
              Review the extracted data below. You can edit any fields before saving.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input value={extractedData.title} readOnly />
                </div>
                <div>
                  <Label>Servings</Label>
                  <Input value={extractedData.servings?.toString()} readOnly />
                </div>
              </div>
              
              <div>
                <Label>Ingredients</Label>
                <div className="space-y-2 mt-2">
                  {extractedData.ingredients?.map((ing, idx) => (
                    <div key={idx} className="text-sm bg-background p-2 rounded border">
                      {ing.amount} {ing.unit} {ing.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExtractedData(null)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Recipe</Button>
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Tips for better results:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Use good lighting and avoid shadows</li>
            <li>Ensure text is clearly visible and not blurry</li>
            <li>Include the entire recipe in the photo</li>
            <li>Hold the camera steady and straight</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}