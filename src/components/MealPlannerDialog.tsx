import { useState } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Recipe } from '../types/recipe';
import { getWeekDates, formatDate, isToday } from '../utils/shoppingList';

interface MealPlannerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  onAddToMeal: (date: Date, mealType: string, recipe: Recipe) => void;
}

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: '🌅', description: 'Start your day right' },
  { id: 'lunch', label: 'Lunch', icon: '☀️', description: 'Midday fuel' },
  { id: 'dinner', label: 'Dinner', icon: '🌙', description: 'Evening meal' },
  { id: 'snacks', label: 'Snacks', icon: '🍎', description: 'Between meals' }
];

export function MealPlannerDialog({ isOpen, onClose, recipe, onAddToMeal }: MealPlannerDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToMeal = async () => {
    if (!selectedMealType) return;

    setIsAdding(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onAddToMeal(selectedDate, selectedMealType, recipe);
    setIsAdded(true);
    setIsAdding(false);

    // Auto close after success
    setTimeout(() => {
      setIsAdded(false);
      setSelectedMealType('');
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    if (!isAdding) {
      setIsAdded(false);
      setSelectedMealType('');
      onClose();
    }
  };

  const weekDates = getWeekDates(selectedDate);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add to Meal Plan
          </DialogTitle>
          <DialogDescription>
            Select a day and meal slot to add this recipe to your meal plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Recipe Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{recipe.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{recipe.cookTime} min</span>
                    <span>•</span>
                    <span>{recipe.nutrition.calories} cal</span>
                    <span>•</span>
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
                <Badge variant="outline">{recipe.cuisine}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Select Day</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date) => {
                const isSelected = selectedDate.toDateString() === date.toDateString();
                const isTodayDate = isToday(date);
                
                return (
                  <Button
                    key={date.toISOString()}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col py-3 h-auto ${
                      isTodayDate && !isSelected ? 'border-primary' : ''
                    }`}
                  >
                    <span className="text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="font-medium">
                      {date.getDate()}
                    </span>
                    {isTodayDate && (
                      <span className="text-xs text-primary">Today</span>
                    )}
                  </Button>
                );
              })}
            </div>
            
            {/* Show selected date */}
            <div className="text-center text-sm text-muted-foreground">
              Selected: {formatDate(selectedDate, 'long')}
            </div>
          </div>

          {/* Meal Type Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Select Meal</h3>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map((mealType) => {
                const isSelected = selectedMealType === mealType.id;
                
                return (
                  <Card
                    key={mealType.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedMealType(mealType.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mealType.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium">{mealType.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {mealType.description}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose} disabled={isAdding}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddToMeal}
              disabled={!selectedMealType || isAdding}
              className="flex-1"
            >
              {isAdding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding to Plan...
                </div>
              ) : isAdded ? (
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Added to Plan!
                </div>
              ) : (
                `Add to ${selectedMealType ? mealTypes.find(m => m.id === selectedMealType)?.label : 'Meal Plan'}`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}