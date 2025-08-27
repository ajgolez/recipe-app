import { useState, useEffect } from 'react';
import { Check, ShoppingCart, X, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ShoppingListItem } from '../types/mealPlan';

interface ShoppingListProps {
  items?: ShoppingListItem[];
  onItemToggle?: (index: number) => void;
  onClose?: () => void;
}

export function ShoppingList({ items: propItems, onItemToggle: propOnItemToggle, onClose }: ShoppingListProps) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [localItems, setLocalItems] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // Use prop items if provided, otherwise use local state
  const items = propItems || localItems;
  const onItemToggle = propOnItemToggle || ((index: number) => {
    const updatedItems = localItems.map((item, i) => 
      i === index ? { ...item, checked: !item.checked } : item
    );
    setLocalItems(updatedItems);
    
    // Immediately save to localStorage
    try {
      localStorage.setItem('shoppingList', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to save shopping list changes:', error);
    }
  });

  // Load shopping list from localStorage on mount
  useEffect(() => {
    if (!propItems) {
      try {
        const savedList = localStorage.getItem('shoppingList');
        if (savedList) {
          const parsedItems = JSON.parse(savedList);
          // Ensure we have valid shopping list items
          const validItems = parsedItems.filter((item: any) => 
            item && typeof item === 'object' && item.ingredient && item.category
          );
          setLocalItems(validItems);
        }
      } catch (error) {
        console.error('Failed to load shopping list:', error);
        setLocalItems([]);
      }
    }
  }, [propItems]);

  // Save to localStorage when items change (only for local items)
  useEffect(() => {
    if (!propItems && localItems.length >= 0) {
      localStorage.setItem('shoppingList', JSON.stringify(localItems));
    }
  }, [localItems, propItems]);

  const completedItems = items.filter(item => item.checked);
  const pendingItems = items.filter(item => !item.checked);

  const displayItems = showCompleted ? items : pendingItems;

  const addNewItem = () => {
    if (newItemName.trim()) {
      const newItem: ShoppingListItem = {
        id: `item-${Date.now()}`,
        ingredient: newItemName.trim(),
        amount: '1',
        unit: 'item',
        quantity: 1,
        category: {
          id: 'other',
          name: 'Other',
          icon: '📦',
          order: 99
        },
        recipes: [],
        checked: false,
        isCustom: true
      };
      
      setLocalItems(prev => [...prev, newItem]);
      setNewItemName('');
    }
  };

  const removeItem = (index: number) => {
    setLocalItems(prev => prev.filter((_, i) => i !== index));
  };

  const clearCompleted = () => {
    setLocalItems(prev => prev.filter(item => !item.checked));
  };

  return (
    <div className={onClose ? "fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" : "py-6"}>
      <Card 
        className={onClose ? "w-full max-w-2xl max-h-[80vh] overflow-hidden" : "w-full"}
        data-annotation="shopping-list"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping List
              <Badge variant="secondary">
                {pendingItems.length} items
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
              >
                {showCompleted ? 'Hide' : 'Show'} Completed
              </Button>
              {completedItems.length > 0 && !propItems && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCompleted}
                >
                  Clear Completed
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{pendingItems.length} pending</span>
            <span>•</span>
            <span>{completedItems.length} completed</span>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto">
          {/* Add New Item */}
          {!propItems && (
            <div className="mb-6 p-4 border rounded-lg bg-muted/30">
              <div className="flex gap-2">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Add new item..."
                  onKeyPress={(e) => e.key === 'Enter' && addNewItem()}
                  className="flex-1"
                />
                <Button onClick={addNewItem} disabled={!newItemName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {displayItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in your shopping list</p>
              {!propItems && (
                <p className="text-sm mt-2">Add items above or generate from your meal plans</p>
              )}
            </div>
          ) : (
            <div className="space-y-3" data-annotation="shopping-categories">
              {displayItems.map((item, index) => {
                const originalIndex = items.findIndex(i => i === item);
                return (
                  <div
                    key={originalIndex}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      item.checked 
                        ? 'bg-muted/50 opacity-60' 
                        : 'bg-card hover:bg-accent/30'
                    }`}
                  >
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => onItemToggle(originalIndex)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                        {item.ingredient}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
{item.recipes && item.recipes.length > 0 
                            ? `For: ${item.recipes.join(', ')}` 
                            : item.fromMealPlan 
                              ? 'From meal plan'
                              : 'Custom item'
                          }
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {item.checked && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {item.isCustom && !propItems && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(originalIndex);
                          }}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>

        {(onClose || items.length > 0) && (
          <div className="p-4 border-t bg-card">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {items.length > 0 ? `${Math.round((completedItems.length / items.length) * 100)}% complete` : 'Start adding items'}
              </div>
              <div className="flex gap-2">
                {onClose && (
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                )}
                {items.length > 0 && (
                  <Button disabled data-annotation="shopping-export">
                    Share List
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}