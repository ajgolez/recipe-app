import { useState } from 'react';
import { Download, Share, FileText, Mail, Smartphone, CheckSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { ShoppingListItem } from '../types/mealPlan';

interface ShoppingListExportProps {
  items: ShoppingListItem[];
  isOpen: boolean;
  onClose: () => void;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  popular?: boolean;
}

const exportOptions: ExportOption[] = [
  {
    id: 'pdf',
    name: 'PDF Document',
    description: 'Download a formatted PDF shopping list',
    icon: <FileText className="h-5 w-5" />,
    format: 'PDF'
  },
  {
    id: 'text',
    name: 'Text File',
    description: 'Simple text file for easy editing',
    icon: <FileText className="h-5 w-5" />,
    format: 'TXT'
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Send list to your email',
    icon: <Mail className="h-5 w-5" />,
    format: 'EMAIL'
  },
  {
    id: 'instacart',
    name: 'Instacart',
    description: 'Export to Instacart for delivery',
    icon: <Smartphone className="h-5 w-5" />,
    format: 'API',
    popular: true
  },
  {
    id: 'walmart',
    name: 'Walmart Grocery',
    description: 'Add items to Walmart cart',
    icon: <Smartphone className="h-5 w-5" />,
    format: 'API',
    popular: true
  },
  {
    id: 'amazon',
    name: 'Amazon Fresh',
    description: 'Export to Amazon Fresh',
    icon: <Smartphone className="h-5 w-5" />,
    format: 'API'
  },
  {
    id: 'anylist',
    name: 'AnyList',
    description: 'Popular grocery list app',
    icon: <CheckSquare className="h-5 w-5" />,
    format: 'API'
  },
  {
    id: 'todoist',
    name: 'Todoist',
    description: 'Add as tasks in Todoist',
    icon: <CheckSquare className="h-5 w-5" />,
    format: 'API'
  }
];

export function ShoppingListExport({ items, isOpen, onClose }: ShoppingListExportProps) {
  const [selectedExport, setSelectedExport] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  const generatePDF = () => {
    // In a real app, you'd use a library like jsPDF
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'application/pdf' });
    downloadFile(blob, 'shopping-list.pdf');
  };

  const generateTextFile = () => {
    const content = generateTextContent();
    const blob = new Blob([content], { type: 'text/plain' });
    downloadFile(blob, 'shopping-list.txt');
  };

  const generateTextContent = () => {
    const pendingItems = items.filter(item => !item.checked);
    const completedItems = items.filter(item => item.checked);
    
    // Group items by category
    const categoriesMap = new Map<string, typeof pendingItems>();
    pendingItems.forEach(item => {
      const categoryId = item.category?.id || 'other';
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, []);
      }
      categoriesMap.get(categoryId)!.push(item);
    });
    
    const sections = Array.from(categoriesMap.entries()).map(([categoryId, items]) => ({
      category: items[0]?.category || { id: 'other', name: 'Other', icon: '🛒', order: 9 },
      items
    })).sort((a, b) => a.category.order - b.category.order);
    
    let content = 'SHOPPING LIST\n';
    content += `Generated on ${new Date().toLocaleDateString()}\n`;
    content += `${pendingItems.length} items to buy • ${completedItems.length} completed\n\n`;
    
    if (sections.length > 0) {
      content += 'ITEMS TO BUY (by category):\n';
      content += '═══════════════════════════════════════════════════════════════\n\n';
      
      sections.forEach((section, sectionIndex) => {
        content += `${section.category.icon} ${section.category.name.toUpperCase()}\n`;
        content += '─'.repeat(section.category.name.length + 2) + '\n';
        
        section.items.forEach((item, index) => {
          content += `  ${index + 1}. ${item.quantity} ${item.unit} ${item.ingredient}`;
          if (item.notes) {
            content += ` (${item.notes})`;
          }
          content += '\n';
          
          if (item.recipes.length > 0) {
            content += `     For: ${item.recipes.join(', ')}\n`;
          }
        });
        
        if (sectionIndex < sections.length - 1) {
          content += '\n';
        }
      });
    }

    if (completedItems.length > 0) {
      content += '\n\nCOMPLETED ITEMS:\n';
      content += '═══════════════════════════════════════════════════════════════\n';
      completedItems.forEach((item, index) => {
        content += `  ✓ ${item.quantity} ${item.unit} ${item.ingredient}\n`;
      });
    }

    content += `\n\n📊 SUMMARY:\n`;
    content += `Total Items: ${items.length}\n`;
    content += `Remaining: ${pendingItems.length}\n`;
    content += `Completed: ${completedItems.length}\n`;
    content += `Progress: ${Math.round((completedItems.length / items.length) * 100) || 0}%`;

    return content;
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sendEmail = () => {
    const subject = encodeURIComponent('My Shopping List');
    const body = encodeURIComponent(generateTextContent());
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

  const exportToGroceryApp = (appId: string) => {
    // In a real app, these would be actual API integrations
    const integrations = {
      instacart: () => {
        // Simulate API call to Instacart
        toast.success('Items added to Instacart! Opening app...', {
          description: 'Your shopping list has been exported to Instacart.'
        });
        // In reality: window.open('https://www.instacart.com/...')
      },
      walmart: () => {
        toast.success('Items added to Walmart Grocery!', {
          description: 'Check your Walmart Grocery app for the items.'
        });
      },
      amazon: () => {
        toast.success('Items added to Amazon Fresh!', {
          description: 'Your list is ready in Amazon Fresh.'
        });
      },
      anylist: () => {
        toast.success('Exported to AnyList!', {
          description: 'Open AnyList to view your shopping list.'
        });
      },
      todoist: () => {
        toast.success('Tasks created in Todoist!', {
          description: 'Each item has been added as a task in Todoist.'
        });
      }
    };

    const integration = integrations[appId as keyof typeof integrations];
    if (integration) {
      integration();
    } else {
      toast.error('Export not available', {
        description: 'This integration is coming soon!'
      });
    }
  };

  const handleExport = async (optionId: string) => {
    setIsExporting(true);
    setSelectedExport(optionId);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      switch (optionId) {
        case 'pdf':
          generatePDF();
          toast.success('PDF downloaded successfully!');
          break;
        case 'text':
          generateTextFile();
          toast.success('Text file downloaded successfully!');
          break;
        case 'email':
          sendEmail();
          toast.success('Email client opened!');
          break;
        default:
          exportToGroceryApp(optionId);
          break;
      }
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again or choose a different format.'
      });
    } finally {
      setIsExporting(false);
      setSelectedExport('');
    }
  };

  const pendingItemsCount = items.filter(item => !item.checked).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Export Shopping List
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to export your shopping list. {pendingItemsCount} items to buy • {items.length - pendingItemsCount} completed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Popular Options */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="secondary">Popular</Badge>
              Grocery Apps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportOptions.filter(option => option.popular).map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedExport === option.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleExport(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium">{option.name}</h5>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {isExporting && selectedExport === option.id ? (
                        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Standard Export Options */}
          <div>
            <h4 className="font-medium mb-3">Standard Formats</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {exportOptions.filter(option => !option.popular).slice(0, 3).map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedExport === option.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleExport(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <span className="font-medium">{option.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {option.format}
                        </Badge>
                        {isExporting && selectedExport === option.id ? (
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Apps */}
          <div>
            <h4 className="font-medium mb-3">Other Apps</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exportOptions.filter(option => !option.popular).slice(3).map((option) => (
                <Card
                  key={option.id}
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    selectedExport === option.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleExport(option.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{option.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{option.description}</p>
                      </div>
                      {isExporting && selectedExport === option.id ? (
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                More integrations coming soon! Request your favorite grocery app.
              </p>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}