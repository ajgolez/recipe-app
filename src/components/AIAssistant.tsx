import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Mic, MicOff, Send, Bot, User, Heart, Activity, Utensils, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { RecipeCard } from './RecipeCard';
import { recipes } from '../data/recipes';
import type { Recipe } from '../types/recipe';
import { useHealthAnalysis, HealthAnalyzer } from '../utils/healthAnalysis';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  healthConditions?: string[];
  recommendations?: Recipe[];
}

interface HealthCondition {
  name: string;
  restrictions: string[];
  recommendations: string[];
  icon: React.ReactNode;
}

interface AIAssistantProps {
  userPreferences?: any;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function AIAssistant({ userPreferences, onRecipeSelect }: AIAssistantProps) {
  const { parseConditions, rankRecipes, getAdvice, getConditionInfo } = useHealthAnalysis();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI recipe assistant. Tell me what you'd like for dinner and any health conditions I should consider. For example: 'I want something high in protein but I have high blood pressure and need to lose weight.'",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const healthConditions: Record<string, HealthCondition> = {
    'high blood pressure': {
      name: 'High Blood Pressure',
      restrictions: ['high sodium', 'excessive salt', 'processed foods'],
      recommendations: ['low sodium', 'potassium-rich', 'whole grains', 'lean proteins'],
      icon: <Heart className="h-4 w-4 text-red-500" />
    },
    'uric acid': {
      name: 'High Uric Acid',
      restrictions: ['high purine', 'organ meats', 'shellfish', 'anchovies', 'beer'],
      recommendations: ['low purine', 'plenty of water', 'dairy', 'whole grains'],
      icon: <Activity className="h-4 w-4 text-orange-500" />
    },
    'weight loss': {
      name: 'Weight Loss',
      restrictions: ['high calorie', 'fried foods', 'sugary foods'],
      recommendations: ['low calorie', 'high fiber', 'lean proteins', 'vegetables'],
      icon: <Utensils className="h-4 w-4 text-green-500" />
    },
    'diabetes': {
      name: 'Diabetes',
      restrictions: ['high sugar', 'refined carbs', 'sweetened drinks'],
      recommendations: ['low glycemic', 'complex carbs', 'fiber-rich', 'lean proteins'],
      icon: <AlertTriangle className="h-4 w-4 text-blue-500" />
    },
    'high cholesterol': {
      name: 'High Cholesterol',
      restrictions: ['saturated fat', 'trans fat', 'high cholesterol foods'],
      recommendations: ['lean proteins', 'omega-3', 'fiber-rich', 'plant-based'],
      icon: <Heart className="h-4 w-4 text-purple-500" />
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice input failed. Please try typing instead.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
        toast.success('Listening... Speak now!');
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
        toast.error('Voice input not available. Please type your message.');
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Use the improved health analysis system
  const parseHealthConditions = (text: string): string[] => {
    return parseConditions(text);
  };

  const parseNutritionalPreferences = (text: string) => {
    const preferences = {
      protein: false,
      lowCarb: false,
      lowFat: false,
      highFiber: false,
      vegetarian: false,
      vegan: false
    };

    const lowerText = text.toLowerCase();

    if (lowerText.includes('high protein') || lowerText.includes('protein')) {
      preferences.protein = true;
    }
    if (lowerText.includes('low carb') || lowerText.includes('keto')) {
      preferences.lowCarb = true;
    }
    if (lowerText.includes('low fat')) {
      preferences.lowFat = true;
    }
    if (lowerText.includes('high fiber') || lowerText.includes('fiber')) {
      preferences.highFiber = true;
    }
    if (lowerText.includes('vegetarian')) {
      preferences.vegetarian = true;
    }
    if (lowerText.includes('vegan')) {
      preferences.vegan = true;
    }

    return preferences;
  };

  const filterRecipesByHealthConditions = (recipes: Recipe[], conditions: string[], preferences: any): Recipe[] => {
    // Use the health analyzer to rank recipes and filter top ones
    const rankedRecipes = rankRecipes(recipes, conditions);
    
    // Filter based on health score (keep recipes with score > 40)
    let filtered = rankedRecipes.filter(recipe => recipe.healthScore.overall > 40);

    // Apply nutritional preferences
    if (preferences.protein) {
      filtered = filtered.filter(recipe => 
        recipe.tags?.some((tag: string) => 
          ['high-protein', 'protein', 'chicken', 'fish', 'beans', 'eggs'].includes(tag.toLowerCase())
        ) || recipe.dietaryTags?.some((tag: string) => 
          ['high-protein', 'protein'].includes(tag.toLowerCase())
        )
      );
    }

    if (preferences.lowCarb) {
      filtered = filtered.filter(recipe => 
        recipe.tags?.some((tag: string) => 
          ['low-carb', 'keto', 'cauliflower', 'zucchini'].includes(tag.toLowerCase())
        ) || recipe.dietaryTags?.some((tag: string) => 
          ['keto', 'low-carb'].includes(tag.toLowerCase())
        )
      );
    }

    if (preferences.vegetarian) {
      filtered = filtered.filter(recipe => 
        recipe.tags?.includes('vegetarian') || 
        recipe.dietaryTags?.includes('Vegetarian') || 
        !recipe.description.toLowerCase().includes('meat')
      );
    }

    if (preferences.vegan) {
      filtered = filtered.filter(recipe => 
        recipe.tags?.includes('vegan') || 
        recipe.dietaryTags?.includes('Vegan')
      );
    }

    return filtered;
  };

  const generateResponse = (userMessage: string, detectedConditions: string[], nutritionalPrefs: any): string => {
    const conditionNames = detectedConditions.map(c => getConditionInfo(c)?.name || c);
    const healthAdvice = getAdvice(detectedConditions);
    
    let response = "Based on your requirements";
    
    if (detectedConditions.length > 0) {
      response += ` and health considerations (${conditionNames.join(', ')})`;
    }
    
    response += ", I've analyzed the recipes and found the best matches for you! ";

    if (nutritionalPrefs.protein) {
      response += "I've prioritized high-protein options. ";
    }
    
    // Add specific health advice
    if (healthAdvice.length > 0) {
      response += `Health tip: ${healthAdvice[0]} `;
    }
    
    response += "Here are my top health-conscious recommendations, ranked by how well they match your needs:";
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Parse user input
      const detectedConditions = parseHealthConditions(userMessage);
      const nutritionalPrefs = parseNutritionalPreferences(userMessage);

      // Filter recipes based on conditions and preferences
      const filteredRecipes = filterRecipesByHealthConditions(recipes, detectedConditions, nutritionalPrefs);
      
      // Get top 3 recommendations
      const recommendations = filteredRecipes.slice(0, 3);

      // Generate response
      const responseText = generateResponse(userMessage, detectedConditions, nutritionalPrefs);

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseText,
        timestamp: new Date(),
        healthConditions: detectedConditions,
        recommendations
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
      }, 1000);

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I had trouble processing your request. Could you please try rephrasing it?",
        timestamp: new Date()
      }]);
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col" data-annotation="ai-assistant">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2>AI Recipe Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Tell me what you want to eat and your health considerations
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              <div className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type === 'assistant' && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : ''}`}>
                  <Card className={`${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <CardContent className="p-3">
                      <p className="text-sm">{message.content}</p>
                    </CardContent>
                  </Card>
                  
                  {/* Health Conditions Detected */}
                  {message.healthConditions && message.healthConditions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1" data-annotation="health-analysis">
                      {message.healthConditions.map(condition => {
                        const conditionInfo = getConditionInfo(condition);
                        const legacyInfo = healthConditions[condition];
                        return (
                          <Badge key={condition} variant="secondary" className="text-xs">
                            {legacyInfo?.icon}
                            <span className="ml-1">{conditionInfo?.name || legacyInfo?.name || condition}</span>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1 order-1">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Recipe Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="ml-11 space-y-3">
                  <div className="grid gap-3">
                    {message.recommendations.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isSaved={false}
                        onToggleSave={() => {}}
                        onView={() => onRecipeSelect?.(recipe)}
                        showHealthTags={true}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <Card className="bg-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span className="text-sm text-muted-foreground">Analyzing your preferences...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what you want for dinner and any health conditions..."
              disabled={isProcessing}
              className="pr-12"
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!input.trim() || isProcessing}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 space-y-1">
          {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
            <p className="text-xs text-muted-foreground">
              Voice input not supported in this browser
            </p>
          )}
          
          {/* Example queries */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-muted-foreground">Try:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setInput("I want something high in protein but consider my high blood pressure and weight loss goals")}
              >
                "High protein for blood pressure & weight loss"
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setInput("I have diabetes and want a low-carb dinner")}
              >
                "Low-carb for diabetes"
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}