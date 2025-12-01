import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

const indianIngredients = [
  'Turmeric', 'Cumin', 'Coriander', 'Garam Masala', 'Cardamom', 'Cinnamon',
  'Basmati Rice', 'Lentils', 'Chickpeas', 'Paneer', 'Yogurt', 'Coconut',
  'Onions', 'Tomatoes', 'Ginger', 'Garlic', 'Green Chilies', 'Curry Leaves',
  'Mustard Seeds', 'Fenugreek', 'Spinach', 'Potatoes', 'Cauliflower', 'Okra'
];

interface RecipeSearchProps {
  onSearch: (ingredients: string[]) => void;
}

export function RecipeSearch({ onSearch }: RecipeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredIngredients = indianIngredients.filter(ingredient =>
    ingredient.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedIngredients.includes(ingredient)
  );

  const addIngredient = (ingredient: string) => {
    setSelectedIngredients([...selectedIngredients, ingredient]);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const handleFindRecipes = () => {
    onSearch(selectedIngredients);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Find Recipes with Your Ingredients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us what you have, and we'll suggest delicious Indian recipes you can make right now
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardContent className="p-8">
            {/* Ingredient Search */}
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 z-10" />
                  <Input
                    placeholder="Add ingredients you have (e.g., tomatoes, onions, spices...)"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowSuggestions(searchQuery.length > 0)}
                    className="pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary"
                  />
                </div>

                {/* Ingredient Suggestions */}
                {showSuggestions && filteredIngredients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-60 overflow-y-auto">
                    {filteredIngredients.slice(0, 8).map((ingredient) => (
                      <button
                        key={ingredient}
                        onClick={() => addIngredient(ingredient)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                      >
                        {ingredient}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Ingredients */}
              {selectedIngredients.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-700">Your Ingredients:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((ingredient) => (
                      <Badge
                        key={ingredient}
                        variant="secondary"
                        className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer"
                        onClick={() => removeIngredient(ingredient)}
                      >
                        {ingredient}
                        <X className="ml-2 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-center">
                <Button 
                  size="lg" 
                  className="px-12 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handleFindRecipes}
                  disabled={selectedIngredients.length === 0}
                >
                  <Search className="mr-2 h-5 w-5" />
                  Find Recipes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Ingredient Categories */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-6">Popular Indian Ingredients</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {indianIngredients.slice(0, 12).map((ingredient) => (
              <Button
                key={ingredient}
                variant="outline"
                onClick={() => addIngredient(ingredient)}
                className="h-auto py-3 px-4 text-sm border-gray-300 hover:border-primary hover:text-primary transition-colors"
                disabled={selectedIngredients.includes(ingredient)}
              >
                {ingredient}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
