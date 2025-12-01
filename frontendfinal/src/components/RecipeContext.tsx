import { createContext, useContext, useState, ReactNode } from 'react';

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

interface RecipeContextType {
  favorites: number[];
  userRecipes: Recipe[];
  addToFavorites: (recipeId: number) => void;
  removeFromFavorites: (recipeId: number) => void;
  isFavorite: (recipeId: number) => boolean;
  addUserRecipe: (recipe: Recipe) => void;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);

  const addToFavorites = (recipeId: number) => {
    setFavorites(prev => {
      if (!prev.includes(recipeId)) {
        return [...prev, recipeId];
      }
      return prev;
    });
  };

  const removeFromFavorites = (recipeId: number) => {
    setFavorites(prev => prev.filter(id => id !== recipeId));
  };

  const isFavorite = (recipeId: number) => {
    return favorites.includes(recipeId);
  };

  const addUserRecipe = (recipe: Recipe) => {
    setUserRecipes(prev => [...prev, recipe]);
  };

  return (
    <RecipeContext.Provider
      value={{
        favorites,
        userRecipes,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        addUserRecipe,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipeContext() {
  const context = useContext(RecipeContext);
  if (context === undefined) {
    throw new Error('useRecipeContext must be used within a RecipeProvider');
  }
  return context;
}
