// Interface definitions moved inline to avoid import issues
interface Annotation {
  id: string;
  element: string;
  title: string;
  content: string;
  type: 'tooltip' | 'popover' | 'highlight' | 'tour';
  position?: 'top' | 'bottom' | 'left' | 'right';
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  showOnce?: boolean;
  delay?: number;
}

interface TourStep {
  id: string;
  element: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  spotlight?: boolean;
}

// Recipe App Annotations
export const recipeAppAnnotations: Annotation[] = [
  // Test Annotation (always available for debugging)
  {
    id: 'test-element',
    element: '[data-annotation="test-element"]',
    title: '🧪 Test Element',
    content: 'This is a test annotation to verify the help system is working correctly. If you can see this, the annotation system is functioning!',
    type: 'popover',
    position: 'bottom',
    category: 'Debug',
    priority: 'high'
  },
  
  // Browse Tab Annotations
  {
    id: 'search-bar',
    element: '[data-annotation="search-bar"]',
    title: 'Smart Recipe Search',
    content: 'Search by recipe name, ingredients, cuisine type, or dietary restrictions. Try "chicken pasta" or "gluten-free dessert"!',
    type: 'popover',
    position: 'bottom',
    category: 'Search',
    priority: 'high'
  },
  {
    id: 'recipe-filters',
    element: '[data-annotation="recipe-filters"]',
    title: 'Advanced Filtering',
    content: 'Use these filters to narrow down recipes by cuisine, cooking time, difficulty level, and dietary preferences.',
    type: 'popover',
    position: 'bottom',
    category: 'Search',
    priority: 'medium'
  },
  {
    id: 'custom-recipe-button',
    element: '[data-annotation="custom-recipe"]',
    title: 'Create Your Own Recipes',
    content: 'Add your family recipes or create new ones from scratch. You can even import recipes from URLs!',
    type: 'popover',
    position: 'left',
    category: 'Creation',
    priority: 'high'
  },
  {
    id: 'recipe-card-favorite',
    element: '[data-annotation="favorite-button"]',
    title: 'Save Favorites',
    content: 'Click the heart icon to save recipes to your favorites. You can organize them into folders later!',
    type: 'tooltip',
    position: 'top',
    category: 'Organization',
    priority: 'high'
  },

  // Favorites Tab Annotations
  {
    id: 'manage-favorites',
    element: '[data-annotation="manage-favorites"]',
    title: 'Organize Your Collection',
    content: 'Access advanced organization tools including folders, tags, and personal ratings for your saved recipes.',
    type: 'popover',
    position: 'left',
    category: 'Organization',
    priority: 'high'
  },
  {
    id: 'folder-system',
    element: '[data-annotation="folder-system"]',
    title: 'Recipe Folders',
    content: 'Create custom folders like "Weeknight Dinners" or "Holiday Treats" to organize your recipes perfectly.',
    type: 'popover',
    position: 'bottom',
    category: 'Organization',
    priority: 'medium'
  },

  // Meal Planner Annotations
  {
    id: 'meal-planner',
    element: '[data-annotation="meal-planner"]',
    title: 'Weekly Meal Planning',
    content: 'Plan your meals for the entire week! Drag recipes to different days and meal slots.',
    type: 'popover',
    position: 'bottom',
    category: 'Planning',
    priority: 'high'
  },
  {
    id: 'shopping-list-gen',
    element: '[data-annotation="shopping-list"]',
    title: 'Automatic Shopping Lists',
    content: 'Generate shopping lists from your meal plans automatically. No more forgotten ingredients!',
    type: 'popover',
    position: 'bottom',
    category: 'Planning',
    priority: 'high'
  },

  // Shopping Tab Annotations
  {
    id: 'shopping-categories',
    element: '[data-annotation="shopping-categories"]',
    title: 'Smart Organization',
    content: 'Items are automatically organized by store sections like Produce, Dairy, and Meat for efficient shopping.',
    type: 'popover',
    position: 'right',
    category: 'Shopping',
    priority: 'medium'
  },
  {
    id: 'shopping-export',
    element: '[data-annotation="shopping-export"]',
    title: 'Export & Share',
    content: 'Export your shopping list to apps like AnyList or share it with family members.',
    type: 'tooltip',
    position: 'top',
    category: 'Shopping',
    priority: 'medium'
  },

  // AI Assistant Annotations
  {
    id: 'ai-assistant',
    element: '[data-annotation="ai-assistant"]',
    title: 'Your Personal AI Chef',
    content: 'Ask for recipe suggestions based on your health goals, available ingredients, or dietary restrictions.',
    type: 'popover',
    position: 'bottom',
    category: 'AI',
    priority: 'high'
  },
  {
    id: 'health-analysis',
    element: '[data-annotation="health-analysis"]',
    title: 'Health-Aware Recommendations',
    content: 'Get personalized recipe suggestions based on your dietary preferences and health conditions.',
    type: 'popover',
    position: 'left',
    category: 'AI',
    priority: 'medium'
  },

  // Recipe Detail Annotations
  {
    id: 'nutrition-info',
    element: '[data-annotation="nutrition"]',
    title: 'Detailed Nutrition',
    content: 'View complete nutritional information including calories, macros, and a health score for each recipe.',
    type: 'tooltip',
    position: 'right',
    category: 'Health',
    priority: 'medium'
  },
  {
    id: 'recipe-scaling',
    element: '[data-annotation="servings"]',
    title: 'Smart Scaling',
    content: 'Adjust serving sizes and watch ingredients automatically scale to the right portions.',
    type: 'tooltip',
    position: 'bottom',
    category: 'Cooking',
    priority: 'high'
  }
];

// Guided Tours
export const recipeTours: { [key: string]: TourStep[] } = {
  'getting-started': [
    {
      id: 'welcome',
      element: '[data-tour="app-header"]',
      title: 'Welcome to Your Recipe App!',
      content: 'Let\'s take a quick tour to show you the main features that will help you discover, organize, and cook amazing meals.',
      position: 'bottom',
      spotlight: true
    },
    {
      id: 'browse-recipes',
      element: '[data-tour="browse-tab"]',
      title: 'Discover Recipes',
      content: 'Browse through our collection of recipes or search by ingredients, cuisine, or dietary needs.',
      position: 'bottom'
    },
    {
      id: 'save-favorites',
      element: '[data-tour="favorites-tab"]',
      title: 'Save & Organize',
      content: 'Save recipes you love and organize them into custom folders for easy access.',
      position: 'bottom'
    },
    {
      id: 'meal-planning',
      element: '[data-tour="meal-planner-tab"]',
      title: 'Plan Your Meals',
      content: 'Plan your weekly meals and generate shopping lists automatically.',
      position: 'bottom'
    },
    {
      id: 'ai-help',
      element: '[data-tour="ai-tab"]',
      title: 'AI-Powered Assistance',
      content: 'Get personalized recipe recommendations and cooking advice from your AI chef assistant.',
      position: 'bottom'
    }
  ],

  'meal-planning': [
    {
      id: 'calendar-view',
      element: '[data-tour="meal-calendar"]',
      title: 'Your Meal Calendar',
      content: 'This is your weekly meal planning calendar. Each day has slots for breakfast, lunch, dinner, and snacks.',
      position: 'bottom',
      spotlight: true
    },
    {
      id: 'add-recipe',
      element: '[data-tour="meal-slot"]',
      title: 'Adding Recipes',
      content: 'Click on any meal slot to add a recipe. You can search through all your saved recipes or the entire collection.',
      position: 'top'
    },
    {
      id: 'generate-shopping-list',
      element: '[data-tour="generate-shopping"]',
      title: 'Automatic Shopping Lists',
      content: 'Once you\'ve planned your meals, click here to automatically generate a shopping list with all the ingredients you\'ll need.',
      position: 'left'
    },
    {
      id: 'nutrition-overview',
      element: '[data-tour="nutrition-overview"]',
      title: 'Nutrition Tracking',
      content: 'Keep track of your weekly nutrition goals with automatic calculation from your planned meals.',
      position: 'top'
    }
  ],

  'favorites-organization': [
    {
      id: 'favorites-overview',
      element: '[data-tour="favorites-overview"]',
      title: 'Your Recipe Collection',
      content: 'This is where all your saved recipes live. Let\'s explore how to organize them effectively.',
      position: 'bottom'
    },
    {
      id: 'create-folders',
      element: '[data-tour="new-folder"]',
      title: 'Create Folders',
      content: 'Create custom folders to organize your recipes by type, occasion, or any system that works for you.',
      position: 'left',
      spotlight: true
    },
    {
      id: 'recipe-actions',
      element: '[data-tour="recipe-actions"]',
      title: 'Recipe Management',
      content: 'Click the menu on any recipe card to edit details, move to folders, add personal notes, or rate recipes.',
      position: 'left'
    },
    {
      id: 'search-and-filter',
      element: '[data-tour="favorites-search"]',
      title: 'Find Your Recipes',
      content: 'Use the search and filter tools to quickly find specific recipes in your collection.',
      position: 'bottom'
    }
  ],

  'custom-recipes': [
    {
      id: 'custom-intro',
      element: '[data-tour="custom-recipes"]',
      title: 'Your Personal Recipes',
      content: 'Create and manage your own custom recipes - from family favorites to new experiments!',
      position: 'bottom'
    },
    {
      id: 'create-recipe',
      element: '[data-tour="create-recipe"]',
      title: 'Create New Recipe',
      content: 'Click here to create a recipe from scratch. You can add ingredients, instructions, photos, and more.',
      position: 'bottom',
      spotlight: true
    },
    {
      id: 'import-recipe',
      element: '[data-tour="import-recipe"]',
      title: 'Import from Web',
      content: 'You can also import recipes directly from cooking websites by pasting the URL.',
      position: 'bottom'
    },
    {
      id: 'recipe-photos',
      element: '[data-tour="recipe-photos"]',
      title: 'Add Photos',
      content: 'Make your recipes look amazing by adding photos from Unsplash or uploading your own.',
      position: 'right'
    }
  ]
};