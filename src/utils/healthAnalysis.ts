/**
 * Health-aware recipe analysis and scoring utilities
 */

export interface HealthCondition {
  name: string;
  restrictions: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
  category: 'cardiovascular' | 'metabolic' | 'digestive' | 'inflammatory' | 'other';
}

export interface NutritionalProfile {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  calories: number;
}

export interface HealthScore {
  overall: number;
  cardiovascular: number;
  metabolic: number;
  inflammatory: number;
  weightManagement: number;
  details: string[];
}

export const HEALTH_CONDITIONS: Record<string, HealthCondition> = {
  'high blood pressure': {
    name: 'High Blood Pressure',
    restrictions: ['high sodium', 'processed meats', 'canned foods', 'fast food', 'pickled foods'],
    recommendations: ['potassium-rich', 'low sodium', 'whole grains', 'lean proteins', 'fruits', 'vegetables'],
    severity: 'high',
    category: 'cardiovascular'
  },
  'uric acid': {
    name: 'High Uric Acid / Gout',
    restrictions: ['high purine', 'organ meats', 'shellfish', 'anchovies', 'sardines', 'beer', 'wine'],
    recommendations: ['low purine', 'dairy', 'whole grains', 'vegetables', 'cherries', 'water'],
    severity: 'medium',
    category: 'inflammatory'
  },
  'weight loss': {
    name: 'Weight Management',
    restrictions: ['high calorie', 'fried foods', 'sugary drinks', 'processed snacks', 'refined carbs'],
    recommendations: ['low calorie', 'high fiber', 'lean proteins', 'vegetables', 'portion control'],
    severity: 'medium',
    category: 'metabolic'
  },
  'diabetes': {
    name: 'Diabetes',
    restrictions: ['high sugar', 'refined carbs', 'sweetened beverages', 'white bread', 'candy'],
    recommendations: ['low glycemic', 'complex carbs', 'fiber-rich', 'lean proteins', 'non-starchy vegetables'],
    severity: 'high',
    category: 'metabolic'
  },
  'high cholesterol': {
    name: 'High Cholesterol',
    restrictions: ['saturated fat', 'trans fat', 'fried foods', 'full-fat dairy', 'processed meats'],
    recommendations: ['omega-3', 'fiber-rich', 'plant sterols', 'lean proteins', 'nuts', 'olive oil'],
    severity: 'high',
    category: 'cardiovascular'
  },
  'acid reflux': {
    name: 'Acid Reflux / GERD',
    restrictions: ['spicy foods', 'citrus fruits', 'tomatoes', 'caffeine', 'alcohol', 'mint'],
    recommendations: ['alkaline foods', 'lean proteins', 'non-citrus fruits', 'vegetables', 'whole grains'],
    severity: 'medium',
    category: 'digestive'
  },
  'ibs': {
    name: 'Irritable Bowel Syndrome',
    restrictions: ['high FODMAP', 'beans', 'onions', 'garlic', 'wheat', 'dairy'],
    recommendations: ['low FODMAP', 'rice', 'quinoa', 'lean proteins', 'carrots', 'spinach'],
    severity: 'medium',
    category: 'digestive'
  }
};

export class HealthAnalyzer {
  static parseHealthConditions(text: string): string[] {
    const conditions: string[] = [];
    const lowerText = text.toLowerCase();

    // Direct condition matching
    Object.keys(HEALTH_CONDITIONS).forEach(condition => {
      if (lowerText.includes(condition)) {
        conditions.push(condition);
      }
    });

    // Alternative term matching
    const alternatives: Record<string, string[]> = {
      'uric acid': ['gout', 'uric', 'purine'],
      'weight loss': ['lose weight', 'losing weight', 'diet', 'overweight'],
      'diabetes': ['diabetic', 'blood sugar', 'glucose'],
      'high cholesterol': ['cholesterol'],
      'acid reflux': ['gerd', 'heartburn', 'reflux'],
      'ibs': ['irritable bowel', 'bowel syndrome'],
      'high blood pressure': ['hypertension', 'blood pressure']
    };

    Object.entries(alternatives).forEach(([condition, terms]) => {
      if (terms.some(term => lowerText.includes(term)) && !conditions.includes(condition)) {
        conditions.push(condition);
      }
    });

    return conditions;
  }

  static estimateNutritionalProfile(recipe: any): NutritionalProfile {
    // This is a simplified estimation based on ingredients and tags
    // In a real app, you'd have a nutrition database
    // Handle both tags and dietaryTags properties (recipes use dietaryTags)
    const recipeTags = recipe.tags || [];
    const dietaryTags = recipe.dietaryTags || [];
    const tags = [...recipeTags, ...dietaryTags].map((t: string) => t.toLowerCase());
    const ingredients = (recipe.ingredients || []).map((ing: any) => {
      if (typeof ing === 'string') {
        return ing.toLowerCase();
      }
      if (ing && typeof ing === 'object' && ing.name) {
        return ing.name.toLowerCase();
      }
      return '';
    });
    
    let calories = 300; // Base calories
    let protein = 15;
    let carbs = 30;
    let fat = 10;
    let fiber = 5;
    let sodium = 400;
    const sugar = 5;

    // Adjust based on tags
    if (tags.includes('high-protein')) protein += 20;
    if (tags.includes('low-carb') || tags.includes('keto')) carbs = Math.max(5, carbs - 20);
    if (tags.includes('low-fat')) fat = Math.max(5, fat - 5);
    if (tags.includes('high-fiber')) fiber += 10;
    if (tags.includes('low-sodium')) sodium = Math.max(100, sodium - 200);

    // Adjust based on ingredients
    ingredients.forEach((ing: string) => {
      if (ing.includes('cheese') || ing.includes('butter')) {
        fat += 8;
        sodium += 100;
      }
      if (ing.includes('beans') || ing.includes('lentils')) {
        protein += 10;
        fiber += 8;
      }
      if (ing.includes('chicken') || ing.includes('fish')) {
        protein += 15;
      }
      if (ing.includes('salt') || ing.includes('soy sauce')) {
        sodium += 200;
      }
    });

    // Calculate total calories
    calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));

    return { protein, carbs, fat, fiber, sodium, sugar, calories };
  }

  static scoreRecipeForHealth(recipe: any, conditions: string[]): HealthScore {
    const nutrition = this.estimateNutritionalProfile(recipe);
    // Handle both tags and dietaryTags properties (recipes use dietaryTags)
    const recipeTags = recipe.tags || [];
    const dietaryTags = recipe.dietaryTags || [];
    const tags = [...recipeTags, ...dietaryTags].map((t: string) => t.toLowerCase());
    const recipeText = `${recipe.title} ${recipe.description || ''} ${tags.join(' ')}`.toLowerCase();
    
    let overall = 70; // Base score
    let cardiovascular = 70;
    let metabolic = 70;
    let inflammatory = 70;
    let weightManagement = 70;
    const details: string[] = [];

    // Score based on health conditions
    conditions.forEach(conditionKey => {
      const condition = HEALTH_CONDITIONS[conditionKey];
      if (!condition) return;

      // Check for restricted ingredients
      condition.restrictions.forEach(restriction => {
        if (recipeText.includes(restriction)) {
          overall -= 15;
          details.push(`Contains ${restriction} (not recommended for ${condition.name})`);
          
          switch (condition.category) {
            case 'cardiovascular':
              cardiovascular -= 20;
              break;
            case 'metabolic':
              metabolic -= 20;
              break;
            case 'inflammatory':
              inflammatory -= 20;
              break;
          }
        }
      });

      // Check for recommended ingredients
      condition.recommendations.forEach(recommendation => {
        if (recipeText.includes(recommendation)) {
          overall += 10;
          details.push(`Contains ${recommendation} (good for ${condition.name})`);
          
          switch (condition.category) {
            case 'cardiovascular':
              cardiovascular += 15;
              break;
            case 'metabolic':
              metabolic += 15;
              break;
            case 'inflammatory':
              inflammatory += 15;
              break;
          }
        }
      });
    });

    // Nutritional scoring
    if (nutrition.sodium < 300) {
      cardiovascular += 10;
      details.push('Low sodium content');
    } else if (nutrition.sodium > 800) {
      cardiovascular -= 15;
      details.push('High sodium content');
    }

    if (nutrition.fiber > 8) {
      metabolic += 10;
      weightManagement += 10;
      details.push('High fiber content');
    }

    if (nutrition.protein > 20) {
      weightManagement += 10;
      details.push('High protein content');
    }

    if (nutrition.calories < 400) {
      weightManagement += 15;
      details.push('Low calorie option');
    } else if (nutrition.calories > 600) {
      weightManagement -= 10;
      details.push('Higher calorie content');
    }

    // Ensure scores are within bounds
    const clamp = (score: number) => Math.max(0, Math.min(100, score));

    return {
      overall: clamp(overall),
      cardiovascular: clamp(cardiovascular),
      metabolic: clamp(metabolic),
      inflammatory: clamp(inflammatory),
      weightManagement: clamp(weightManagement),
      details: details.slice(0, 3) // Limit to top 3 details
    };
  }

  static rankRecipesByHealth(recipes: any[], conditions: string[]): any[] {
    return recipes
      .map(recipe => ({
        ...recipe,
        healthScore: this.scoreRecipeForHealth(recipe, conditions)
      }))
      .sort((a, b) => b.healthScore.overall - a.healthScore.overall);
  }

  static generateHealthAdvice(conditions: string[]): string[] {
    const advice: string[] = [];
    const categories = new Set(conditions.map(c => HEALTH_CONDITIONS[c]?.category).filter(Boolean));

    if (categories.has('cardiovascular')) {
      advice.push('Focus on low-sodium, potassium-rich foods to support heart health');
    }
    
    if (categories.has('metabolic')) {
      advice.push('Choose complex carbs and high-fiber foods for better blood sugar control');
    }
    
    if (categories.has('inflammatory')) {
      advice.push('Include anti-inflammatory foods like omega-3 rich fish and colorful vegetables');
    }
    
    if (conditions.includes('weight loss')) {
      advice.push('Prioritize lean proteins and vegetables to support healthy weight management');
    }

    return advice;
  }
}

// React hook for health analysis
export const useHealthAnalysis = () => {
  const parseConditions = (text: string) => HealthAnalyzer.parseHealthConditions(text);
  const scoreRecipe = (recipe: any, conditions: string[]) => HealthAnalyzer.scoreRecipeForHealth(recipe, conditions);
  const rankRecipes = (recipes: any[], conditions: string[]) => HealthAnalyzer.rankRecipesByHealth(recipes, conditions);
  const getAdvice = (conditions: string[]) => HealthAnalyzer.generateHealthAdvice(conditions);
  const getConditionInfo = (condition: string) => HEALTH_CONDITIONS[condition];

  return {
    parseConditions,
    scoreRecipe,
    rankRecipes,
    getAdvice,
    getConditionInfo,
    conditions: HEALTH_CONDITIONS
  };
};