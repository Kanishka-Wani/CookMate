import { Heart, Clock, Users, Star, ChefHat } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useRecipeContext } from './RecipeContext';

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

// Same recipe data from RecipesPage
const allRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Masala Dosa',
    image: 'https://images.unsplash.com/photo-1640720707320-af5502f2a3f5?w=800',
    category: 'breakfast',
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 245,
    cuisine: 'South Indian',
    description: 'Crispy rice crepe filled with spiced potato mixture',
    tags: ['Vegetarian', 'Popular', 'Traditional'],
  },
  {
    id: 2,
    name: 'Poha',
    image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=800',
    category: 'breakfast',
    cookTime: 15,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 189,
    cuisine: 'Maharashtrian',
    description: 'Flattened rice cooked with onions, peanuts and spices',
    tags: ['Vegetarian', 'Quick', 'Light'],
  },
  {
    id: 3,
    name: 'Aloo Paratha',
    image: 'https://images.unsplash.com/photo-1676138937651-b6f7751b2a91?w=800',
    category: 'breakfast',
    cookTime: 25,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 312,
    cuisine: 'Punjabi',
    description: 'Whole wheat bread stuffed with spiced potato filling',
    tags: ['Vegetarian', 'Filling', 'Popular'],
  },
  {
    id: 4,
    name: 'Idli Sambar',
    image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=800',
    category: 'breakfast',
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 278,
    cuisine: 'South Indian',
    description: 'Steamed rice cakes served with lentil-based vegetable stew',
    tags: ['Vegetarian', 'Healthy', 'Protein-rich'],
  },
  {
    id: 5,
    name: 'Upma',
    image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=800',
    category: 'breakfast',
    cookTime: 20,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 156,
    cuisine: 'South Indian',
    description: 'Savory semolina porridge with vegetables and spices',
    tags: ['Vegetarian', 'Quick', 'Nutritious'],
  },
  {
    id: 6,
    name: 'Puri Bhaji',
    image: 'https://images.unsplash.com/photo-1676138937651-b6f7751b2a91?w=800',
    category: 'breakfast',
    cookTime: 35,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 198,
    cuisine: 'North Indian',
    description: 'Deep-fried bread with spiced potato curry',
    tags: ['Vegetarian', 'Festive', 'Indulgent'],
  },
  {
    id: 7,
    name: 'Dal Tadka',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'lunch',
    cookTime: 35,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 423,
    cuisine: 'North Indian',
    description: 'Yellow lentils tempered with aromatic spices',
    tags: ['Vegetarian', 'Protein-rich', 'Comfort Food'],
  },
  {
    id: 8,
    name: 'Chole Bhature',
    image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=800',
    category: 'lunch',
    cookTime: 45,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 567,
    cuisine: 'Punjabi',
    description: 'Spicy chickpea curry with fluffy fried bread',
    tags: ['Vegetarian', 'Popular', 'Street Food'],
  },
  {
    id: 9,
    name: 'Biryani',
    image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=800',
    category: 'lunch',
    cookTime: 60,
    servings: 6,
    difficulty: 'Hard',
    rating: 4.9,
    reviews: 789,
    cuisine: 'Hyderabadi',
    description: 'Fragrant rice dish with vegetables and aromatic spices',
    tags: ['Vegetarian', 'Festive', 'Aromatic'],
  },
  {
    id: 10,
    name: 'Rajma Chawal',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'lunch',
    cookTime: 40,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 345,
    cuisine: 'Punjabi',
    description: 'Kidney beans curry served with steamed rice',
    tags: ['Vegetarian', 'Protein-rich', 'Comfort Food'],
  },
  {
    id: 11,
    name: 'Paneer Tikka Masala',
    image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=800',
    category: 'lunch',
    cookTime: 35,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.8,
    reviews: 456,
    cuisine: 'North Indian',
    description: 'Grilled cottage cheese in rich tomato cream sauce',
    tags: ['Vegetarian', 'Rich', 'Popular'],
  },
  {
    id: 12,
    name: 'Sambhar Rice',
    image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=800',
    category: 'lunch',
    cookTime: 30,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 234,
    cuisine: 'South Indian',
    description: 'Rice mixed with tangy lentil-vegetable stew',
    tags: ['Vegetarian', 'Nutritious', 'One-pot'],
  },
  {
    id: 13,
    name: 'Palak Paneer',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'dinner',
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 389,
    cuisine: 'North Indian',
    description: 'Cottage cheese cubes in creamy spinach gravy',
    tags: ['Vegetarian', 'Healthy', 'Iron-rich'],
  },
  {
    id: 14,
    name: 'Butter Chicken',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'dinner',
    cookTime: 45,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 678,
    cuisine: 'Punjabi',
    description: 'Tender chicken in rich tomato-butter gravy',
    tags: ['Non-Vegetarian', 'Popular', 'Creamy'],
  },
  {
    id: 15,
    name: 'Kadhi Pakora',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'dinner',
    cookTime: 35,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.6,
    reviews: 267,
    cuisine: 'Punjabi',
    description: 'Yogurt-based curry with gram flour fritters',
    tags: ['Vegetarian', 'Tangy', 'Comfort Food'],
  },
  {
    id: 16,
    name: 'Khichdi',
    image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?w=800',
    category: 'dinner',
    cookTime: 25,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.5,
    reviews: 198,
    cuisine: 'Pan-Indian',
    description: 'Comforting one-pot rice and lentil dish',
    tags: ['Vegetarian', 'Light', 'Easy to digest'],
  },
  {
    id: 17,
    name: 'Malai Kofta',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'dinner',
    cookTime: 40,
    servings: 4,
    difficulty: 'Hard',
    rating: 4.8,
    reviews: 412,
    cuisine: 'North Indian',
    description: 'Fried vegetable dumplings in creamy gravy',
    tags: ['Vegetarian', 'Rich', 'Festive'],
  },
  {
    id: 18,
    name: 'Dal Makhani',
    image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=800',
    category: 'dinner',
    cookTime: 50,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.9,
    reviews: 534,
    cuisine: 'Punjabi',
    description: 'Creamy black lentils slow-cooked with butter and cream',
    tags: ['Vegetarian', 'Rich', 'Popular'],
  },
  {
    id: 19,
    name: 'Masala Chai',
    image: 'https://images.unsplash.com/photo-1597318281699-17e2b52bfa4f?w=800',
    category: 'beverages',
    cookTime: 10,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.9,
    reviews: 892,
    cuisine: 'Pan-Indian',
    description: 'Spiced tea with milk, ginger and aromatic spices',
    tags: ['Vegetarian', 'Quick', 'Energizing'],
  },
  {
    id: 20,
    name: 'Mango Lassi',
    image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800',
    category: 'beverages',
    cookTime: 5,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 456,
    cuisine: 'Punjabi',
    description: 'Sweet and creamy mango yogurt drink',
    tags: ['Vegetarian', 'Refreshing', 'Summer Special'],
  },
  {
    id: 21,
    name: 'Jaljeera',
    image: 'https://images.unsplash.com/photo-1562159278-1253a58da141?w=800',
    category: 'beverages',
    cookTime: 5,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.6,
    reviews: 234,
    cuisine: 'North Indian',
    description: 'Tangy cumin-flavored refreshing drink',
    tags: ['Vegetarian', 'Digestive', 'Cooling'],
  },
  {
    id: 22,
    name: 'Badam Milk',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
    category: 'beverages',
    cookTime: 10,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.7,
    reviews: 178,
    cuisine: 'South Indian',
    description: 'Warm almond-flavored milk with saffron',
    tags: ['Vegetarian', 'Nutritious', 'Comforting'],
  },
  {
    id: 23,
    name: 'Nimbu Pani',
    image: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9c?w=800',
    category: 'beverages',
    cookTime: 5,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.8,
    reviews: 567,
    cuisine: 'Pan-Indian',
    description: 'Sweet and tangy lemonade with mint',
    tags: ['Vegetarian', 'Refreshing', 'Hydrating'],
  },
  {
    id: 24,
    name: 'Thandai',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
    category: 'beverages',
    cookTime: 15,
    servings: 4,
    difficulty: 'Medium',
    rating: 4.7,
    reviews: 289,
    cuisine: 'North Indian',
    description: 'Festive milk drink with nuts and spices',
    tags: ['Vegetarian', 'Festive', 'Cooling'],
  },
];

interface FavoritesPageProps {
  onViewRecipe: (recipeId: number) => void;
}

export function FavoritesPage({ onViewRecipe }: FavoritesPageProps) {
  const { favorites, removeFromFavorites } = useRecipeContext();

  const favoriteRecipes = allRecipes.filter(recipe => favorites.includes(recipe.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-red-100 rounded-full mb-4">
            <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My Favorite Recipes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {favoriteRecipes.length > 0
              ? `You have ${favoriteRecipes.length} favorite ${favoriteRecipes.length === 1 ? 'recipe' : 'recipes'}`
              : 'Start adding recipes to your favorites'}
          </p>
        </div>

        {favoriteRecipes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {favoriteRecipes.map((recipe) => (
              <Card key={recipe.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => removeFromFavorites(recipe.id)}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
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
                      <div className="mb-2">
                        <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                          {recipe.cuisine}
                        </Badge>
                      </div>
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
                        <span>{recipe.rating}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => onViewRecipe(recipe.id)}>
                      <ChefHat className="mr-2 h-4 w-4" />
                      View Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start exploring recipes and click the heart icon to add them to your favorites
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
