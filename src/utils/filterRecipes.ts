import { Recipe } from "@/types/recipe";
import { cuisineKeywords, dietaryTagKeywords } from "./filters/keywords";

// Define the return type of the filter function
type FilterResult = {
  cuisineMatch?: string; // The cuisine matched from user input, if any
  dietaryMatches?: string[]; // All dietary tags matched from user input
  filtered: Recipe[]; // Recipes that match the filters
};

// Function to filter recipes based on a natural-language message
export function filterRecipesByMessage(
  message: string,
  recipes: Recipe[]
): FilterResult {
  const lowerMsg = message.toLowerCase(); // Normalize message to lowercase for comparison

  // Try to find the first matching cuisine from the list
  const cuisineMatch = cuisineKeywords.find((c) =>
    lowerMsg.includes(c.toLowerCase())
  );

  // Filter and return all dietary tags that are mentioned in the message
  const dietaryMatches = dietaryTagKeywords.filter((tag) =>
    lowerMsg.includes(tag.toLowerCase())
  );

  // Filter the actual recipes based on the matches above
  const filtered = recipes.filter((recipe) => {
    
    // Match cuisine only if a cuisine was detected
    const matchesCuisine = cuisineMatch
      ? recipe.cuisine.toLowerCase().includes(cuisineMatch.toLowerCase())
      : true;
    
      // Match only if ALL dietary matches are present in the recipe's tags
    const matchesDiet = dietaryMatches.every((tag) =>
      recipe.dietaryTags.some((recipeTag) =>
        recipeTag.toLowerCase().includes(tag.toLowerCase())
      )
    );
    return matchesCuisine && matchesDiet; // Return recipe if both match
  });

  // Return matched metadata and the filtered recipes
  return { cuisineMatch, dietaryMatches, filtered };
}
