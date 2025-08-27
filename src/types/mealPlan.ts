import { Recipe } from './recipe';

export interface MealSlot {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  recipes: Recipe[];
}

export interface DayPlan {
  date: string; // ISO date string
  meals: MealSlot[];
}

export interface WeekPlan {
  startDate: string; // ISO date string for start of week
  days: DayPlan[];
}

export interface ShoppingListItem {
  id: string;
  ingredient: string;
  amount: string;
  unit: string;
  quantity: number;
  category: ShoppingCategory;
  recipes: string[]; // Recipe names that need this ingredient
  checked: boolean;
  isCustom?: boolean; // User-added items
  fromMealPlan?: boolean; // Generated from meal planner
  notes?: string;
}

export interface ShoppingCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface ShoppingListSection {
  category: ShoppingCategory;
  items: ShoppingListItem[];
}

export interface ShoppingListState {
  items: ShoppingListItem[];
  lastUpdated: Date;
  totalItems: number;
  completedItems: number;
}

export type ViewMode = 'day' | 'week';