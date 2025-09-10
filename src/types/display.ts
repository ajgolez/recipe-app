export type RecipeDisplayType =
  | "basic"           // title, description, cuisine, dietaryTags
  | "nutrition"       // + nutrition info for health-related prompts
  | "detailed"        // + ingredients and instructions (for cooking)
  | "summary"         // only title + dietaryTags (lightweight)
  | "full"            // all fields (kitchen sink, export, or admin view)