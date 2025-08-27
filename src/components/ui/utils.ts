// Import `clsx` to conditionally join class names (like classnames library)
import { clsx, type ClassValue } from "clsx";
// Import `twMerge` to intelligently merge conflicting Tailwind classes (e.g., 'p-2' and 'p-4')
import { twMerge } from "tailwind-merge";

// Utility function `cn` combines and merges class names
export function cn(...inputs: ClassValue[]) {
  // First, `clsx(inputs)` joins all class strings/conditions into a single string
  // Then, `twMerge(...)` ensures conflicting Tailwind classes are resolved (e.g., "px-2 px-4" → "px-4")
  return twMerge(clsx(inputs));
}
