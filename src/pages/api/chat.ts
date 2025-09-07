import { Recipe } from "@/types/recipe";
import { NextApiRequest, NextApiResponse } from "next";
import { openRouter, defaultOpenRouterModel } from "@/utils/openRouterClient";

// OPTION: Initialize OpenAI with API key
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { message } = req.body; // 🟡 User's input question

  try {
    // Fetch recipes from your internal API
    const recipeRes = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/recipes`
    );
    const recipes = await recipeRes.json();

    // Slim down recipe data to reduce token cost and focus on health criteria
    const slimmedRecipes = recipes.map((r: any) => ({
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

    // Format the slimmed recipes into a readable prompt
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

    // Send the message to OpenAI Chat Completion API
    // const completion = await openai.chat.completions.create({
    // model: "gpt-3.5-turbo", // Cheapest suitable model for chat
    
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
