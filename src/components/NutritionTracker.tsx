import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
//import { Recipe, NutritionInfo } from '../types/recipe';
import { DayPlan } from '../types/mealPlan';

interface NutritionTrackerProps {
  mealPlans: Map<string, DayPlan>;
  userGoals?: {
    dailyCalories?: number;
    proteinGoal?: number;
    carbGoal?: number;
    fatGoal?: number;
    fiberGoal?: number;
  };
  selectedDate?: Date;
}

interface NutritionSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    calcium: number;
    iron: number;
  };
}

interface MacroBreakdown {
  name: string;
  value: number;
  color: string;
}

const DAILY_RECOMMENDED = {
  calories: 2000,
  protein: 50, // grams
  carbs: 300, // grams
  fat: 65, // grams
  fiber: 25, // grams
  sodium: 2300, // mg
  vitaminA: 100, // % daily value
  vitaminC: 100, // % daily value
  calcium: 100, // % daily value
  iron: 100 // % daily value
};

const MACRO_COLORS = {
  protein: '#8884d8',
  carbs: '#82ca9d',
  fat: '#ffc658'
};

export function NutritionTracker({ mealPlans, userGoals, selectedDate }: NutritionTrackerProps) {
  // Calculate nutrition for selected day or current day
  const currentDate = selectedDate || new Date();
  const dateKey = currentDate.toISOString().split('T')[0];
  const todaysPlan = mealPlans.get(dateKey);

  // Calculate weekly nutrition data
  const weeklyData = useMemo(() => {
    const weekDates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }

    return weekDates.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const dayPlan = mealPlans.get(dateKey);
      const nutrition = calculateDayNutrition(dayPlan);
      
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        fiber: nutrition.fiber
      };
    });
  }, [mealPlans, currentDate]);

  // Calculate nutrition for a single day
  function calculateDayNutrition(dayPlan?: DayPlan): NutritionSummary {
    if (!dayPlan) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        vitamins: { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 }
      };
    }

    const allRecipes = dayPlan.meals.flatMap(meal => meal.recipes);
    
    return allRecipes.reduce((total, recipe) => ({
      calories: total.calories + recipe.nutrition.calories,
      protein: total.protein + recipe.nutrition.protein,
      carbs: total.carbs + recipe.nutrition.carbs,
      fat: total.fat + recipe.nutrition.fat,
      fiber: total.fiber + recipe.nutrition.fiber,
      sugar: total.sugar + recipe.nutrition.sugar,
      sodium: total.sodium + recipe.nutrition.sodium,
      vitamins: {
        vitaminA: total.vitamins.vitaminA + recipe.nutrition.vitaminA,
        vitaminC: total.vitamins.vitaminC + recipe.nutrition.vitaminC,
        calcium: total.vitamins.calcium + recipe.nutrition.calcium,
        iron: total.vitamins.iron + recipe.nutrition.iron
      }
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      vitamins: { vitaminA: 0, vitaminC: 0, calcium: 0, iron: 0 }
    });
  }

  const todaysNutrition = calculateDayNutrition(todaysPlan);
  const goals = { ...DAILY_RECOMMENDED, ...userGoals };

  // Calculate macro breakdown for pie chart
  const macroBreakdown: MacroBreakdown[] = [
    { name: 'Protein', value: todaysNutrition.protein * 4, color: MACRO_COLORS.protein },
    { name: 'Carbs', value: todaysNutrition.carbs * 4, color: MACRO_COLORS.carbs },
    { name: 'Fat', value: todaysNutrition.fat * 9, color: MACRO_COLORS.fat }
  ];

  // Calculate nutrition score
  const nutritionScore = useMemo(() => {
    const scores = [
      Math.min(100, (todaysNutrition.calories / goals.dailyCalories!) * 100),
      Math.min(100, (todaysNutrition.protein / goals.proteinGoal!) * 100),
      Math.min(100, (todaysNutrition.fiber / goals.fiberGoal!) * 100),
      Math.min(100, (todaysNutrition.vitamins.vitaminC / 100) * 100)
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [todaysNutrition, goals]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3>Nutrition Tracking</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(currentDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-yellow-500" />
          <Badge variant={nutritionScore >= 80 ? "default" : nutritionScore >= 60 ? "secondary" : "destructive"}>
            Score: {nutritionScore}%
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Overview</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Trends</TabsTrigger>
          <TabsTrigger value="vitamins">Vitamins & Minerals</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          {/* Calorie and Macro Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Calories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{todaysNutrition.calories}</span>
                    <span className="text-sm text-muted-foreground">/ {goals.dailyCalories}</span>
                  </div>
                  <Progress 
                    value={(todaysNutrition.calories / goals.dailyCalories!) * 100} 
                    className="h-2" 
                  />
                  <p className="text-xs text-muted-foreground">
                    {Math.round(((todaysNutrition.calories / goals.dailyCalories!) * 100))}% of goal
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Protein</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{Math.round(todaysNutrition.protein)}g</span>
                    <span className="text-sm text-muted-foreground">/ {goals.proteinGoal}g</span>
                  </div>
                  <Progress 
                    value={(todaysNutrition.protein / goals.proteinGoal!) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Carbs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{Math.round(todaysNutrition.carbs)}g</span>
                    <span className="text-sm text-muted-foreground">/ {goals.carbGoal}g</span>
                  </div>
                  <Progress 
                    value={(todaysNutrition.carbs / goals.carbGoal!) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Fiber</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{Math.round(todaysNutrition.fiber)}g</span>
                    <span className="text-sm text-muted-foreground">/ {goals.fiberGoal}g</span>
                  </div>
                  <Progress 
                    value={(todaysNutrition.fiber / goals.fiberGoal!) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Macro Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Macronutrient Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {macroBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} cal`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Nutritional Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Daily Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysNutrition.calories < goals.dailyCalories! * 0.8 && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">You're below your calorie goal. Consider adding a healthy snack.</span>
                  </div>
                )}
                
                {todaysNutrition.protein < goals.proteinGoal! * 0.8 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Low protein intake. Add lean meats, fish, or plant-based proteins.</span>
                  </div>
                )}
                
                {todaysNutrition.fiber >= goals.fiberGoal! && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Great job meeting your fiber goal! Your digestive health will thank you.</span>
                  </div>
                )}
                
                {todaysNutrition.sodium > goals.sodium * 0.8 && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">High sodium intake detected. Consider reducing processed foods.</span>
                  </div>
                )}

                {nutritionScore >= 90 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Excellent nutritional balance today! Keep up the great work.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Nutrition Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? Math.round(value) : value, 
                        name
                      ]}
                      labelFormatter={(label, payload) => 
                        payload?.[0]?.payload?.date || label
                      }
                    />
                    <Bar dataKey="calories" fill="#8884d8" />
                    <Bar dataKey="protein" fill="#82ca9d" />
                    <Bar dataKey="fiber" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitamins" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Vitamin A', value: todaysNutrition.vitamins.vitaminA, unit: '% DV' },
              { name: 'Vitamin C', value: todaysNutrition.vitamins.vitaminC, unit: '% DV' },
              { name: 'Calcium', value: todaysNutrition.vitamins.calcium, unit: '% DV' },
              { name: 'Iron', value: todaysNutrition.vitamins.iron, unit: '% DV' }
            ].map((vitamin) => (
              <Card key={vitamin.name}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{vitamin.name}</span>
                      <span className="text-sm">{Math.round(vitamin.value)}{vitamin.unit}</span>
                    </div>
                    <Progress value={Math.min(100, vitamin.value)} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {vitamin.value >= 100 ? 'Goal exceeded!' : 
                       vitamin.value >= 80 ? 'Nearly there' : 
                       'Needs improvement'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}