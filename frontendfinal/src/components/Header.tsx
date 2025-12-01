import { useState, useEffect } from 'react';
import { Search, Menu, User, Heart, ChefHat } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

interface HeaderProps {
  onProfileClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  isLoggedIn: boolean;
  onLogout: () => void;
}

interface TrendingRecipe {
  id: string;
  name: string;
  image: string;
}

export function Header({ onProfileClick, onNavigate, currentPage, isLoggedIn, onLogout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [trendingRecipes, setTrendingRecipes] = useState<TrendingRecipe[]>([]);

  // Indian trending recipes data
  const indianTrendingRecipes: TrendingRecipe[] = [
    {
      id: '1',
      name: 'Thalipeeth',
      image: 'https://media.istockphoto.com/id/1292639177/photo/thalipith-or-thalipeeth-maharashtrian-popular-nutritious-breakfast-isolated-over-a-rustic.jpg?s=612x612&w=0&k=20&c=9HiSC7Ybn2QVA-MZXRTbP9iMwy0loWVesMTnh6JjAZo='
    },
    {
      id: '2',
      name: 'Biryani',
      image: 'https://media.istockphoto.com/id/179085494/photo/indian-biryani.webp?a=1&b=1&s=612x612&w=0&k=20&c=zD6tz_tDHPEbH7b6xNVW4cxMSGfr-9ZoY2Xb8eN6njw='
    },
    {
      id: '3',
      name: 'Masala Dosa',
      image: 'https://media.istockphoto.com/id/2216057377/photo/crispy-masala-dosa-is-a-popular-south-indian-food-served-with-tomato-chutney-coconut-chutney.webp?a=1&b=1&s=612x612&w=0&k=20&c=8SaUhum5eLU1_l_mf25xm7UvNhAdHElu8DPmiQHk8oE='
    },
    {
      id: '4',
      name: 'Palak Paneer',
      image: 'https://media.istockphoto.com/id/1396307254/photo/palak-paneer-and-tandoori-roti.webp?a=1&b=1&s=612x612&w=0&k=20&c=5e6n78Omg9aseW1otwiOFMovF5EaZqfjmu5-V0lIfWw='
    },
    {
      id: '5',
      name: 'Chana masala',
      image: 'https://media.istockphoto.com/id/1097478652/photo/vegan-chana-alu-masala.webp?a=1&b=1&s=612x612&w=0&k=20&c=p4odO_q5VWK7ygBv7U8g1a4iApRrApuYu1v67gpYP3E='
    },
    {
      id: '6',
      name: 'Kaju curry',
      image: 'https://media.istockphoto.com/id/1079577284/photo/cashew-curry-indian-kaju-masala-served-in-a-bowl-or-pan-selective-focus.webp?a=1&b=1&s=612x612&w=0&k=20&c=Qknh0beDIcVBhch5JbKpFZYeCZ39O34-jNqcsBdM4XA='
    },
    {
      id: '7',
      name: 'Rice Kheer',
      image: 'https://media.istockphoto.com/id/1453999382/photo/jhangore-ki-kheer.webp?a=1&b=1&s=612x612&w=0&k=20&c=ZKfcvqfbRZKAAtIaG8dacTEUdzjNJ7crRKgAUBCzyPo='
    },
    {
      id: '8',
      name: 'Soft Idli',
      image: 'https://media.istockphoto.com/id/2199487424/photo/soft-and-fluffy-south-indian-idli.webp?a=1&b=1&s=612x612&w=0&k=20&c=QVM5hC4cC9S0T6KvOe8qauf5j-w67dMW28KmcnAMoSo='
    },
    {
      id: '9',
      name: 'Dhokla',
      image: 'https://media.istockphoto.com/id/1322884670/photo/indian-food.jpg?s=612x612&w=0&k=20&c=6_UgfU9Wry7nj8szQQweuxKOORBXEWzBMjQVUR-f-YA='
    },
    {
      id: '10',
      name: 'Aloo Paratha',
      image: 'https://media.istockphoto.com/id/1418692758/photo/north-indian-famous-food-aloo-paratha-with-mango-pickle-and-butter.webp?a=1&b=1&s=612x612&w=0&k=20&c=Rq02SWwsR23m-mYUHW8_hjS89sl4PdJmzrSNqjKFsKg='
    }
  ];

  useEffect(() => {
    // Filter trending recipes based on search query
    if (searchQuery.trim()) {
      const filtered = indianTrendingRecipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTrendingRecipes(filtered.slice(0, 10));
      setShowDropdown(true);
    } else {
      setTrendingRecipes(indianTrendingRecipes.slice(0, 10));
    }
  }, [searchQuery]);

  const handleNavClick = (page: string) => {
    onNavigate(page);
    setShowDropdown(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('recipes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowDropdown(false);
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onNavigate('recipes');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowDropdown(false);
    }
  };

  const handleRecipeClick = (recipeName: string) => {
    setSearchQuery(recipeName);
    setShowDropdown(false);
    onNavigate('recipes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputFocus = () => {
    if (indianTrendingRecipes.length > 0) {
      setTrendingRecipes(indianTrendingRecipes.slice(0, 10));
      setShowDropdown(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <ChefHat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">COOKMATE</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => handleNavClick('home')}
              className={`hover:text-primary transition-colors ${currentPage === 'home' ? 'text-primary font-semibold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick('recipes')}
              className={`hover:text-primary transition-colors ${currentPage === 'recipes' ? 'text-primary font-semibold' : ''}`}
            >
              Recipes
            </button>
            <button 
              onClick={() => handleNavClick('substitute')}
              className={`hover:text-primary transition-colors ${currentPage === 'substitute' ? 'text-primary font-semibold' : ''}`}
            >
              Substitute
            </button>
            <button 
              onClick={() => handleNavClick('add-recipe')}
              className={`hover:text-primary transition-colors ${currentPage === 'add-recipe' ? 'text-primary font-semibold' : ''}`}
            >
              Add Recipe
            </button>
            <button 
              onClick={() => handleNavClick('recipe-recommender')}
              className={`hover:text-primary transition-colors ${currentPage === 'recipe-recommender' ? 'text-primary font-semibold' : ''}`}
            >
              Recipe Recommender
            </button>
            <button 
              onClick={() => handleNavClick('about')}
              className={`hover:text-primary transition-colors ${currentPage === 'about' ? 'text-primary font-semibold' : ''}`}
            >
              About
            </button>
          </nav>

          {/* Search Bar with Dropdown */}
          <div className="hidden lg:flex relative w-96">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search Indian recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="pl-10 rounded-full"
              />
            </form>
            
            {showDropdown && trendingRecipes.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 space-y-3 z-50">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Popular Indian Recipes</p>
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    Trending
                  </span>
                </div>
                
                {/* Grid layout with 5 items per row */}
                <div className="grid grid-cols-5 gap-3">
                  {trendingRecipes.slice(0, 10).map((recipe) => (
                    <button
                      key={recipe.id}
                      className="flex flex-col items-center group hover:scale-105 transition-all duration-200"
                      onClick={() => handleRecipeClick(recipe.name)}
                    >
                      <div className="relative">
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-200 group-hover:border-orange-400 transition-colors shadow-sm"
                        />
                        <div className="absolute inset-0 rounded-full bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                      </div>
                      <span className="text-[10px] text-center mt-2 leading-tight font-medium text-gray-700 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {recipe.name}
                      </span>
                    </button>
                  ))}
                </div>

                {searchQuery.trim() && (
                  <div className="pt-2 border-t border-gray-100">
                    <button 
                      onClick={handleSearch}
                      className="w-full text-center text-sm text-orange-600 hover:text-orange-700 font-medium py-1 transition-colors"
                    >
                      Search for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hidden md:flex"
                  onClick={() => handleNavClick('favorites')}
                >
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onProfileClick}>
                  <User className="h-5 w-5" />
                </Button>
                <Button onClick={onLogout} variant="outline" className="hidden md:flex">
                  Logout
                </Button>
              </>
            )}
            {!isLoggedIn && (
              <Button variant="ghost" size="icon" onClick={onProfileClick}>
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search Indian recipes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </form>
                  <nav className="flex flex-col space-y-4">
                    <button 
                      onClick={() => handleNavClick('home')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'home' ? 'text-primary font-semibold' : ''}`}
                    >
                      Home
                    </button>
                    <button 
                      onClick={() => handleNavClick('recipes')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'recipes' ? 'text-primary font-semibold' : ''}`}
                    >
                      Recipes
                    </button>
                    <button 
                      onClick={() => handleNavClick('substitute')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'substitute' ? 'text-primary font-semibold' : ''}`}
                    >
                      Substitute
                    </button>
                    <button 
                      onClick={() => handleNavClick('add-recipe')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'add-recipe' ? 'text-primary font-semibold' : ''}`}
                    >
                      Add Recipe
                    </button>
                    <button 
                      onClick={() => handleNavClick('recipe-recommender')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'recipe-recommender' ? 'text-primary font-semibold' : ''}`}
                    >
                      Recipe Recommender
                    </button>
                    {isLoggedIn && (
                      <button 
                        onClick={() => handleNavClick('favorites')}
                        className={`hover:text-primary transition-colors text-left ${currentPage === 'favorites' ? 'text-primary font-semibold' : ''}`}
                      >
                        Favorites
                      </button>
                    )}
                    <button 
                      onClick={() => handleNavClick('about')}
                      className={`hover:text-primary transition-colors text-left ${currentPage === 'about' ? 'text-primary font-semibold' : ''}`}
                    >
                      About
                    </button>
                  </nav>
                  {isLoggedIn && (
                    <Button onClick={onLogout} variant="outline" className="w-full">
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}