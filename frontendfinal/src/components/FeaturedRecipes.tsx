import { Clock, Star, Heart, Users, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

const featuredRecipes = [
  {
    id: 1,
    name: 'Butter Chicken',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YnV0dGVyJTIwY2hpY2tlbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600',
    cookTime: '45 mins',
    rating: 4.8,
    reviews: 1256,
    difficulty: 'Medium',
    cuisine: 'North Indian',
    tags: ['Popular', 'Creamy'],
    description: 'Rich and creamy tomato-based curry with tender chicken pieces',
    ingredients: [
      '500g Chicken',
      '200ml Tomato puree',
      '4 tbsp Butter',
      '100ml Cream',
      'Mixed spices (garam masala, turmeric, cumin)',
      '2 tbsp Ginger-garlic paste',
      '1 cup Yogurt',
      '1 large Onion',
      '2 tbsp Oil',
      'Fresh coriander for garnish'
    ],
    steps: [
      'Marinate chicken with yogurt and spices for 2 hours.',
      'Grill the chicken until cooked and slightly charred.',
      'Sauté onions in butter until golden brown.',
      'Add ginger-garlic paste and cook for 2 minutes.',
      'Add tomato puree and cook until oil separates.',
      'Add cream and simmer for 5 minutes.',
      'Mix grilled chicken and simmer for 10 minutes.',
      'Garnish with fresh coriander and serve hot.'
    ],
    servings: 4
  },
  {
    id: 2,
    name: 'Vegetable Biryani',
    image: 'https://media.istockphoto.com/id/495188382/photo/indian-pulav-vegetable-rice-veg-biryani-basmati-rice.webp?a=1&b=1&s=612x612&w=0&k=20&c=7ovRTJwxa_x4Q_BHoiLhiTKdTneDQ5W_m4_jJyOHbBM=',
    cookTime: '60 mins',
    rating: 4.7,
    reviews: 892,
    difficulty: 'Hard',
    cuisine: 'Hyderabadi',
    tags: ['Vegetarian', 'Festive'],
    description: 'Aromatic basmati rice layered with spiced vegetables and saffron',
    ingredients: [
      '2 cups Basmati rice',
      '3 cups Mixed vegetables (carrots, beans, peas, cauliflower)',
      '1/4 tsp Saffron',
      '2 tbsp Biryani masala',
      '1 cup Yogurt',
      '1/2 cup Fried onions',
      '4 tbsp Ghee',
      'Whole spices (bay leaf, cardamom, cinnamon)',
      'Mint leaves',
      '2 tbsp Lemon juice'
    ],
    steps: [
      'Soak basmati rice for 30 minutes.',
      'Parboil rice with whole spices until 70% cooked.',
      'Marinate vegetables with yogurt and biryani masala.',
      'Layer rice with spiced vegetables in a heavy-bottomed pot.',
      'Add saffron milk and fried onions between layers.',
      'Seal the pot with dough and cook on dum for 20 minutes.',
      'Let it rest for 10 minutes before serving.',
      'Garnish with fried onions and mint leaves.'
    ],
    servings: 6
  },
  {
    id: 3,
    name: 'Masala Dosa',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFzYWxhJTIwZG9zYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=1000',
    cookTime: '30 mins',
    rating: 4.6,
    reviews: 674,
    difficulty: 'Medium',
    cuisine: 'South Indian',
    tags: ['Vegetarian', 'Crispy'],
    description: 'Crispy fermented crepe filled with spiced potato curry',
    ingredients: [
      '2 cups Dosa rice',
      '1/2 cup Urad dal',
      '1/4 tsp Fenugreek seeds',
      '4 large Potatoes',
      '2 Onions',
      '1 tbsp Mustard seeds',
      '10-12 Curry leaves',
      '2 Green chilies',
      '1/2 tsp Turmeric powder',
      'Oil for cooking'
    ],
    steps: [
      'Soak rice and dal separately for 6 hours.',
      'Grind to smooth batter and ferment overnight.',
      'Boil and mash potatoes for the filling.',
      'Temper mustard seeds, curry leaves, and green chilies.',
      'Add onions and sauté until translucent.',
      'Mix in mashed potatoes and spices.',
      'Spread dosa batter on hot tawa and cook until crispy.',
      'Place potato filling and fold dosa.',
      'Serve hot with chutney and sambar.'
    ],
    servings: 4
  },
  {
    id: 4,
    name: 'Rajma Chawal',
    image: 'https://media.istockphoto.com/id/669635320/photo/kidney-bean-curry-or-rajma-or-rajmah-chawal-and-roti-typical-north-indian-main-course.jpg?s=612x612&w=is&k=20&c=Iyl6OKnZWteIZ2V59XRMg3ZZFgblvyE4Xqgr8jDDsMk=',
    cookTime: '40 mins',
    rating: 4.5,
    reviews: 543,
    difficulty: 'Easy',
    cuisine: 'Punjabi',
    tags: ['Comfort Food', 'Protein Rich'],
    description: 'Hearty kidney bean curry served with steamed basmati rice',
    ingredients: [
      '2 cups Rajma (kidney beans)',
      '1 large Onion',
      '2 Tomatoes',
      '1 tbsp Ginger-garlic paste',
      '2 tsp Rajma masala',
      '1 tsp Cumin seeds',
      '2 tbsp Oil',
      'Fresh coriander',
      '2 cups Basmati rice',
      '1 tsp Salt'
    ],
    steps: [
      'Soak rajma overnight or for 8 hours.',
      'Pressure cook rajma until soft and tender.',
      'Sauté cumin seeds in hot oil until they crackle.',
      'Add onions and cook until golden brown.',
      'Add ginger-garlic paste and tomatoes, cook until soft.',
      'Mix in rajma masala and cooked rajma.',
      'Simmer for 15-20 minutes until flavors blend.',
      'Cook basmati rice separately.',
      'Garnish with fresh coriander and serve with rice.'
    ],
    servings: 4
  },
  {
    id: 5,
    name: 'Paneer Tikka',
    image: 'https://images.unsplash.com/photo-1701579231320-cc2f7acad3cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFuZWVyJTIwdGlra2F8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1000',
    cookTime: '25 mins',
    rating: 4.7,
    reviews: 789,
    difficulty: 'Easy',
    cuisine: 'North Indian',
    tags: ['Vegetarian', 'Grilled'],
    description: 'Marinated cottage cheese cubes grilled to perfection',
    ingredients: [
      '400g Paneer cubes',
      '1 cup Yogurt',
      '2 tbsp Tikka masala',
      '1 tbsp Ginger-garlic paste',
      '1 Bell pepper',
      '1 Onion',
      '2 tbsp Lemon juice',
      '1 tsp Chat masala',
      '2 tbsp Oil',
      'Salt to taste'
    ],
    steps: [
      'Cut paneer, bell peppers, and onions into cubes.',
      'Mix yogurt with tikka masala and ginger-garlic paste.',
      'Marinate paneer and vegetables for 2 hours.',
      'Skewer the marinated paneer and vegetables.',
      'Brush with oil and grill until slightly charred.',
      'Turn occasionally for even cooking.',
      'Sprinkle chat masala and lemon juice before serving.',
      'Serve hot with mint chutney.'
    ],
    servings: 4
  },
  {
    id: 6,
    name: 'Samosa',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftb3NhfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=1000',
    cookTime: '35 mins',
    rating: 4.6,
    reviews: 1023,
    difficulty: 'Medium',
    cuisine: 'Street Food',
    tags: ['Snack', 'Crispy'],
    description: 'Golden triangular pastries filled with spiced potatoes and peas',
    ingredients: [
      '2 cups All-purpose flour',
      '4 large Potatoes',
      '1/2 cup Green peas',
      '1 tsp Cumin seeds',
      '1 tbsp Coriander powder',
      '1 tsp Amchur powder',
      'Oil for frying',
      '1 tsp Ajwain (carom seeds)',
      '2 Green chilies',
      'Fresh coriander'
    ],
    steps: [
      'Boil and mash potatoes for the filling.',
      'Prepare dough with flour, ajwain, and oil.',
      'Sauté cumin seeds, green chilies, and spices.',
      'Add peas and mashed potatoes, mix well.',
      'Roll dough into circles and cut in half.',
      'Form cones and fill with potato mixture.',
      'Seal edges properly to form triangles.',
      'Deep fry until golden brown and crispy.',
      'Serve hot with tamarind chutney.'
    ],
    servings: 6
  }
];

interface FeaturedRecipesProps {
  onViewAllRecipes: () => void;
}

interface RecipeModalProps {
  recipe: typeof featuredRecipes[0];
  isOpen: boolean;
  onClose: () => void;
}

// API configuration
const API_BASE_URL = 'http://localhost:8000';

function RecipeModal({ recipe, isOpen, onClose }: RecipeModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with small rounded image icon */}
        <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ImageWithFallback
                src={recipe.image}
                alt={recipe.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200 shadow-sm"
                fallbackSrc="/recipe-placeholder.jpg"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{recipe.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 ml-4 bg-white hover:bg-gray-100 border border-gray-200"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Recipe Info */}
            <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-y border-gray-200">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <div className="text-xs text-gray-500 mb-1">Cook Time</div>
                <div className="font-semibold text-sm">{recipe.cookTime}</div>
              </div>
              <div className="text-center">
                <Users className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                <div className="text-xs text-gray-500 mb-1">Servings</div>
                <div className="font-semibold text-sm">{recipe.servings}</div>
              </div>
              <div className="text-center">
                <Star className="h-5 w-5 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                <div className="text-xs text-gray-500 mb-1">Rating</div>
                <div className="font-semibold text-sm">{recipe.rating} ({recipe.reviews})</div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients</h3>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-sm leading-relaxed">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Steps</h3>
                <ol className="space-y-4">
                  {recipe.steps.map((step, index) => (
                    <li key={index} className="flex text-gray-700">
                      <span className="font-semibold text-primary mr-3 flex-shrink-0 min-w-6">{index + 1}.</span>
                      <span className="text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Tags and Difficulty */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-primary border-primary text-xs">
                  {recipe.cuisine}
                </Badge>
                <Badge className={`text-xs ${
                  recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {recipe.difficulty}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedRecipes({ onViewAllRecipes }: FeaturedRecipesProps) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<typeof featuredRecipes[0] | null>(null);
  const [favoriteLoading, setFavoriteLoading] = useState<number | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  // Get current user from localStorage
  const getCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.user_id ? user : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  };

  // Get CSRF token for Django
  const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };

  // Fetch user's favorite recipes
  const fetchFavoriteRecipes = async () => {
    const user = getCurrentUser();
    if (!user) {
      console.log('❌ No user found for fetching favorites');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${user.user_id}/`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const favoriteIds = data.favorites.map((fav: any) => fav.recipe_id);
          setFavorites(favoriteIds);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching favorite recipes:', error);
    }
  };

  // Add recipe to favorites
  const addToFavoritesAPI = async (recipeId: number) => {
    const user = getCurrentUser();
    if (!user) {
      setFavoriteError('Please log in to add favorites');
      return false;
    }

    try {
      setFavoriteLoading(recipeId);
      setFavoriteError(null);
      
      const payload = {
        user_id: user.user_id,
        recipe_id: recipeId
      };

      const response = await fetch(`${API_BASE_URL}/favorites/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setFavorites(prev => [...prev, recipeId]);
          return true;
        } else {
          const errorMsg = data.message || data.error || 'Failed to add to favorites';
          setFavoriteError(errorMsg);
          return false;
        }
      } else {
        const errorText = await response.text();
        setFavoriteError(`Server error: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error adding to favorites:', error);
      setFavoriteError('Network error: Could not connect to server');
      return false;
    } finally {
      setFavoriteLoading(null);
    }
  };

  // Remove recipe from favorites
  const removeFromFavoritesAPI = async (recipeId: number) => {
    const user = getCurrentUser();
    if (!user) {
      setFavoriteError('Please log in to manage favorites');
      return false;
    }

    try {
      setFavoriteLoading(recipeId);
      setFavoriteError(null);
      
      const response = await fetch(`${API_BASE_URL}/favorites/${user.user_id}/${recipeId}/remove/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setFavorites(prev => prev.filter(id => id !== recipeId));
          return true;
        } else {
          const errorMsg = data.message || data.error || 'Failed to remove from favorites';
          setFavoriteError(errorMsg);
          return false;
        }
      } else {
        const errorText = await response.text();
        setFavoriteError(`Server error: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Network error removing from favorites:', error);
      setFavoriteError('Network error: Could not connect to server');
      return false;
    } finally {
      setFavoriteLoading(null);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (recipeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (favorites.includes(recipeId)) {
      await removeFromFavoritesAPI(recipeId);
    } else {
      await addToFavoritesAPI(recipeId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewRecipe = (recipe: typeof featuredRecipes[0]) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseModal = () => {
    setSelectedRecipe(null);
  };

  // Clear favorite error after 5 seconds
  useEffect(() => {
    if (favoriteError) {
      const timer = setTimeout(() => {
        setFavoriteError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [favoriteError]);

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavoriteRecipes();
  }, []);

  return (
    <>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Indian Recipes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most loved recipes, handpicked for their authentic flavors and easy preparation
            </p>
          </div>

          {/* Error Alert */}
          {favoriteError && (
            <Alert className="max-w-2xl mx-auto mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800">
                {favoriteError}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white"
                    onClick={(e) => toggleFavorite(recipe.id, e)}
                    disabled={favoriteLoading === recipe.id}
                  >
                    {favoriteLoading === recipe.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <Heart className={`h-4 w-4 ${favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    )}
                  </Button>
                  <div className="absolute bottom-3 left-3">
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                      <p className="text-gray-600 text-sm">{recipe.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{recipe.rating}</span>
                        <span className="text-gray-500 text-sm">({recipe.reviews})</span>
                      </div>
                      <Badge variant="outline" className="text-primary border-primary">
                        {recipe.cuisine}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8" onClick={onViewAllRecipes}>
              View All Recipes
            </Button>
          </div>
        </div>
      </section>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          isOpen={!!selectedRecipe}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}