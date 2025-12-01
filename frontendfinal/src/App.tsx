import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LoginDialog } from './components/LoginDialog';
import { RecipeSearch } from './components/RecipeSearch';
import { FeaturedRecipes } from './components/FeaturedRecipes';

import { UserProfile } from './components/UserProfile';
import { Testimonials } from './components/Testimonials';
import { Newsletter } from './components/Newsletter';
import { Footer } from './components/Footer';
import { RecipesPage } from './components/RecipesPage';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { AddRecipe } from './components/AddRecipe';
import { IngredientsPage } from './components/IngredientsPage';
import { RecipeRecommenderPage } from './components/RecipeRecommenderPage';
import { AboutPage } from './components/AboutPage';
import { SubstitutePage } from './components/SubstitutePage';
import { FavoritesPage } from './components/FavoritesPage';
import { RecipeProvider } from './components/RecipeContext';
import { AuthProvider, useAuth } from './components/AuthContext';

function AppContent() {
  const { isLoggedIn, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<string[]>([]);

  // Protected pages that require authentication
  const protectedPages = ['recipes', 'add-recipe', 'recipe-recommender', 'recipe-detail', 'favorites', 'substitute'];

  const handleGetStarted = () => {
    setIsLoginOpen(true);
  };

  const handleProfileClick = () => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
    } else {
      setIsProfileOpen(true);
    }
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: string) => {
    // Check if page requires authentication
    if (protectedPages.includes(page) && !isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    setCurrentPage(page);
    setRecipeIngredients([]); // Clear ingredients when navigating normally
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRecipeSearch = (ingredients: string[]) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    setRecipeIngredients(ingredients);
    setCurrentPage('recipe-recommender');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRecipe = (recipeId: number) => {
    if (!isLoggedIn) {
      setIsLoginOpen(true);
      return;
    }
    setSelectedRecipeId(recipeId);
    setCurrentPage('recipe-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromRecipeDetail = () => {
    setCurrentPage('recipes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <>
            <Hero onGetStartedClick={handleGetStarted} />
            <RecipeSearch onSearch={handleRecipeSearch} />
            <FeaturedRecipes onViewAllRecipes={() => handleNavigate('recipes')} />
           
            <Testimonials />
            <Newsletter />
          </>
        );
      case 'recipes':
        return isLoggedIn ? <RecipesPage filters={null} onViewRecipe={handleViewRecipe} /> : null;
      case 'add-recipe':
        return isLoggedIn ? <AddRecipe onRecipeAdded={() => handleNavigate('recipes')} /> : null;
      case 'recipe-recommender':
        return isLoggedIn ? <RecipeRecommenderPage initialIngredients={recipeIngredients} /> : null;
      case 'recipe-detail':
        return isLoggedIn && selectedRecipeId ? <RecipeDetailPage recipeId={selectedRecipeId} onBack={handleBackFromRecipeDetail} /> : null;
      case 'substitute':
        return isLoggedIn ? <SubstitutePage /> : null;
      case 'favorites':
        return isLoggedIn ? <FavoritesPage onViewRecipe={handleViewRecipe} /> : null;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <>
            <Hero onGetStartedClick={handleGetStarted} />
            <RecipeSearch onSearch={handleRecipeSearch} />
            <FeaturedRecipes onViewAllRecipes={() => handleNavigate('recipes')} />
          
            <Testimonials />
            <Newsletter />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onProfileClick={handleProfileClick}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      <main>
        {renderPage()}
      </main>

      <Footer onNavigate={handleNavigate} />

      {/* Dialogs */}
      <LoginDialog 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
      />
      <UserProfile 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RecipeProvider>
        <AppContent />
      </RecipeProvider>
    </AuthProvider>
  );
}