import { useState } from 'react';
import { RefreshCw, Clock, Utensils, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

const mealSuggestions = {
  breakfast: [
    {
      name: 'Masala Paratha',
      image: 'https://images.unsplash.com/photo-1676138937651-b6f7751b2a91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjByb3RpJTIwYnJlYWQlMjBuYWFufGVufDF8fHx8MTc1ODk5MDMwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '20 mins',
      calories: 320,
      description: 'Spiced flatbread with yogurt and pickle'
    },
    {
      name: 'Poha',
      image: 'https://images.unsplash.com/photo-1633881614907-8587c9b93c2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzcGljZXMlMjB0dXJtZXJpYyUyMGN1cnJ5fGVufDF8fHx8MTc1ODk5MDMwNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '15 mins',
      calories: 250,
      description: 'Flattened rice with peanuts and spices'
    }
  ],
  lunch: [
    {
      name: 'Dal Tadka & Rice',
      image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkYWwlMjBjdXJyeSUyMGxlbnRpbHN8ZW58MXx8fHwxNzU4OTg3NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '35 mins',
      calories: 450,
      description: 'Tempered lentils with basmati rice'
    },
    {
      name: 'Chole Bhature',
      image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBiaXJ5YW5pJTIwcmljZSUyMGRpc2h8ZW58MXx8fHwxNzU4OTkwMzA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '45 mins',
      calories: 550,
      description: 'Spicy chickpeas with fried bread'
    }
  ],
  dinner: [
    {
      name: 'Paneer Makhani',
      image: 'https://images.unsplash.com/photo-1627366422957-3efa9c6df0fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBkYWwlMjBjdXJyeSUyMGxlbnRpbHN8ZW58MXx8fHwxNzU4OTg3NTc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '40 mins',
      calories: 480,
      description: 'Creamy cottage cheese in tomato gravy'
    },
    {
      name: 'Jeera Rice & Raita',
      image: 'https://images.unsplash.com/photo-1666190092689-e3968aa0c32c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBiaXJ5YW5pJTIwcmljZSUyMGRpc2h8ZW58MXx8fHwxNzU4OTkwMzA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      time: '25 mins',
      calories: 380,
      description: 'Cumin rice with cooling yogurt side'
    }
  ]
};

const personalizedTips = [
  "Based on your preferences, try adding more protein to your breakfast",
  "You seem to love spicy food! Here are some extra heat suggestions",
  "Your recent searches show interest in healthy options",
  "Perfect weather for comfort food today!"
];

export function MealSuggestions() {
  const [selectedMeal, setSelectedMeal] = useState<keyof typeof mealSuggestions>('lunch');
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshSuggestions = () => {
    setRefreshKey(prev => prev + 1);
  };

  const currentTip = personalizedTips[refreshKey % personalizedTips.length];

  return (
    <section className="py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <h2 className="text-4xl font-bold text-gray-900">
              Your Personalized Meal Suggestions
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-powered recommendations based on your taste preferences, available ingredients, and dietary goals
          </p>
        </div>

        {/* Personalized Tip */}
        <Card className="max-w-3xl mx-auto mb-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Personal Insight</h3>
                <p className="text-gray-600">{currentTip}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshSuggestions}
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meal Type Selector */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white p-2 rounded-xl shadow-md border">
            {Object.keys(mealSuggestions).map((meal) => (
              <Button
                key={meal}
                variant={selectedMeal === meal ? "default" : "ghost"}
                onClick={() => setSelectedMeal(meal as keyof typeof mealSuggestions)}
                className={`px-6 py-2 rounded-lg capitalize ${
                  selectedMeal === meal ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
                }`}
              >
                <Utensils className="mr-2 h-4 w-4" />
                {meal}
              </Button>
            ))}
          </div>
        </div>

        {/* Meal Suggestions Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {mealSuggestions[selectedMeal].map((meal, index) => (
            <Card key={`${meal.name}-${refreshKey}`} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="relative overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={meal.image}
                  alt={meal.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/90 text-gray-900">
                    {meal.calories} cal
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{meal.name}</h3>
                    <p className="text-gray-600">{meal.description}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{meal.time}</span>
                    </div>
                    <Badge variant="outline" className="text-primary border-primary">
                      Quick & Easy
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      Cook Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Save for Later
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Meal Plan CTA */}
        <Card className="max-w-3xl mx-auto mt-12 bg-gradient-to-r from-primary to-accent text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Want a Complete Weekly Meal Plan?</h3>
            <p className="text-primary-foreground/90 mb-6">
              Get personalized meal plans that balance nutrition, taste, and your cooking schedule
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-100">
              Create My Meal Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}