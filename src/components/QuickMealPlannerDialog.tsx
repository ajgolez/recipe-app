import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Badge } from './ui/badge';
import { Recipe } from '../types/recipe';
import { toast } from 'sonner';

interface QuickMealPlannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onAddToMeal: (date: Date, mealType: string, recipe: Recipe) => void;
}

const MEAL_TYPES = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { id: 'lunch', label: 'Lunch', icon: '☀️' },
  { id: 'dinner', label: 'Dinner', icon: '🌙' },
  { id: 'snacks', label: 'Snacks', icon: '🍿' }
];

export function QuickMealPlannerDialog({ isOpen, onClose, recipe, onAddToMeal }: QuickMealPlannerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<string>('');

  const handleAddToMeal = () => {
    if (!selectedDate || !selectedMealType) {
      toast.error('Please select a date and meal type');
      return;
    }

    onAddToMeal(selectedDate, selectedMealType, recipe);
    toast.success(`Added ${recipe.title} to ${selectedMealType} on ${selectedDate.toLocaleDateString()}`);
    onClose();
    
    // Reset selections
    setSelectedDate(new Date());
    setSelectedMealType('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add to Meal Plan
          </DialogTitle>
          <DialogDescription>
            Choose when you'd like to cook "{recipe.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <h4>Select Date</h4>
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-md border"
            />
          </div>

          {/* Meal Type Selection */}
          <div className="space-y-3">
            <h4>Select Meal</h4>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map((mealType) => (
                <Button
                  key={mealType.id}
                  variant={selectedMealType === mealType.id ? "default" : "outline"}
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => setSelectedMealType(mealType.id)}
                >
                  <span className="text-lg">{mealType.icon}</span>
                  <span className="text-sm">{mealType.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Recipe Preview */}
          <div className="p-3 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={recipe.image} 
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{recipe.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {recipe.cookTime}m
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {recipe.servings} servings
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddToMeal}
            disabled={!selectedDate || !selectedMealType}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add to Plan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}