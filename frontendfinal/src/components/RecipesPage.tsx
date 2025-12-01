import { useState, useEffect } from 'react';
import { Search, Clock, Users, Star, ChefHat, Filter, Heart, RefreshCw, X, ShoppingCart, Utensils, Timer } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRecipeContext } from './RecipeContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

// Database recipe interface matching your Django API
interface DbRecipe {
  recipe_id: number;
  title: string;
  description: string;
  ingredients: any;
  instructions: string;
  cooking_time: number;
  difficulty: string;
  cuisine: string;
  image_url: string;
  user_id: number;
  created_at: string;
}

// Frontend recipe interface for display
interface Recipe {
  id: number;
  name: string;
  image: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'beverages';
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviews: number;
  cuisine: string;
  description: string;
  tags: string[];
}

interface RecipesPageProps {
  filters?: {
    ingredients: string[];
    cuisine: string;
    meal: string;
    diet: string;
  } | null;
  onViewRecipe?: (recipeId: number) => void;
}

// API configuration
const API_BASE_URL = 'http://localhost:8000';

export function RecipesPage({ filters, onViewRecipe }: RecipesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'beverages'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'time'>('popular');
  const [dbRecipes, setDbRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, addToFavorites, removeFromFavorites, userRecipes } = useRecipeContext();

  // States for recipe details view
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDetails, setRecipeDetails] = useState<any>(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Function to safely convert ingredients to string for tag generation
  const getIngredientsText = (ingredients: any): string => {
    if (!ingredients) return '';
    
    if (typeof ingredients === 'string') {
      return ingredients;
    }
    
    if (Array.isArray(ingredients)) {
      return ingredients.join(', ');
    }
    
    if (typeof ingredients === 'object') {
      try {
        return Object.values(ingredients).join(', ');
      } catch {
        return JSON.stringify(ingredients);
      }
    }
    
    return String(ingredients);
  };

  // Function to map database recipe to frontend recipe format
  const mapDbRecipeToFrontend = (dbRecipe: DbRecipe): Recipe => {
    const getCategory = (): 'breakfast' | 'lunch' | 'dinner' | 'beverages' => {
      const title = (dbRecipe.title || '').toLowerCase();
      const description = (dbRecipe.description || '').toLowerCase();
      const cuisine = (dbRecipe.cuisine || '').toLowerCase();
      
      if (title.includes('tea') || title.includes('coffee') || title.includes('lassi') || 
          title.includes('juice') || title.includes('drink') || title.includes('smoothie') ||
          description.includes('beverage') || description.includes('drink') || title.includes('milk') || title.includes('water') || title.includes('pani')) {
        return 'beverages';
      }
      
      if (title.includes('breakfast') || title.includes('dosa') || title.includes('idli') || 
          title.includes('poha') || title.includes('paratha') || title.includes('upma') ||
          title.includes('puri') || title.includes('dhokla') || title.includes('vada') || title.includes('chilla')|| cuisine.includes('breakfast')) {
        return 'breakfast';
      }
      
      if (title.includes('dinner') || title.includes('curry') || title.includes('sabzi') ||
          title.includes('kofta') || title.includes('makhani') || title.includes('paneer') ||
          cuisine.includes('dinner') || title.includes('chicken') || title.includes('mutton')) {
        return 'dinner';
      }
      
      return 'lunch';
    };

    const getDifficulty = (): 'Easy' | 'Medium' | 'Hard' => {
      const diff = (dbRecipe.difficulty || '').toLowerCase();
      const cookTime = dbRecipe.cooking_time || 30;
      
      if (diff === 'easy' || diff === 'beginner' || cookTime <= 20) return 'Easy';
      if (diff === 'hard' || diff === 'expert' || diff === 'difficult' || cookTime >= 45) return 'Hard';
      return 'Medium';
    };

    const getTags = (): string[] => {
      const tags: string[] = [];
      const ingredientsText = getIngredientsText(dbRecipe.ingredients).toLowerCase();
      const title = (dbRecipe.title || '').toLowerCase();
      const description = (dbRecipe.description || '').toLowerCase();
      
      if (ingredientsText.includes('chicken') || ingredientsText.includes('meat') || 
          ingredientsText.includes('fish') || ingredientsText.includes('egg') || ingredientsText.includes('mutton')) {
        tags.push('Non-Vegetarian');
      } else {
        tags.push('Vegetarian');
      }
      
      const cookTime = dbRecipe.cooking_time || 30;
      if (cookTime <= 20) tags.push('Quick');
      if (cookTime >= 45) tags.push('Slow-cooked');
      
      if (title.includes('popular') || description.includes('popular')) tags.push('Popular');
      if (ingredientsText.includes('healthy') || description.includes('healthy') || description.includes('nutritious')) tags.push('Healthy');
      if (title.includes('traditional') || description.includes('traditional')) tags.push('Traditional');
      if (title.includes('festive') || description.includes('festive')) tags.push('Festive');
      if (description.includes('quick') || description.includes('easy') || description.includes('simple')) tags.push('Easy');
      if (description.includes('protein') || ingredientsText.includes('protein')) tags.push('Protein-rich');
      
      return tags.length > 0 ? tags : ['Traditional'];
    };

    const generateId = () => {
      return dbRecipe.recipe_id || Math.floor(Math.random() * 10000);
    };

    const getRating = () => {
      return 4.5 + (Math.random() * 0.5);
    };

    const getReviews = () => {
      return Math.floor(Math.random() * 100) + 50;
    };

    return {
      id: generateId(),
      name: dbRecipe.title || 'Untitled Recipe',
      image: dbRecipe.image_url || '/api/placeholder/400/300',
      category: getCategory(),
      cookTime: dbRecipe.cooking_time || 30,
      servings: 4,
      difficulty: getDifficulty(),
      rating: getRating(),
      reviews: getReviews(),
      cuisine: dbRecipe.cuisine || 'Indian',
      description: dbRecipe.description || 'A delicious recipe with amazing flavors.',
      tags: getTags(),
    };
  };

  // Fetch recipes from backend
  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching recipes from:', `${API_BASE_URL}/recipes/`);
      
      const response = await fetch(`${API_BASE_URL}/recipes/`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
      }
      
      const data: DbRecipe[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array');
      }
      
      console.log('✅ Fetched recipes from database:', data.length);
      
      const transformedRecipes: Recipe[] = data.map(mapDbRecipeToFrontend);
      setDbRecipes(transformedRecipes);
    } catch (err) {
      console.error('❌ Error fetching recipes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes from server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipe details from database
  const fetchRecipeDetails = async (recipeId: number) => {
    setLoadingDetails(true);
    try {
      console.log('🔄 Fetching recipe details for ID:', recipeId);
      
      // Find the recipe in our current list first
      const recipe = combinedRecipes.find(r => r.id === recipeId);
      if (!recipe) {
        throw new Error('Recipe not found');
      }

      setSelectedRecipe(recipe);

      // Try to fetch additional details from API
      const endpoints = [
        `${API_BASE_URL}/recipes/${recipeId}/details/`,
        `${API_BASE_URL}/recipes/${recipeId}/`,
        `${API_BASE_URL}/api/recipes/${recipeId}/`
      ];

      let response = null;
      let apiData = null;

      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await fetch(endpoint);
          if (response.ok) {
            apiData = await response.json();
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err);
        }
      }

      // If we got API data, use it. Otherwise use the basic recipe data we have
      if (apiData) {
        const recipeData = apiData.recipe || apiData;
        setRecipeDetails({
          // Use API data if available
          ingredients: parseIngredients(recipeData.ingredients),
          instructions: parseInstructions(recipeData.instructions),
          cooking_time: recipeData.cooking_time || recipe.cookTime,
          serving_size: recipeData.serving_size || recipe.servings,
          // Fall back to our recipe data
          ...recipe
        });
      } else {
        // Use the basic data we already have
        setRecipeDetails({
          ingredients: parseIngredients(recipe.description), // Use description as fallback for ingredients
          instructions: ['No detailed instructions available. Please check the recipe description for preparation steps.'],
          cooking_time: recipe.cookTime,
          serving_size: recipe.servings,
          ...recipe
        });
      }

      setShowRecipeDetails(true);
      setError(null);
    } catch (err) {
      console.error('❌ Error loading recipe details:', err);
      // Even if API fails, show basic details with the recipe we have
      const recipe = combinedRecipes.find(r => r.id === recipeId);
      if (recipe) {
        setSelectedRecipe(recipe);
        setRecipeDetails({
          ingredients: ['Check recipe description for ingredients'],
          instructions: ['No detailed instructions available. Please check the recipe description for preparation steps.'],
          cooking_time: recipe.cookTime,
          serving_size: recipe.servings,
          ...recipe
        });
        setShowRecipeDetails(true);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  // Helper function to parse ingredients
  const parseIngredients = (ingredients: any): string[] => {
    if (!ingredients) return ['Ingredients not specified'];
    
    if (typeof ingredients === 'string') {
      try {
        const parsed = JSON.parse(ingredients);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, try to split by common separators
        return ingredients.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
    }
    
    if (Array.isArray(ingredients)) {
      return ingredients;
    }
    
    return ['Ingredients not specified'];
  };

  // Helper function to parse instructions
  const parseInstructions = (instructions: any): string[] => {
    if (!instructions) return ['No instructions available'];
    
    if (typeof instructions === 'string') {
      try {
        const parsed = JSON.parse(instructions);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, split by steps
        return instructions
          .split(/\d+\.|\n-|\n•/)
          .map((step: string) => step.trim())
          .filter((step: string) => step.length > 0);
      }
    }
    
    if (Array.isArray(instructions)) {
      return instructions;
    }
    
    return ['No instructions available'];
  };

  // Handle view recipe - shows details on the same page
  const handleViewRecipe = (recipeId: number) => {
    console.log('👆 View Recipe clicked for ID:', recipeId);
    if (onViewRecipe) {
      onViewRecipe(recipeId);
    } else {
      fetchRecipeDetails(recipeId);
    }
  };

  // Close recipe details
  const handleCloseDetails = () => {
    setShowRecipeDetails(false);
    setSelectedRecipe(null);
    setRecipeDetails(null);
  };

  // Get default image fallback
  const getDefaultImage = (recipeName: string) => {
    const name = recipeName.toLowerCase();
    if (name.includes('chicken')) return 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400';
    if (name.includes('rice') || name.includes('biryani')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
    if (name.includes('vegetable') || name.includes('aloo') || name.includes('palak')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400';
  };

  // Fetch recipes on component mount
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Combine database recipes with user-added recipes
  const combinedRecipes = [...dbRecipes, ...userRecipes];

  const toggleFavorite = (recipeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite(recipeId)) {
      removeFromFavorites(recipeId);
    } else {
      addToFavorites(recipeId);
    }
  };

  // Apply meal filter from search if provided
  useEffect(() => {
    if (filters?.meal) {
      const mealCategory = filters.meal.toLowerCase() as 'breakfast' | 'lunch' | 'dinner' | 'beverages';
      if (['breakfast', 'lunch', 'dinner', 'beverages'].includes(mealCategory)) {
        setSelectedCategory(mealCategory);
      }
    }
  }, [filters]);

  const filteredRecipes = combinedRecipes
    .filter(recipe => {
      const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
      const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      let matchesFilters = true;
      if (filters) {
        if (filters.cuisine && filters.cuisine !== '') {
          matchesFilters = matchesFilters && recipe.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase());
        }
        if (filters.meal && filters.meal !== '') {
          matchesFilters = matchesFilters && recipe.category.toLowerCase() === filters.meal.toLowerCase();
        }
        if (filters.diet && filters.diet !== '') {
          matchesFilters = matchesFilters && recipe.tags.some(tag => tag.toLowerCase().includes(filters.diet.toLowerCase()));
        }
      }
      
      return matchesCategory && matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.reviews - a.reviews;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'time') return a.cookTime - b.cookTime;
      return 0;
    });

  const getCategoryCount = (category: 'all' | 'breakfast' | 'lunch' | 'dinner' | 'beverages') => {
    if (category === 'all') return combinedRecipes.length;
    return combinedRecipes.filter(r => r.category === category).length;
  };

  // Refresh recipes function
  const handleRefreshRecipes = () => {
    fetchRecipes();
  };

  // Recipe Details View Component
  const RecipeDetailsView = () => {
    if (!showRecipeDetails || !recipeDetails) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-primary" />
                {recipeDetails.name}
              </h2>
              <p className="text-gray-600 text-lg">{recipeDetails.description}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseDetails}
              className="flex-shrink-0 ml-4"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="p-6">
            {/* Recipe Image and Basic Info */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={recipeDetails.image}
                  alt={recipeDetails.name}
                  fallbackSrc={getDefaultImage(recipeDetails.name)}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">{recipeDetails.cooking_time} mins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-semibold">Serves {recipeDetails.serving_size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{recipeDetails.rating.toFixed(1)}</span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {recipeDetails.difficulty}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Cuisine & Category</h4>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{recipeDetails.cuisine}</Badge>
                    <Badge variant="secondary">{recipeDetails.category}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {recipeDetails.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Ingredients
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {recipeDetails.ingredients.map((ingredient: string, index: number) => (
                    <li key={index} className="flex items-center py-1">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Utensils className="h-6 w-6" />
                Cooking Instructions
              </h3>
              <div className="space-y-4">
                {recipeDetails.instructions.map((step: string, index: number) => (
                  <div key={index} className="flex gap-4 p-4 bg-orange-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="flex-1 text-gray-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={() => window.print()}
              >
                Print Recipe
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleCloseDetails}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Our Recipe Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover authentic Indian recipes from breakfast to dinner, all curated for home cooking
          </p>
          
          {/* Refresh Button */}
          <div className="mt-4 flex justify-center gap-4 items-center">
            <Button 
              onClick={handleRefreshRecipes} 
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Recipes'}
            </Button>
            {dbRecipes.length > 0 && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {dbRecipes.length} recipes from database
              </Badge>
            )}
          </div>
          {error && (
            <Alert className="max-w-2xl mx-auto mt-4 bg-red-50 border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {error} - Showing {combinedRecipes.length} available recipes
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="max-w-6xl mx-auto mb-8">
          {/* Active Filters Display */}
          {filters && (filters.ingredients.length > 0 || filters.cuisine || filters.meal || filters.diet) && (
            <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Filter className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">Active Search Filters:</h3>
                  <div className="flex flex-wrap gap-2">
                    {filters.ingredients.length > 0 && (
                      <Badge variant="secondary" className="bg-white">
                        Ingredients: {filters.ingredients.join(', ')}
                      </Badge>
                    )}
                    {filters.cuisine && (
                      <Badge variant="secondary" className="bg-white">
                        Cuisine: {filters.cuisine}
                      </Badge>
                    )}
                    {filters.meal && (
                      <Badge variant="secondary" className="bg-white">
                        Meal: {filters.meal}
                      </Badge>
                    )}
                    {filters.diet && (
                      <Badge variant="secondary" className="bg-white">
                        Diet: {filters.diet}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search recipes, cuisines, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 text-lg rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="time">Quickest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipes from database...</p>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={selectedCategory} onValueChange={(value: any) => setSelectedCategory(value)} className="max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-5 mb-12">
            <TabsTrigger value="all">
              All ({getCategoryCount('all')})
            </TabsTrigger>
            <TabsTrigger value="breakfast">
              Breakfast ({getCategoryCount('breakfast')})
            </TabsTrigger>
            <TabsTrigger value="lunch">
              Lunch ({getCategoryCount('lunch')})
            </TabsTrigger>
            <TabsTrigger value="dinner">
              Dinner ({getCategoryCount('dinner')})
            </TabsTrigger>
            <TabsTrigger value="beverages">
              Beverages ({getCategoryCount('beverages')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            {/* Recipe Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer">
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white h-8 w-8"
                        onClick={(e) => toggleFavorite(recipe.id, e)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorite(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'
                          }`}
                        />
                      </Button>
                      <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                        {recipe.cuisine}
                      </Badge>
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge 
                        variant="secondary"
                        className={
                          recipe.difficulty === 'Easy' ? 'bg-green-500 text-white' :
                          recipe.difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                          'bg-red-500 text-white'
                        }
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Title */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.cookTime} mins</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{recipe.rating.toFixed(1)}</span>
                          <span className="text-gray-400">({recipe.reviews})</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90" 
                        onClick={() => handleViewRecipe(recipe.id)}
                        disabled={loadingDetails}
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {filteredRecipes.length === 0 && !loading && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No recipes found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter to find what you're looking for
                </p>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-white">
            <div className="text-3xl font-bold text-primary mb-2">{combinedRecipes.length}</div>
            <p className="text-gray-600">Total Recipes</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-white">
            <div className="text-3xl font-bold text-accent mb-2">4.7★</div>
            <p className="text-gray-600">Average Rating</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-yellow-50 to-white">
            <div className="text-3xl font-bold text-orange-500 mb-2">10+</div>
            <p className="text-gray-600">Cuisines</p>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-blue-50 to-white">
            <div className="text-3xl font-bold text-blue-500 mb-2">100%</div>
            <p className="text-gray-600">Authentic</p>
          </Card>
        </div>

        {/* Recipe Details View */}
        <RecipeDetailsView />
      </div>
    </div>
  );
}