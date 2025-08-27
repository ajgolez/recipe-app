import { useState, useMemo } from 'react';
import { Check, ShoppingCart, X, Plus, Minus, Edit2, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ShoppingListItem, ShoppingListSection, ShoppingCategory } from '../types/mealPlan';
import { groupItemsByCategory, createCustomItem, SHOPPING_CATEGORIES } from '../utils/shoppingList';
import { toast } from 'sonner';

interface EnhancedShoppingListProps {
  items: ShoppingListItem[];
  onItemsChange: (items: ShoppingListItem[]) => void;
  onClose: () => void;
  onExport: () => void;
}

export function EnhancedShoppingList({ 
  items, 
  onItemsChange, 
  onClose, 
  onExport 
}: EnhancedShoppingListProps) {
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string>('other');
  const [newItemNotes, setNewItemNotes] = useState('');
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Group items by category
  const sections = useMemo(() => {
    const filteredItems = showCompleted ? items : items.filter(item => !item.checked);
    return groupItemsByCategory(filteredItems);
  }, [items, showCompleted]);

  const completedItems = items.filter(item => item.checked);
  const pendingItems = items.filter(item => !item.checked);
  const completionPercentage = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;

  const handleItemToggle = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    onItemsChange(updatedItems);
    
    const item = items.find(i => i.id === itemId);
    if (item) {
      toast.success(item.checked ? 'Item unmarked' : 'Item completed!', {
        description: `${item.ingredient} ${item.checked ? 'added back to' : 'removed from'} shopping list`
      });
    }
  };

  const handleQuantityChange = (itemId: string, delta: number) => {
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(0, item.quantity + delta);
        if (newQuantity === 0) {
          return null; // Will be filtered out
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as ShoppingListItem[];
    
    onItemsChange(updatedItems);
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
    toast.success('Item removed from list');
  };

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const category = SHOPPING_CATEGORIES.find(cat => cat.id === newItemCategory);
    const newItem = createCustomItem(newItemName, category);
    if (newItemNotes) {
      newItem.notes = newItemNotes;
    }

    onItemsChange([...items, newItem]);
    setNewItemName('');
    setNewItemNotes('');
    setShowAddDialog(false);
    toast.success('Custom item added to list');
  };

  const handleEditItem = (item: ShoppingListItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = items.map(item =>
      item.id === editingItem.id ? editingItem : item
    );
    onItemsChange(updatedItems);
    setEditingItem(null);
    toast.success('Item updated');
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAllCategories = () => {
    setExpandedCategories(new Set(sections.map(s => s.category.id)));
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="pb-4 shrink-0">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>{pendingItems.length} pending</span>
              <span>•</span>
              <span>{completedItems.length} completed</span>
              <span>•</span>
              <span>{completionPercentage}% done</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={expandAllCategories}>
                Expand All
              </Button>
              <Button variant="ghost" size="sm" onClick={collapseAllCategories}>
                Collapse All
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          {sections.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg mb-2">No items in your shopping list</h3>
              <p>Add items from your meal plan or create custom items</p>
              <Button 
                className="mt-4" 
                onClick={() => setShowAddDialog(true)}
              >
                Add Your First Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sections.map((section) => (
                <Collapsible
                  key={section.category.id}
                  open={expandedCategories.has(section.category.id)}
                  onOpenChange={() => toggleCategoryExpanded(section.category.id)}
                >
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{section.category.icon}</span>
                        <div>
                          <h4 className="font-medium">{section.category.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.items.filter(item => !item.checked).length} items
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {section.items.length}
                      </Badge>
                    </div>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-2 ml-4">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                            item.checked 
                              ? 'bg-muted/50 opacity-60' 
                              : 'bg-card hover:bg-accent/30'
                          }`}
                        >
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => handleItemToggle(item.id)}
                            className="shrink-0"
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                                {item.ingredient}
                              </p>
                              {item.isCustom && (
                                <Badge variant="outline" className="text-xs">
                                  Custom
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  disabled={item.checked}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium min-w-8 text-center">
                                  {item.quantity} {item.unit}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  disabled={item.checked}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              {item.recipes.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  For: {item.recipes.join(', ')}
                                </span>
                              )}
                            </div>
                            
                            {item.notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1 shrink-0">
                            {item.checked && (
                              <Check className="h-4 w-4 text-green-500" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 opacity-60 hover:opacity-100 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-card shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {completionPercentage}% complete • {pendingItems.length} items remaining
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onExport}>
                <Package className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Custom Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Item</DialogTitle>
            <DialogDescription>
              Add a custom item to your shopping list
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="e.g., 2 lbs ground beef, 1 dozen eggs"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="item-category">Category</Label>
              <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHOPPING_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="item-notes">Notes (optional)</Label>
              <Textarea
                id="item-notes"
                placeholder="Any additional notes..."
                value={newItemNotes}
                onChange={(e) => setNewItemNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomItem}>
              Add Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Item</DialogTitle>
              <DialogDescription>
                Modify the item details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={editingItem.ingredient}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    ingredient: e.target.value
                  })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      quantity: parseFloat(e.target.value) || 1
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Input
                    id="edit-unit"
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      unit: e.target.value
                    })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingItem.category.id} 
                  onValueChange={(value) => {
                    const category = SHOPPING_CATEGORIES.find(cat => cat.id === value);
                    if (category) {
                      setEditingItem({
                        ...editingItem,
                        category
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOPPING_CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    notes: e.target.value
                  })}
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}