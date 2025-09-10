import { Recipe } from "@/types/recipe";
import { RecipeDisplayType } from "@/types/display";

// Function to format recipes based on the specified display type
export function formatRecipesForGPT(
  recipes: Recipe[],
  type: RecipeDisplayType
): string {

  console.log("type", type);
  
  return recipes
    .map((recipe) => {
      const base = `- id: ${recipe.id}
  title: ${recipe.title}
  description: ${recipe.description}
  cuisine: ${recipe.cuisine}
  dietaryTags: [${recipe.dietaryTags.join(", ")}]
`;

      if (type === "nutrition") {
        const n = recipe.nutrition;
        return (
          base +
          `  nutrition: {
    calories: ${n.calories} 
    protein: ${n.protein}g 
    carbs: ${n.carbs}g 
    fat: ${n.fat}g
    fiber: ${n.fiber}g 
    sugar: ${n.sugar}g 
    sodium: ${n.sodium}mg 
    cholesterol: ${n.cholesterol}mg
  }
    
  healthScore: ${recipe.healthScore}
`
        );
      }

      return base;
    })
    .join("\n");
}
