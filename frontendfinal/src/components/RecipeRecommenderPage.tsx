import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { 
  Sparkles, ChefHat, Leaf, Apple, Wheat, Fish, Milk, Egg, Flame, 
  Plus, X, ArrowRight, Clock, Star, AlertCircle, CheckCircle, 
  XCircle, ShoppingCart, Utensils, Users, Timer, Check, X as XIcon
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface IngredientCategory {
  name: string;
  icon: any;
  color: string;
  items: string[];
}

interface RecipeRecommendation {
  id: number;
  name: string;
  image: string;
  time: string;
  rating: number;
  difficulty: string;
  cuisine: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  match_percentage: number;
  has_substitutions?: boolean;
  missing_ingredients?: string[];
  substitutes?: any;
  ingredients_you_have?: string[];
  can_make_with_substitutes?: boolean;
  can_make?: boolean;
  usability_score?: number;
}

// New interfaces for detailed views
interface RecipeDetail {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  difficulty: string;
  cooking_time: number;
  ingredients: string[];
  structured_ingredients: Array<{
    name: string;
    quantity: number | null;
    unit: string | null;
  }>;
  instructions: string[];
  image_url: string;
  meal_type: string;
  diet_type: string;
  serving_size: number;
  rating: number;
  created_at: string;
}

const ingredientCategories: IngredientCategory[] = [
  {
    name: 'Vegetables',
    icon: Leaf,
    color: 'bg-green-100 text-green-700 border-green-300',
    items: ['tomatoes', 'onions', 'potatoes', 'spinach', 'carrots', 'bell peppers', 'cauliflower', 'broccoli', 'cabbage', 'ginger', 'garlic', 'green chilies', 'cucumber', 'eggplant', 'okra', 'peas', 'corn', 'mushrooms']
  },
  {
    name: 'Fruits',
    icon: Apple,
    color: 'bg-red-100 text-red-700 border-red-300',
    items: ['lemons', 'limes', 'oranges', 'apples', 'bananas', 'mangoes', 'strawberries', 'grapes', 'pomegranate', 'coconut']
  },
  {
    name: 'Grains & Pulses',
    icon: Wheat,
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    items: ['basmati rice', 'rice', 'wheat flour', 'lentils', 'chickpeas', 'kidney beans', 'pasta', 'noodles', 'oats', 'semolina', 'besan']
  },
  {
    name: 'Proteins',
    icon: Fish,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    items: ['chicken', 'fish', 'paneer', 'tofu', 'eggs']
  },
  {
    name: 'Dairy',
    icon: Milk,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    items: ['milk', 'yogurt', 'ghee', 'butter', 'cream', 'cheese', 'paneer', 'buttermilk']
  },
  {
    name: 'Spices & Herbs',
    icon: Flame,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    items: ['spices','turmeric', 'cumin', 'coriander', 'garam masala', 'cardamom', 'cinnamon', 'cloves', 'black pepper', 'red chili powder', 'mustard seeds', 'fennel seeds', 'bay leaves', 'curry leaves', 'asafoetida', 'saffron', 'amchur', 'mint leaves']
  }
];

interface RecipeRecommenderPageProps {
  initialIngredients?: string[];
}

export function RecipeRecommenderPage({ initialIngredients = [] }: RecipeRecommenderPageProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(initialIngredients);
  const [customIngredients, setCustomIngredients] = useState('');
  const [recommendations, setRecommendations] = useState<RecipeRecommendation[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [useSubstitutions, setUseSubstitutions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New states for detailed views
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDetail | null>(null);
  const [showRecipeDialog, setShowRecipeDialog] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Function to normalize ingredient names for matching
  const normalizeIngredient = (ingredient: string): string => {
    return ingredient
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')    // Normalize spaces
      .replace(/\b(\w)/g, char => char.toUpperCase()); // Capitalize first letter of each word
  };

  const toggleIngredient = (ingredient: string) => {
    const normalizedIngredient = normalizeIngredient(ingredient);
    if (selectedIngredients.includes(normalizedIngredient)) {
      setSelectedIngredients(selectedIngredients.filter(i => i !== normalizedIngredient));
    } else {
      setSelectedIngredients([...selectedIngredients, normalizedIngredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  // Fetch recipe recommendations
  const fetchRecommendations = async (ingredients: string[], withSubstitutions: boolean) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const endpoint = withSubstitutions 
        ? 'http://127.0.0.1:8000/ml/recommend-with-subs/'
        : 'http://127.0.0.1:8000/ml/recommend/';
      
      // Normalize and validate ingredients before sending
      const normalizedIngredients = ingredients.map(normalizeIngredient);
      console.log('Fetching from:', endpoint, 'with normalized ingredients:', normalizedIngredients);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
          ingredients: normalizedIngredients,
          top_n: 8
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        const transformedRecipes = data.recommendations.map((recipe: any) => {
          // Determine if recipe can be made based on match percentage
          const canMakeRecipe = recipe.match_percentage > 45;
          
          return {
            ...recipe,
            rating: recipe.rating || 4.5,
            difficulty: recipe.difficulty || 'Medium',
            cuisine: recipe.cuisine || 'Indian',
            description: recipe.description || 'A delicious recipe perfect for any occasion.',
            ingredients: recipe.ingredients || [],
            instructions: recipe.instructions || ['No instructions available.'],
            match_percentage: recipe.match_percentage || 0,
            can_make: canMakeRecipe,
            usability_score: recipe.usability_score || recipe.match_percentage
          };
        });

        // Sort recipes by match percentage in descending order
        const sortedRecipes = transformedRecipes.sort((a: RecipeRecommendation, b: RecipeRecommendation) => 
          b.match_percentage - a.match_percentage
        );

        setRecommendations(sortedRecipes);
        setShowResults(true);
        setSuccess(data.message);
        
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setError(data.error || 'Failed to get recommendations from the server');
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(`Error: ${err.message}. Please check if the Django server is running.`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe details
  const fetchRecipeDetails = async (recipeId: number) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/recipes/${recipeId}/details/`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedRecipe(data.recipe);
        setShowRecipeDialog(true);
      } else {
        setError('Failed to load recipe details');
      }
    } catch (err) {
      setError('Error loading recipe details');
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle view details
  const handleViewDetails = (recipe: RecipeRecommendation) => {
    fetchRecipeDetails(recipe.id);
  };

  const handleGetRecommendations = (withSubstitutions: boolean) => {
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient');
      return;
    }
    setUseSubstitutions(withSubstitutions);
    fetchRecommendations(selectedIngredients, withSubstitutions);
  };

  const handleTestCustomIngredients = (withSubstitutions: boolean) => {
    if (!customIngredients.trim()) {
      setError('Please enter some ingredients first!');
      return;
    }
    const ingredients = customIngredients.split(',').map(i => normalizeIngredient(i)).filter(i => i);
    const newIngredients = [...new Set([...selectedIngredients, ...ingredients])];
    setSelectedIngredients(newIngredients);
    setCustomIngredients('');
    setUseSubstitutions(withSubstitutions);
    fetchRecommendations(newIngredients, withSubstitutions);
  };

  const getDefaultImage = (recipeName: string) => {
    const name = recipeName.toLowerCase();
    if (name.includes('chicken')) return 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400';
    if (name.includes('rice') || name.includes('biryani')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    if (name.includes('vegetable') || name.includes('aloo') || name.includes('palak')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400';
  };

  // Clear error when user starts typing
  useEffect(() => {
    if (error && (selectedIngredients.length > 0 || customIngredients)) {
      setError('');
    }
  }, [selectedIngredients, customIngredients, error]);

  // Recipe Details Dialog Component
  const RecipeDetailsDialog = () => (
    <Dialog open={showRecipeDialog} onOpenChange={setShowRecipeDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {selectedRecipe && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <ChefHat className="h-6 w-6 text-primary" />
                {selectedRecipe.name}
              </DialogTitle>
              <DialogDescription>
                {selectedRecipe.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {/* Recipe Image */}
              <div className="relative h-64 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.name}
                  fallbackSrc={getDefaultImage(selectedRecipe.name)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Recipe Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-gray-600" />
                    <span>{selectedRecipe.cooking_time} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span>Serves {selectedRecipe.serving_size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{selectedRecipe.rating.toFixed(1)}</span>
                  </div>
                  <Badge variant="outline">{selectedRecipe.difficulty}</Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cuisine & Diet</h4>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedRecipe.cuisine}</Badge>
                    <Badge variant="secondary">{selectedRecipe.diet_type}</Badge>
                    <Badge variant="secondary">{selectedRecipe.meal_type}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Ingredients
              </h3>
              <div className="grid gap-2">
                {selectedRecipe.structured_ingredients.length > 0 ? (
                  selectedRecipe.structured_ingredients.map((ingredient, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b">
                      <span>{ingredient.name}</span>
                      <span className="text-gray-600">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </div>
                  ))
                ) : (
                  selectedRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="py-2 border-b">
                      {ingredient}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Instructions
              </h3>
              <div className="space-y-4">
                {selectedRecipe.instructions.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="flex-1 pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="py-16 bg-gradient-to-b from-orange-50 to-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">
              AI Recipe Recommender
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select your available ingredients and get AI-powered recipe recommendations using Machine Learning
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="max-w-4xl mx-auto mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert className="max-w-4xl mx-auto mb-6 bg-green-50 border-green-200">
            <Sparkles className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Selected Ingredients Summary */}
        {selectedIngredients.length > 0 && (
          <Card className="mb-8 max-w-4xl mx-auto border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Your Selected Ingredients ({selectedIngredients.length})</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedIngredients([])}
                >
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ingredient, index) => (
                  <Badge 
                    key={index} 
                    className="px-3 py-2 bg-primary text-white cursor-pointer hover:bg-primary/80 flex items-center gap-1"
                    onClick={() => removeIngredient(ingredient)}
                  >
                    {ingredient}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ingredient Categories */}
        <div className="max-w-6xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Select Ingredients by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredientCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className={`${category.color} border-b`}>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {category.items.map((item) => (
                        <Badge
                          key={item}
                          variant={selectedIngredients.includes(normalizeIngredient(item)) ? "default" : "outline"}
                          className={`cursor-pointer transition-all ${
                            selectedIngredients.includes(normalizeIngredient(item)) 
                              ? 'bg-primary text-white' 
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => toggleIngredient(item)}
                        >
                          {item}
                          {selectedIngredients.includes(normalizeIngredient(item)) && (
                            <Plus className="ml-1 h-3 w-3 rotate-45" />
                          )}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        {selectedIngredients.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-center">Get AI-Powered Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handleGetRecommendations(false)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        AI Processing...
                      </div>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Get Recommendations
                      </>
                    )}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => handleGetRecommendations(true)}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        AI Processing...
                      </div>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-5 w-5" />
                        With Substitutions
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Custom Ingredients Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-dashed border-gray-300">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Custom Ingredients
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Can't find your ingredient? Add it manually (comma-separated). We'll automatically normalize the spelling.
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="e.g., chicken, broccoli, soy sauce, olive oil"
                    value={customIngredients}
                    onChange={(e) => setCustomIngredients(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleTestCustomIngredients(false)}
                    disabled={loading || !customIngredients.trim()}
                  >
                    <ChefHat className="mr-2 h-4 w-4" />
                    Test Custom Ingredients
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleTestCustomIngredients(true)}
                    disabled={loading || !customIngredients.trim()}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Test with Substitutions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {showResults && (
          <div id="results-section" className="max-w-6xl mx-auto">
            <Alert className="mb-6 bg-green-50 border-green-200">
              <Sparkles className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                {recommendations.length > 0 
                  ? `Found ${recommendations.length} recipes matching your ingredients${useSubstitutions ? ' (with substitution options)' : ''}!`
                  : 'No recipes found with your current ingredients. Try adding more ingredients!'
                }
              </AlertDescription>
            </Alert>

            {recommendations.length > 0 && (
              <>
                <h2 className="text-2xl font-semibold mb-6">
                  AI Recommended Recipes (Sorted by Best Match)
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {recommendations.map((recipe, index) => (
                    <Card key={recipe.id} className={`hover:shadow-xl transition-shadow overflow-hidden border-2 ${
                      index === 0 ? 'border-yellow-400 shadow-lg' : 'border-green-100'
                    }`}>
                      <div className="relative h-48">
                        <ImageWithFallback
                          src={recipe.image || getDefaultImage(recipe.name)}
                          alt={recipe.name}
                          fallbackSrc={getDefaultImage(recipe.name)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {/* Match Percentage Badge */}
                          <Badge className={`${
                            recipe.match_percentage >= 90 ? 'bg-green-500' :
                            recipe.match_percentage >= 70 ? 'bg-blue-500' :
                            recipe.match_percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          } text-white`}>
                            {recipe.match_percentage}% Match
                          </Badge>
                          
                          {/* Can Make Status Badge */}
                          {recipe.can_make ? (
                            <Badge className="bg-emerald-500 text-white flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Can Make
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500 text-white flex items-center gap-1">
                              <XIcon className="h-3 w-3" />
                              Needs Items
                            </Badge>
                          )}
                        </div>
                        
                        {index === 0 && recipe.match_percentage >= 80 && (
                          <Badge className="absolute top-3 left-3 bg-yellow-500 text-white animate-pulse">
                            🏆 Best Match
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-3">{recipe.name}</h3>
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{recipe.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{recipe.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant="outline" className={
                            recipe.difficulty === 'Easy' ? 'bg-green-100' :
                            recipe.difficulty === 'Medium' ? 'bg-yellow-100' : 'bg-red-100'
                          }>
                            {recipe.difficulty}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
                        
                        {/* Key Ingredients Preview */}
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 font-semibold mb-1">
                            Key Ingredients:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {recipe.ingredients.slice(0, 4).map((ingredient, idx) => (
                              <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {ingredient}
                              </span>
                            ))}
                            {recipe.ingredients.length > 4 && (
                              <span className="text-xs text-gray-500">
                                +{recipe.ingredients.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Availability Status */}
                        <div className="mb-3">
                          {recipe.can_make ? (
                            <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-emerald-800">
                                You can make this recipe with your available ingredients!
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                              <AlertCircle className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium text-amber-800">
                                You need additional ingredients to make this recipe
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Simplified Substitution Display */}
                        {useSubstitutions && recipe.has_substitutions && recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-800">Quick Substitutions</span>
                              </div>
                              <Badge variant="outline" className="text-xs bg-blue-100">
                                {recipe.missing_ingredients.length} missing
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 max-h-20 overflow-y-auto text-xs">
                              {recipe.missing_ingredients.slice(0, 4).map((missingIng, index) => (
                                <div key={index} className="flex justify-between items-center">
                                  <span className="text-red-600 flex-1 truncate">{missingIng}</span>
                                  <span className="text-green-600 flex-1 truncate text-right">
                                    {recipe.substitutes && recipe.substitutes[missingIng] ? 
                                      recipe.substitutes[missingIng][0]?.substitute : 'Find substitute'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ingredients You Have */}
                        {recipe.ingredients_you_have && recipe.ingredients_you_have.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs text-green-600 font-semibold mb-1">
                              ✅ You have: {recipe.ingredients_you_have.slice(0, 3).join(', ')}
                              {recipe.ingredients_you_have.length > 3 && ` +${recipe.ingredients_you_have.length - 3} more`}
                            </div>
                          </div>
                        )}

                        {/* Single Button */}
                        <Button 
                          onClick={() => handleViewDetails(recipe)}
                          disabled={loadingDetails}
                          className="w-full bg-primary hover:bg-primary/90"
                        >
                          {loadingDetails ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                              Loading...
                            </div>
                          ) : (
                            <>
                              <ChefHat className="mr-2 h-4 w-4" />
                              View Recipe Details
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            <div className="text-center">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => {
                  setShowResults(false);
                  setRecommendations([]);
                  setSuccess('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Start New Search
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showResults && selectedIngredients.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="relative mb-6">
              <ChefHat className="h-24 w-24 text-gray-300 mx-auto" />
              <Sparkles className="h-8 w-8 text-primary absolute top-0 right-1/4 animate-pulse" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Ready to Discover Your Perfect Recipe?</h3>
            <p className="text-gray-600 mb-8">
              Our AI-powered recipe recommender uses Machine Learning to find the perfect recipes based on your available ingredients.
              Select ingredients from the categories above or add your own custom ingredients to get started!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Leaf className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">Fresh Veggies</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <Apple className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="font-semibold">Fruits</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <Wheat className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold">Grains</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="font-semibold">Spices</p>
              </div>
            </div>
          </div>
        )}

        {/* Add the dialog at the end */}
        <RecipeDetailsDialog />
      </div>
    </div>
  );
}