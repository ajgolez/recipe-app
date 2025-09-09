import { Recipe } from "@/types/recipe";
import { NextApiRequest, NextApiResponse } from "next";
import { openRouter, defaultOpenRouterModel } from "@/utils/openRouterClient"; //Option to use OpenRouter
//import { openai } from "@/utils/openaiClient"; // Use OpenAI client directly
import { filterRecipesByMessage } from "@/utils/filterRecipes";

// OPTION: Initialize OpenAI with API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message } = req.body; // User's input question

  try {
    // Step 1: Fetch recipes from internal API
    const recipeRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/recipes`
    );
    const recipes = await recipeRes.json();

    // Step 2: Filter based on message (cuisine, dietary)
    // Use filtered recipes if any match, otherwise use all recipes
    // This ensures we always have something to suggest
    // Even if no match, we will still use all recipes as fallback
    // to let AI pick based on health criteria
    // This keeps user engaged instead of getting "no results"
    // which can be frustrating
    // The AI can then pick the healthiest options from all recipes
    // based on user's health goals
    // rather than strictly filtering out everything
    // which may lead to no suggestions at all
    // and a poor user experience.
    const { filtered } = filterRecipesByMessage(message, recipes);
    const recipesToSend = filtered.length > 0 ? filtered : recipes;
    console.log('recipesToSend count:', recipesToSend.length);
    // Even if the it does not send data, it should still suggest something. 
    // To keep user engaged, always give something useful buty must be explain clearly 
    // so as not to misinform.
    const noMatchReason =
      filtered.length === 0
        ? "**Note:** No exact match found based on cuisine or dietary tags. Provide fallback suggestions based on general healthiness.\n"
        : "";

    // Slim down recipe data to reduce token cost and focus on health criteria
    // const slimmedRecipes = recipes.map((r: any) => ({
    // OR

    // Step 3: Slim down recipe data
    const slimmedRecipes = recipesToSend.map((r: Recipe) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      healthScore: r.healthScore,
      nutrition: {
        sugar: r.nutrition.sugar,
        sodium: r.nutrition.sodium,
        fat: r.nutrition.fat,
        calories: r.nutrition.calories,
      },
      dietaryTags: r.dietaryTags,
      mealTypes: r.mealTypes,
    }));

    // Step 4: Format the slimmed recipes into a readable prompt for AI
    const recipeText = slimmedRecipes
      .map((r: Recipe) => {
        return `
            ID: ${r.id}
            Title: ${r.title}
            Description: ${r.description}
            Dietary Tags: ${r.dietaryTags.join(", ")}
            Health Score: ${r.healthScore}
            Meal Types: ${r.mealTypes.join(", ")}
            Sugar: ${r.nutrition.sugar}g, Sodium: ${r.nutrition.sodium}mg
            Fat: ${r.nutrition.fat}g, Calories: ${r.nutrition.calories}kcal
            `;
      })
      .join("\n");

    // Prompt GPT to select the most suitable recipes based on user's query
   const prompt = `
You are a smart recipe assistant.
${noMatchReason}
Use the following logic when evaluating recipes based on user health goals:

- Healthy: Prefer high healthScore, low sugar, sodium, and fat.
- Diabetic-friendly: Very low sugar, moderate carbs.
- Heart-healthy / low blood pressure: Low sodium and low fat.
- Weight loss: Low calories and carbs, high fiber and protein.
- High-protein diet: High protein, moderate fat, low carbs.
- Low-carb / Keto: Low carbs, moderate fat, low sugar.
- High-fiber: High fiber content, moderate calories.

Here are the available recipes:
${recipeText}

The user said: "${message}"

From the recipes above, recommend the 3 most suitable recipes from the list. Do not invent new recipes.

Return the answer strictly as a JSON array of:
[
  { "id": string, "title": string, "description": string },
  ...
]
`;

    // // Send the message to OpenAI Chat Completion API
    //  const completion = await openai.chat.completions.create({ // Use OpenAI client directly
    //  model: "gpt-3.5-turbo", // Cheapest suitable model for chat
    
    // Use OpenRouter client instead of OpenAI
    const completion = await openRouter.chat.completions.create({
    model: defaultOpenRouterModel,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful recipe assistant. Only recommend from the provided recipes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract text reply from GPT response
    const responseText = completion.choices[0].message?.content || "";

    const cleanedText = responseText
        .replace(/^```json/, '')  // remove ```json at the start
        .replace(/^```/, '')      // remove ``` if GPT omits the "json" tag
        .replace(/```$/, '')      // remove closing ```
        .trim();

    // Parse GPT response into usable JSON array
    const parsed = JSON.parse(cleanedText);

    res.status(200).json({ recipes: parsed });
  } catch (error: any) {
    // Error handling with helpful logs
    console.error("Chat API error:", error);
    res.status(500).json({ error: "AI chat failed", detail: error.message });
  }
}
