import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { 
  User, 
  Utensils, 
  Scale, 
  Link, 
  Shield, 
  CreditCard, 
  Bell, 
  Save,
  Check,
  X,
  Plus,
  Calendar,
  Smartphone,
  Activity,
  ShoppingCart,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  profileImage: string;
}

interface DietaryPreferences {
  dietaryRestrictions: string[];
  allergies: string[];
  preferredCuisines: string[];
  dailyCalorieGoal: number;
  macroGoals: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface MeasurementSettings {
  units: 'metric' | 'imperial';
  temperature: 'celsius' | 'fahrenheit';
}

interface IntegrationSettings {
  calendarSync: boolean;
  groceryApps: {
    instacart: boolean;
    amazonFresh: boolean;
    kroger: boolean;
  };
  fitnessTrackers: {
    fitbit: boolean;
    appleHealth: boolean;
    googleFit: boolean;
    myFitnessPal: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  shareRecipes: boolean;
  analytics: boolean;
  marketingEmails: boolean;
}

interface NotificationSettings {
  mealReminders: boolean;
  shoppingListUpdates: boolean;
  newRecipes: boolean;
  socialUpdates: boolean;
  promotions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export function ProfileSettings() {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john@example.com',
    bio: '',
    profileImage: ''
  });

  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    dietaryRestrictions: [],
    allergies: [],
    preferredCuisines: [],
    dailyCalorieGoal: 2000,
    macroGoals: {
      protein: 25,
      carbs: 50,
      fat: 25
    }
  });

  const [measurementSettings, setMeasurementSettings] = useState<MeasurementSettings>({
    units: 'metric',
    temperature: 'celsius'
  });

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>({
    calendarSync: false,
    groceryApps: {
      instacart: false,
      amazonFresh: false,
      kroger: false
    },
    fitnessTrackers: {
      fitbit: false,
      appleHealth: false,
      googleFit: false,
      myFitnessPal: false
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'private',
    shareRecipes: true,
    analytics: true,
    marketingEmails: false
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    mealReminders: true,
    shoppingListUpdates: true,
    newRecipes: false,
    socialUpdates: false,
    promotions: false,
    emailNotifications: true,
    pushNotifications: true
  });

  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('free');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Safe localStorage operations with error handling
  const safeGetFromStorage = useCallback((key: string, fallback: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (error) {
      console.error(`Failed to get ${key} from localStorage:`, error);
      return fallback;
    }
  }, []);

  const safeSetToStorage = useCallback((key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
      
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          toast.error('Storage quota exceeded. Please clear some browser data and try again.');
        } else if (error.name === 'SecurityError') {
          toast.error('Storage access denied. Please check your browser settings.');
        } else {
          toast.error('Failed to save settings. Please try again.');
        }
      }
      return false;
    }
  }, []);

  // Load settings from localStorage with error handling
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const saved = safeGetFromStorage('userSettings');
        
        if (saved) {
          // Validate and set each setting with fallbacks
          if (saved.profileData && typeof saved.profileData === 'object') {
            setProfileData(prev => ({ ...prev, ...saved.profileData }));
          }
          
          if (saved.dietaryPreferences && typeof saved.dietaryPreferences === 'object') {
            setDietaryPreferences(prev => ({ ...prev, ...saved.dietaryPreferences }));
          }
          
          if (saved.measurementSettings && typeof saved.measurementSettings === 'object') {
            setMeasurementSettings(prev => ({ ...prev, ...saved.measurementSettings }));
          }
          
          if (saved.integrationSettings && typeof saved.integrationSettings === 'object') {
            setIntegrationSettings(prev => ({ ...prev, ...saved.integrationSettings }));
          }
          
          if (saved.privacySettings && typeof saved.privacySettings === 'object') {
            setPrivacySettings(prev => ({ ...prev, ...saved.privacySettings }));
          }
          
          if (saved.notificationSettings && typeof saved.notificationSettings === 'object') {
            setNotificationSettings(prev => ({ ...prev, ...saved.notificationSettings }));
          }
          
          if (saved.subscriptionTier && ['free', 'pro', 'premium'].includes(saved.subscriptionTier)) {
            setSubscriptionTier(saved.subscriptionTier);
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setLoadError('Failed to load your settings. Using default values.');
        toast.error('Failed to load your settings. Using defaults.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [safeGetFromStorage]);

  const saveAllSettings = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate required fields
      if (!profileData.name?.trim()) {
        toast.error('Name is required');
        return;
      }

      if (!profileData.email?.trim() || !/\S+@\S+\.\S+/.test(profileData.email)) {
        toast.error('Valid email is required');
        return;
      }

      if (dietaryPreferences.dailyCalorieGoal < 500 || dietaryPreferences.dailyCalorieGoal > 5000) {
        toast.error('Daily calorie goal must be between 500 and 5000');
        return;
      }

      const allSettings = {
        profileData: {
          ...profileData,
          name: profileData.name.trim(),
          email: profileData.email.trim().toLowerCase(),
          bio: profileData.bio.trim()
        },
        dietaryPreferences,
        measurementSettings,
        integrationSettings,
        privacySettings,
        notificationSettings,
        subscriptionTier,
        lastUpdated: new Date().toISOString()
      };
      
      const success = safeSetToStorage('userSettings', allSettings);
      
      if (success) {
        setHasUnsavedChanges(false);
        toast.success('Settings saved successfully!');
      } else {
        throw new Error('Failed to save to localStorage');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError('Failed to save settings. Please try again.');
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableRestrictions = [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Low-Carb',
    'Paleo', 'Mediterranean', 'Low-Sodium', 'Sugar-Free', 'Nut-Free'
  ];

  const availableAllergies = [
    'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Fish', 
    'Shellfish', 'Sesame', 'Sulfites'
  ];

  const availableCuisines = [
    'Italian', 'Mexican', 'Asian', 'American', 'Mediterranean', 'Indian',
    'French', 'Thai', 'Chinese', 'Japanese', 'Greek', 'Middle Eastern'
  ];

  const toggleDietaryItem = (
    array: string[], 
    item: string, 
    setter: (value: DietaryPreferences) => void,
    key: keyof DietaryPreferences
  ) => {
    try {
      const newArray = array.includes(item) 
        ? array.filter(i => i !== item)
        : [...array, item];
      
      setter({
        ...dietaryPreferences,
        [key]: newArray
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error('Failed to update dietary preference:', error);
      toast.error('Failed to update preference. Please try again.');
    }
  };

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateCalorieGoal = (calories: number): boolean => {
    return calories >= 500 && calories <= 5000;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <h1>Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-3 text-muted-foreground">Loading settings...</span>
          </div>
        )}

        {loadError && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="mb-6 border-destructive/50 text-destructive">
            <Info className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {hasUnsavedChanges && !isLoading && (
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You have unsaved changes</span>
              <Button 
                size="sm" 
                onClick={saveAllSettings}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="dietary" className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">Dietary</span>
            </TabsTrigger>
            <TabsTrigger value="measurements" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Units</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Apps</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your profile details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 100) { // Limit name length
                          setProfileData(prev => ({ ...prev, name: value }));
                          setHasUnsavedChanges(true);
                        }
                      }}
                      maxLength={100}
                      className={!profileData.name.trim() ? 'border-destructive' : ''}
                    />
                    {!profileData.name.trim() && (
                      <p className="text-sm text-destructive">Name is required</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setProfileData(prev => ({ ...prev, email: value }));
                        setHasUnsavedChanges(true);
                      }}
                      className={!validateEmail(profileData.email) && profileData.email ? 'border-destructive' : ''}
                    />
                    {!validateEmail(profileData.email) && profileData.email && (
                      <p className="text-sm text-destructive">Please enter a valid email address</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => {
                      setProfileData(prev => ({ ...prev, bio: e.target.value }));
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Meal Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when it's time for meals
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.mealReminders}
                    onCheckedChange={(checked) => {
                      setNotificationSettings(prev => ({ ...prev, mealReminders: checked }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Shopping List Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications when shopping lists change
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.shoppingListUpdates}
                    onCheckedChange={(checked) => {
                      setNotificationSettings(prev => ({ ...prev, shoppingListUpdates: checked }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => {
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }));
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dietary Preferences Tab */}
          <TabsContent value="dietary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dietary Restrictions</CardTitle>
                <CardDescription>
                  Select your dietary preferences and restrictions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Dietary Restrictions</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableRestrictions.map(restriction => (
                      <Badge
                        key={restriction}
                        variant={dietaryPreferences.dietaryRestrictions.includes(restriction) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDietaryItem(
                          dietaryPreferences.dietaryRestrictions,
                          restriction,
                          setDietaryPreferences,
                          'dietaryRestrictions'
                        )}
                      >
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Allergies</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableAllergies.map(allergy => (
                      <Badge
                        key={allergy}
                        variant={dietaryPreferences.allergies.includes(allergy) ? "destructive" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDietaryItem(
                          dietaryPreferences.allergies,
                          allergy,
                          setDietaryPreferences,
                          'allergies'
                        )}
                      >
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Preferred Cuisines</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableCuisines.map(cuisine => (
                      <Badge
                        key={cuisine}
                        variant={dietaryPreferences.preferredCuisines.includes(cuisine) ? "secondary" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleDietaryItem(
                          dietaryPreferences.preferredCuisines,
                          cuisine,
                          setDietaryPreferences,
                          'preferredCuisines'
                        )}
                      >
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Daily Calorie Goal</Label>
                    <Input
                      id="calories"
                      type="number"
                      min="500"
                      max="5000"
                      value={dietaryPreferences.dailyCalorieGoal}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 2000;
                        setDietaryPreferences(prev => ({ 
                          ...prev, 
                          dailyCalorieGoal: value
                        }));
                        setHasUnsavedChanges(true);
                      }}
                      className={!validateCalorieGoal(dietaryPreferences.dailyCalorieGoal) ? 'border-destructive' : ''}
                    />
                    {!validateCalorieGoal(dietaryPreferences.dailyCalorieGoal) && (
                      <p className="text-sm text-destructive">Calorie goal must be between 500 and 5000</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measurement Settings Tab */}
          <TabsContent value="measurements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Measurement Units</CardTitle>
                <CardDescription>
                  Choose your preferred units for recipes and nutrition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Unit System</Label>
                  <RadioGroup 
                    value={measurementSettings.units} 
                    onValueChange={(value: 'metric' | 'imperial') => {
                      setMeasurementSettings(prev => ({ ...prev, units: value }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="metric" id="metric" />
                      <Label htmlFor="metric">Metric (kg, liters, cm)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="imperial" id="imperial" />
                      <Label htmlFor="imperial">Imperial (lbs, cups, inches)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Temperature</Label>
                  <RadioGroup 
                    value={measurementSettings.temperature} 
                    onValueChange={(value: 'celsius' | 'fahrenheit') => {
                      setMeasurementSettings(prev => ({ ...prev, temperature: value }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="celsius" id="celsius" />
                      <Label htmlFor="celsius">Celsius (°C)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                      <Label htmlFor="fahrenheit">Fahrenheit (°F)</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>App Integrations</CardTitle>
                <CardDescription>
                  Connect with your favorite apps and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5" />
                      <div>
                        <Label>Calendar Sync</Label>
                        <p className="text-sm text-muted-foreground">
                          Sync meal plans with your calendar
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={integrationSettings.calendarSync}
                      onCheckedChange={(checked) => {
                        setIntegrationSettings(prev => ({ ...prev, calendarSync: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <ShoppingCart className="h-5 w-5" />
                    <Label>Grocery Apps</Label>
                  </div>
                  
                  <div className="space-y-3 ml-8">
                    <div className="flex items-center justify-between">
                      <Label>Instacart</Label>
                      <Switch
                        checked={integrationSettings.groceryApps.instacart}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            groceryApps: { ...prev.groceryApps, instacart: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Amazon Fresh</Label>
                      <Switch
                        checked={integrationSettings.groceryApps.amazonFresh}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            groceryApps: { ...prev.groceryApps, amazonFresh: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Kroger</Label>
                      <Switch
                        checked={integrationSettings.groceryApps.kroger}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            groceryApps: { ...prev.groceryApps, kroger: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="h-5 w-5" />
                    <Label>Fitness Trackers</Label>
                  </div>
                  
                  <div className="space-y-3 ml-8">
                    <div className="flex items-center justify-between">
                      <Label>Fitbit</Label>
                      <Switch
                        checked={integrationSettings.fitnessTrackers.fitbit}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            fitnessTrackers: { ...prev.fitnessTrackers, fitbit: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Apple Health</Label>
                      <Switch
                        checked={integrationSettings.fitnessTrackers.appleHealth}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            fitnessTrackers: { ...prev.fitnessTrackers, appleHealth: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Google Fit</Label>
                      <Switch
                        checked={integrationSettings.fitnessTrackers.googleFit}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            fitnessTrackers: { ...prev.fitnessTrackers, googleFit: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>MyFitnessPal</Label>
                      <Switch
                        checked={integrationSettings.fitnessTrackers.myFitnessPal}
                        onCheckedChange={(checked) => {
                          setIntegrationSettings(prev => ({
                            ...prev,
                            fitnessTrackers: { ...prev.fitnessTrackers, myFitnessPal: checked }
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>
                  Manage your privacy preferences and data settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Profile Visibility</Label>
                  <RadioGroup 
                    value={privacySettings.profileVisibility} 
                    onValueChange={(value: 'public' | 'friends' | 'private') => {
                      setPrivacySettings(prev => ({ ...prev, profileVisibility: value }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id="public" />
                      <Label htmlFor="public">Public - Anyone can see your profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="friends" id="friends" />
                      <Label htmlFor="friends">Friends only - Only your connections</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id="private" />
                      <Label htmlFor="private">Private - Only you can see your profile</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share Recipes</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your custom recipes
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.shareRecipes}
                      onCheckedChange={(checked) => {
                        setPrivacySettings(prev => ({ ...prev, shareRecipes: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Usage Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help improve the app by sharing usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.analytics}
                      onCheckedChange={(checked) => {
                        setPrivacySettings(prev => ({ ...prev, analytics: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive promotional emails and updates
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.marketingEmails}
                      onCheckedChange={(checked) => {
                        setPrivacySettings(prev => ({ ...prev, marketingEmails: checked }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4>Current Plan</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {subscriptionTier} plan
                      </p>
                    </div>
                    <Badge 
                      variant={subscriptionTier === 'free' ? 'outline' : subscriptionTier === 'pro' ? 'default' : 'secondary'}
                    >
                      {subscriptionTier.toUpperCase()}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={subscriptionTier === 'free' ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <h4>Free</h4>
                          <p className="text-sm text-muted-foreground">Basic features</p>
                          <div className="space-y-1 text-sm">
                            <p>✓ Recipe browsing</p>
                            <p>✓ Basic meal planning</p>
                            <p>✓ Shopping lists</p>
                          </div>
                          <Button 
                            variant={subscriptionTier === 'free' ? 'default' : 'outline'}
                            size="sm"
                            className="w-full"
                            disabled={subscriptionTier === 'free'}
                          >
                            {subscriptionTier === 'free' ? 'Current Plan' : 'Downgrade'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={subscriptionTier === 'pro' ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <h4>Pro</h4>
                          <p className="text-sm text-muted-foreground">$9.99/month</p>
                          <div className="space-y-1 text-sm">
                            <p>✓ Everything in Free</p>
                            <p>✓ Custom recipes</p>
                            <p>✓ Advanced meal planning</p>
                            <p>✓ Nutrition tracking</p>
                          </div>
                          <Button 
                            variant={subscriptionTier === 'pro' ? 'default' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              try {
                                if (subscriptionTier !== 'pro') {
                                  setSubscriptionTier('pro');
                                  setHasUnsavedChanges(true);
                                  toast.success('Upgraded to Pro plan!');
                                }
                              } catch (error) {
                                console.error('Failed to upgrade plan:', error);
                                toast.error('Failed to upgrade plan. Please try again.');
                              }
                            }}
                          >
                            {subscriptionTier === 'pro' ? 'Current Plan' : 'Upgrade'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className={subscriptionTier === 'premium' ? 'ring-2 ring-primary' : ''}>
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <h4>Premium</h4>
                          <p className="text-sm text-muted-foreground">$19.99/month</p>
                          <div className="space-y-1 text-sm">
                            <p>✓ Everything in Pro</p>
                            <p>✓ AI meal suggestions</p>
                            <p>✓ Premium integrations</p>
                            <p>✓ Priority support</p>
                          </div>
                          <Button 
                            variant={subscriptionTier === 'premium' ? 'default' : 'outline'}
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              try {
                                if (subscriptionTier !== 'premium') {
                                  setSubscriptionTier('premium');
                                  setHasUnsavedChanges(true);
                                  toast.success('Upgraded to Premium plan!');
                                }
                              } catch (error) {
                                console.error('Failed to upgrade plan:', error);
                                toast.error('Failed to upgrade plan. Please try again.');
                              }
                            }}
                          >
                            {subscriptionTier === 'premium' ? 'Current Plan' : 'Upgrade'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {!isLoading && (
          <div className="flex justify-end">
            <Button 
              onClick={saveAllSettings} 
              disabled={!hasUnsavedChanges || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save All Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}