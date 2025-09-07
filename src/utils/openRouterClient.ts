import OpenAI from 'openai';

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error("Missing OPENROUTER_API_KEY in environment variables");
}

if (!process.env.OPENROUTER_APP_DOMAIN) {
  throw new Error("Missing OPENROUTER_APP_DOMAIN in environment variables");
}

// Optional: fallback model
const model = process.env.OPENROUTER_MODEL || "mistralai/mixtral-8x7b";

export const openRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // Required for OpenRouter
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENROUTER_APP_DOMAIN,
    "X-Title": "AI Recipe App", // Optional: helps with tracking your app on OpenRouter
  },
});

export const defaultOpenRouterModel = model;