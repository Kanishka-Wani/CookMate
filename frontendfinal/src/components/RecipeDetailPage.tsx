import { useState, useEffect } from 'react';
import { Clock, Users, Star, ChefHat, ArrowLeft, Heart, Printer, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRecipeContext } from './RecipeContext';
import { Alert, AlertDescription } from './ui/alert';

// Database recipe interface matching your Django API
interface DbRecipe {
  recipe_id: number;
  title: string;  // This is the actual field name in database
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
  name: string;  // This is what we use in frontend
  image: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'beverages';
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviews: number;
  cuisine: string;
  description: string;
  tags: string[];
  calories: number;
  ingredients: string[];
  instructions: string[];
}

interface RecipeDetailPageProps {
  recipeId: number;
  onBack: () => void;
}

// API configuration
const API_BASE_URL = 'http://localhost:8000';

export function RecipeDetailPage({ recipeId, onBack }: RecipeDetailPageProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useRecipeContext();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to parse ingredients
  const parseIngredients = (ingredients: any): string[] => {
    if (!ingredients) return ['Ingredients not specified'];
    
    console.log('📦 Raw ingredients:', ingredients);
    
    if (typeof ingredients === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(ingredients);
        console.log('✅ Parsed JSON ingredients:', parsed);
        
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(Boolean);
        } else if (typeof parsed === 'object') {
          // Handle object format - extract values
          return Object.values(parsed).map(item => String(item).trim()).filter(Boolean);
        }
      } catch {
        // If not JSON, try to split by common separators
        console.log('❌ Not JSON, splitting by commas');
        return ingredients.split(',').map((item: string) => item.trim()).filter(Boolean);
      }
    }
    
    if (Array.isArray(ingredients)) {
      return ingredients.map(item => String(item).trim()).filter(Boolean);
    }
    
    if (typeof ingredients === 'object') {
      return Object.values(ingredients).map(item => String(item).trim()).filter(Boolean);
    }
    
    return ['Ingredients not specified'];
  };

  // Helper function to parse instructions
  const parseInstructions = (instructions: any): string[] => {
    if (!instructions) return ['No instructions available'];
    
    console.log('📝 Raw instructions:', instructions);
    
    if (typeof instructions === 'string') {
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(instructions);
        console.log('✅ Parsed JSON instructions:', parsed);
        
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(Boolean);
        }
      } catch {
        // If not JSON, split by steps
        console.log('❌ Not JSON, splitting by steps');
        const steps = instructions
          .split(/\d+\.|\n-|\n•|\n\d+\)/)
          .map((step: string) => step.trim())
          .filter((step: string) => step.length > 0 && !step.match(/^\s*$/));
        
        return steps.length > 0 ? steps : [instructions];
      }
    }
    
    if (Array.isArray(instructions)) {
      return instructions.map(item => String(item).trim()).filter(Boolean);
    }
    
    return ['No instructions available'];
  };

  // Function to map database recipe to frontend recipe format
  const mapDbRecipeToFrontend = (dbRecipe: DbRecipe): Recipe => {
    console.log('🗺️ Mapping database recipe:', dbRecipe);

    // CRITICAL FIX: Map database 'title' to frontend 'name'
    const recipeName = dbRecipe.title?.trim() || 'Delicious Recipe';
    console.log('📛 Database title -> Frontend name:', dbRecipe.title, '->', recipeName);
    
    // Get category
    const getCategory = (): 'breakfast' | 'lunch' | 'dinner' | 'beverages' => {
      const title = (dbRecipe.title || '').toLowerCase();
      const description = (dbRecipe.description || '').toLowerCase();
      const cuisine = (dbRecipe.cuisine || '').toLowerCase();
      
      if (title.includes('tea') || title.includes('coffee') || title.includes('lassi') || 
          title.includes('juice') || title.includes('drink') || title.includes('smoothie') ||
          description.includes('beverage') || description.includes('drink')) {
        return 'beverages';
      }
      
      if (title.includes('breakfast') || title.includes('dosa') || title.includes('idli') || 
          title.includes('poha') || title.includes('paratha') || title.includes('upma') ||
          title.includes('puri') || cuisine.includes('breakfast')) {
        return 'breakfast';
      }
      
      if (title.includes('dinner') || title.includes('curry') || title.includes('sabzi') ||
          title.includes('kofta') || title.includes('makhani') || title.includes('paneer') ||
          cuisine.includes('dinner')) {
        return 'dinner';
      }
      
      return 'lunch';
    };

    // Get difficulty
    const getDifficulty = (): 'Easy' | 'Medium' | 'Hard' => {
      const diff = (dbRecipe.difficulty || '').toLowerCase();
      const cookTime = dbRecipe.cooking_time || 30;
      
      if (diff === 'easy' || diff === 'beginner' || cookTime <= 20) return 'Easy';
      if (diff === 'hard' || diff === 'expert' || diff === 'difficult' || cookTime >= 45) return 'Hard';
      return 'Medium';
    };

    // Get tags
    const getTags = (): string[] => {
      const tags: string[] = [];
      const ingredientsText = dbRecipe.ingredients ? JSON.stringify(dbRecipe.ingredients).toLowerCase() : '';
      const title = (dbRecipe.title || '').toLowerCase();
      const description = (dbRecipe.description || '').toLowerCase();
      
      // Diet type
      if (ingredientsText.includes('chicken') || ingredientsText.includes('meat') || 
          ingredientsText.includes('fish') || ingredientsText.includes('egg') || ingredientsText.includes('mutton')) {
        tags.push('Non-Vegetarian');
      } else {
        tags.push('Vegetarian');
      }
      
      // Cooking time
      const cookTime = dbRecipe.cooking_time || 30;
      if (cookTime <= 20) tags.push('Quick');
      if (cookTime >= 45) tags.push('Slow-cooked');
      
      // Popularity/type
      if (title.includes('popular') || description.includes('popular')) tags.push('Popular');
      if (ingredientsText.includes('healthy') || description.includes('healthy') || description.includes('nutritious')) tags.push('Healthy');
      if (title.includes('traditional') || description.includes('traditional')) tags.push('Traditional');
      if (title.includes('festive') || description.includes('festive')) tags.push('Festive');
      if (description.includes('quick') || description.includes('easy') || description.includes('simple')) tags.push('Easy');
      if (description.includes('protein') || ingredientsText.includes('protein')) tags.push('Protein-rich');
      
      return tags.length > 0 ? tags : ['Traditional'];
    };

    // Calculate calories based on ingredients and cooking time
    const getCalories = () => {
      const baseCalories = 200;
      const timeMultiplier = dbRecipe.cooking_time / 30; // Base 30 mins = 200 cal
      return Math.round(baseCalories * timeMultiplier);
    };

    // Get description - provide default if empty
    const getDescription = () => {
      return dbRecipe.description?.trim() || `A delicious ${dbRecipe.cuisine || 'Indian'} recipe that's perfect for any occasion.`;
    };

    // Get cuisine - provide default if empty
    const getCuisine = () => {
      return dbRecipe.cuisine?.trim() || 'Indian';
    };

    return {
      id: dbRecipe.recipe_id || Math.floor(Math.random() * 10000),
      name: recipeName, // This is the critical mapping: dbRecipe.title -> recipe.name
      image: dbRecipe.image_url?.trim() || getDefaultImage(recipeName),
      category: getCategory(),
      cookTime: dbRecipe.cooking_time || 30,
      prepTime: Math.round((dbRecipe.cooking_time || 30) * 0.5), // Prep time is roughly half of cook time
      servings: 4,
      difficulty: getDifficulty(),
      rating: 4.5 + (Math.random() * 0.5), // 4.5 to 5.0
      reviews: Math.floor(Math.random() * 100) + 50, // 50 to 150 reviews
      cuisine: getCuisine(),
      description: getDescription(),
      tags: getTags(),
      calories: getCalories(),
      ingredients: parseIngredients(dbRecipe.ingredients),
      instructions: parseInstructions(dbRecipe.instructions),
    };
  };

  // Fetch recipe details from backend
  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching recipe details for ID:', recipeId);
      
      // Try multiple possible endpoints
      const endpoints = [
        `${API_BASE_URL}/recipes/${recipeId}/details/`,
        `${API_BASE_URL}/recipes/${recipeId}/`,
        `${API_BASE_URL}/api/recipes/${recipeId}/`
      ];

      let response = null;
      let apiData = null;

      for (const endpoint of endpoints) {
        try {
          console.log('🔍 Trying endpoint:', endpoint);
          response = await fetch(endpoint);
          console.log('📡 Response status:', response.status);
          
          if (response.ok) {
            apiData = await response.json();
            console.log('✅ Success with endpoint:', endpoint);
            console.log('📦 Full API Response:', apiData);
            break;
          } else {
            console.log('❌ Endpoint failed:', endpoint, response.status);
          }
        } catch (err) {
          console.log(`🚫 Endpoint error ${endpoint}:`, err);
        }
      }

      if (!response || !response.ok) {
        throw new Error(`Failed to fetch recipe details: ${response?.status || 'Network error'}`);
      }

      if (!apiData) {
        throw new Error('No data received from server');
      }

      console.log('🎯 Final API data:', apiData);

      // Handle different response formats
      let recipeData: DbRecipe;

      if (apiData.recipe) {
        // Format: { success: true, recipe: {...} }
        recipeData = apiData.recipe;
        console.log('📋 Using recipe data from success response');
      } else if (apiData.recipe_id || apiData.id) {
        // Format: direct recipe object
        recipeData = apiData;
        console.log('📋 Using direct recipe data');
      } else if (Array.isArray(apiData) && apiData.length > 0) {
        // Format: array of recipes, take first one
        recipeData = apiData[0];
        console.log('📋 Using first recipe from array');
      } else {
        console.log('❌ Invalid data format:', apiData);
        throw new Error('Invalid recipe data format received from server');
      }

      // CRITICAL: Check if we have a title from database
      console.log('🔍 Checking database title field:', recipeData.title);
      if (!recipeData.title || recipeData.title.trim() === '') {
        console.log('⚠️ WARNING: Database title field is empty or missing!');
        console.log('📊 Full recipe data received from database:', recipeData);
      } else {
        console.log('✅ Database title found:', recipeData.title);
      }

      console.log('🔧 Recipe data to transform:', recipeData);
      const transformedRecipe = mapDbRecipeToFrontend(recipeData);
      console.log('✨ Transformed recipe - name should be:', transformedRecipe.name);
      
      setRecipe(transformedRecipe);
      
    } catch (err) {
      console.error('❌ Error loading recipe details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recipe details from server');
    } finally {
      setLoading(false);
    }
  };

  // Get default image fallback
  const getDefaultImage = (recipeName: string) => {
    const name = recipeName.toLowerCase();
    if (name.includes('chicken')) return 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800';
    if (name.includes('rice') || name.includes('biryani')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800';
    if (name.includes('vegetable') || name.includes('aloo') || name.includes('palak')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';
    if (name.includes('tea') || name.includes('coffee') || name.includes('drink')) return 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=800';
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800';
  };

  const toggleFavorite = () => {
    if (!recipe) return;
    
    if (isFavorite(recipe.id)) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe.id);
    }
  };

  // Print recipe function
  const handlePrintRecipe = () => {
    if (!recipe) return;

    // Create a print-friendly version of the recipe
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .recipe-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #f97316;
            padding-bottom: 20px;
          }
          .recipe-title {
            font-size: 2.5em;
            color: #ea580c;
            margin-bottom: 10px;
          }
          .recipe-meta {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 15px 0;
            flex-wrap: wrap;
          }
          .meta-item {
            background: #fff7ed;
            padding: 8px 15px;
            border-radius: 20px;
            font-weight: bold;
          }
          .recipe-image {
            max-width: 400px;
            margin: 20px auto;
            border-radius: 10px;
            overflow: hidden;
          }
          .recipe-image img {
            width: 100%;
            height: auto;
            display: block;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 1.5em;
            color: #ea580c;
            border-bottom: 1px solid #fed7aa;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .ingredients-list, .instructions-list {
            margin-left: 20px;
          }
          .ingredient-item, .instruction-item {
            margin-bottom: 8px;
            padding: 5px 0;
          }
          .instruction-number {
            background: #ea580c;
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            font-weight: bold;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 15px 0;
          }
          .tag {
            background: #ffedd5;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.9em;
          }
          .nutrition-info {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
          }
          .chef-tips {
            background: #fff7ed;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
          }
          @media print {
            body { 
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print { display: none !important; }
            .recipe-image { break-inside: avoid; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="recipe-header">
          <h1 class="recipe-title">${recipe.name}</h1>
          <p>${recipe.description}</p>
          
          <div class="recipe-meta">
            <span class="meta-item">⏱️ Prep: ${recipe.prepTime} min</span>
            <span class="meta-item">👨‍🍳 Cook: ${recipe.cookTime} min</span>
            <span class="meta-item">👥 Serves: ${recipe.servings}</span>
            <span class="meta-item">📊 ${recipe.difficulty}</span>
          </div>

          <div class="tags">
            <span class="tag">${recipe.cuisine}</span>
            <span class="tag">${recipe.category}</span>
            ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>

          ${recipe.image && recipe.image !== getDefaultImage(recipe.name) ? `
            <div class="recipe-image">
              <img src="${recipe.image}" alt="${recipe.name}" onerror="this.style.display='none'" />
            </div>
          ` : ''}
        </div>

        <div class="nutrition-info">
          <strong>Nutritional Information:</strong> ${recipe.calories} calories per serving
        </div>

        <div class="section">
          <h2 class="section-title">📋 Ingredients</h2>
          <ul class="ingredients-list">
            ${recipe.ingredients.map(ingredient => `
              <li class="ingredient-item">${ingredient}</li>
            `).join('')}
          </ul>
        </div>

        <div class="section">
          <h2 class="section-title">👨‍🍳 Instructions</h2>
          <ol class="instructions-list">
            ${recipe.instructions.map((instruction, index) => `
              <li class="instruction-item">
                <span class="instruction-number">${index + 1}</span>
                ${instruction}
              </li>
            `).join('')}
          </ol>
        </div>

        <div class="chef-tips">
          <h3 class="section-title">💡 Chef's Tips</h3>
          <ul>
            <li>Use fresh ingredients for the best flavor</li>
            <li>Adjust spices according to your taste preference</li>
            <li>You can prep ingredients in advance to save time</li>
            <li>Store leftovers in an airtight container in the refrigerator for up to 2 days</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #666; font-size: 0.9em;">
          Printed from Recipe App • ${new Date().toLocaleDateString()}
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for images to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    }
  };

  // Fetch recipe details on component mount
  useEffect(() => {
    fetchRecipeDetails();
  }, [recipeId]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-orange-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading recipe details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 hover:bg-orange-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800">
              {error || 'Recipe not found'}
            </AlertDescription>
          </Alert>
          <div className="text-center py-8">
            <Button onClick={fetchRecipeDetails} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 hover:bg-orange-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Recipes
        </Button>

        {/* Recipe Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recipe Image */}
          <div className="relative">
            <ImageWithFallback
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-96 object-cover rounded-2xl shadow-lg"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={toggleFavorite}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isFavorite(recipe.id) ? 'fill-red-500 text-red-500' : 'text-gray-700'
                  }`}
                />
              </Button>
              {/* Print Button - Share button removed */}
              <Button
                size="icon"
                variant="secondary"
                className="bg-white/90 hover:bg-white"
                onClick={handlePrintRecipe}
              >
                <Printer className="h-5 w-5 text-gray-700" />
              </Button>
            </div>
          </div>

          {/* Recipe Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{recipe.cuisine}</Badge>
                <Badge variant="outline">{recipe.category}</Badge>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {recipe.name}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {recipe.description}
              </p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(recipe.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{recipe.rating.toFixed(1)}</span>
              <span className="text-gray-500">({recipe.reviews} reviews)</span>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Prep Time</div>
                    <div className="font-semibold">{recipe.prepTime} mins</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Cook Time</div>
                    <div className="font-semibold">{recipe.cookTime} mins</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Servings</div>
                    <div className="font-semibold">{recipe.servings} people</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <ChefHat className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Difficulty</div>
                    <div className="font-semibold">{recipe.difficulty}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-orange-100 text-primary">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Calories */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  Nutritional Info
                </span>
                <span className="text-primary font-bold">
                  {recipe.calories} cal per serving
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients and Instructions */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Ingredients
                </h2>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold mt-0.5">
                        {index + 1}
                      </span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Instructions
                </h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 leading-relaxed pt-1">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className="mt-8 bg-gradient-to-br from-orange-50 to-green-50 border-none">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Chef's Tips
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Use fresh ingredients for the best flavor</li>
              <li>• Adjust spices according to your taste preference</li>
              <li>• You can prep ingredients in advance to save time</li>
              <li>• Store leftovers in an airtight container in the refrigerator for up to 2 days</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}