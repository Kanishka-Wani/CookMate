import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

const ingredientCategories = {
  spices: [
    { name: 'Turmeric', hindi: 'Haldi', benefits: 'Anti-inflammatory, antioxidant', image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc647?w=400' },
    { name: 'Cumin', hindi: 'Jeera', benefits: 'Aids digestion, iron-rich', image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee15e32?w=400' },
    { name: 'Coriander', hindi: 'Dhania', benefits: 'Lowers blood sugar, rich in antioxidants', image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=400' },
    { name: 'Cardamom', hindi: 'Elaichi', benefits: 'Improves breath, digestive aid', image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc647?w=400' },
    { name: 'Garam Masala', hindi: 'Garam Masala', benefits: 'Blend of warming spices', image: 'https://images.unsplash.com/photo-1596040033229-a0b55ee15e32?w=400' },
    { name: 'Cinnamon', hindi: 'Dalchini', benefits: 'Regulates blood sugar', image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?w=400' },
  ],
  vegetables: [
    { name: 'Onions', hindi: 'Pyaz', benefits: 'Heart health, vitamin C', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400' },
    { name: 'Tomatoes', hindi: 'Tamatar', benefits: 'Lycopene, vitamin C', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400' },
    { name: 'Spinach', hindi: 'Palak', benefits: 'Iron-rich, vitamins A, C, K', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400' },
    { name: 'Cauliflower', hindi: 'Phool Gobi', benefits: 'High fiber, vitamin C', image: 'https://images.unsplash.com/photo-1568584711271-0282db8f04c2?w=400' },
    { name: 'Okra', hindi: 'Bhindi', benefits: 'Good for diabetes, fiber-rich', image: 'https://images.unsplash.com/photo-1599822258186-9c3e0dbc9a09?w=400' },
    { name: 'Potatoes', hindi: 'Aloo', benefits: 'Energy source, potassium', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400' },
  ],
  lentils: [
    { name: 'Red Lentils', hindi: 'Masoor Dal', benefits: 'High protein, quick cooking', image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=400' },
    { name: 'Yellow Lentils', hindi: 'Toor Dal', benefits: 'Rich in folic acid', image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=400' },
    { name: 'Green Lentils', hindi: 'Moong Dal', benefits: 'Easy to digest, protein-rich', image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=400' },
    { name: 'Chickpeas', hindi: 'Chana', benefits: 'Protein, fiber, iron', image: 'https://images.unsplash.com/photo-1608197963990-1d93e6c434d3?w=400' },
    { name: 'Black Lentils', hindi: 'Urad Dal', benefits: 'Iron, magnesium, potassium', image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=400' },
    { name: 'Kidney Beans', hindi: 'Rajma', benefits: 'High protein, fiber', image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?w=400' },
  ],
  grains: [
    { name: 'Basmati Rice', hindi: 'Basmati Chawal', benefits: 'Aromatic, low GI', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
    { name: 'Wheat Flour', hindi: 'Atta', benefits: 'Fiber-rich, whole grain', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
    { name: 'Semolina', hindi: 'Sooji', benefits: 'Energy source, B vitamins', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
    { name: 'Rice Flour', hindi: 'Chawal ka Atta', benefits: 'Gluten-free', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400' },
  ],
  dairy: [
    { name: 'Paneer', hindi: 'Paneer', benefits: 'High protein, calcium', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400' },
    { name: 'Yogurt', hindi: 'Dahi', benefits: 'Probiotics, calcium', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400' },
    { name: 'Ghee', hindi: 'Ghee', benefits: 'Healthy fats, vitamins', image: 'https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=400' },
    { name: 'Milk', hindi: 'Doodh', benefits: 'Calcium, vitamin D', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
  ],
};

export function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ingredientCategories>('spices');

  const filteredIngredients = ingredientCategories[selectedCategory].filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ingredient.hindi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Indian Ingredients Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore the rich variety of Indian ingredients, their benefits, and how to use them in your cooking
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search ingredients by English or Hindi name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg rounded-xl"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as keyof typeof ingredientCategories)}>
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-12">
            <TabsTrigger value="spices">Spices</TabsTrigger>
            <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
            <TabsTrigger value="lentils">Lentils</TabsTrigger>
            <TabsTrigger value="grains">Grains</TabsTrigger>
            <TabsTrigger value="dairy">Dairy</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIngredients.map((ingredient) => (
                <Card key={ingredient.name} className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <ImageWithFallback
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{ingredient.name}</h3>
                        <p className="text-sm text-gray-500">{ingredient.hindi}</p>
                      </div>
                      <div>
                        <Badge variant="secondary" className="mb-2">Health Benefits</Badge>
                        <p className="text-gray-600">{ingredient.benefits}</p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          View Recipes
                        </Button>
                        <Button size="sm" className="flex-1">
                          Add to List
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredIngredients.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No ingredients found matching your search.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Info Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">🌿</div>
            <h3 className="font-semibold mb-2">Fresh & Organic</h3>
            <p className="text-sm text-gray-600">Learn about choosing the best quality ingredients</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">💚</div>
            <h3 className="font-semibold mb-2">Health Benefits</h3>
            <p className="text-sm text-gray-600">Discover the nutritional value of each ingredient</p>
          </Card>
          <Card className="text-center p-6">
            <div className="text-4xl mb-4">📖</div>
            <h3 className="font-semibold mb-2">Cooking Tips</h3>
            <p className="text-sm text-gray-600">Get expert advice on preparation and storage</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
