import { useState } from 'react';
import { Search, ArrowRight, Lightbulb } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface Substitute {
  ingredient: string;
  substitutes: string[];
  ratio: string;
  notes: string;
}

interface DbSubstitute {
  substitute_id: number;
  ingredient_id: number;
  substitute_name: string;
  reason: string;
}

const substituteData: Record<string, Substitute> = {
  'garam masala': {
    ingredient: 'Garam Masala',
    substitutes: ['Curry powder + cinnamon', 'Coriander + cumin + cardamom'],
    ratio: '1:1',
    notes: 'Mix equal parts of the spices for best results',
  },
  'ghee': {
    ingredient: 'Ghee',
    substitutes: ['Butter', 'Coconut oil', 'Vegetable oil'],
    ratio: '1:1',
    notes: 'Butter gives closest flavor, coconut oil for dairy-free option',
  },
  // ... (keep all your existing substituteData)
};

// API configuration
const API_BASE_URL = 'http://localhost:8000';

export function SubstitutePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Substitute[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fetch substitutes from backend API
  const fetchSubstitutesFromAPI = async (ingredientName: string): Promise<Substitute[]> => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      console.log('🔄 Fetching substitutes from API for:', ingredientName);
      
      const response = await fetch(
        `${API_BASE_URL}/substitutes/${encodeURIComponent(ingredientName.toLowerCase())}/`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No substitutes found in database for "${ingredientName}"`);
        }
        throw new Error(`Failed to fetch substitutes: ${response.status}`);
      }
      
      const data: DbSubstitute[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      
      console.log('✅ Raw API response:', data);
      
      if (data.length === 0) {
        throw new Error(`No substitutes found in database for "${ingredientName}"`);
      }
      
      // Better transformation logic
      const transformedResults: Substitute[] = data.map(substitute => ({
        ingredient: searchQuery, // Use the search query as ingredient name
        substitutes: [substitute.substitute_name], // Each substitute as separate result
        ratio: '1:1', // Default ratio
        notes: substitute.reason || 'Suitable substitute with similar properties'
      }));
      
      console.log('✅ Transformed results:', transformedResults);
      return transformedResults;
      
    } catch (err) {
      console.error('❌ API fetch failed:', err);
      setUsingFallback(true);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Alternative transformation - group all substitutes for one ingredient
  const fetchSubstitutesFromAPIGrouped = async (ingredientName: string): Promise<Substitute[]> => {
    try {
      setLoading(true);
      setError(null);
      setUsingFallback(false);
      
      console.log('🔄 Fetching substitutes from API for:', ingredientName);
      
      const response = await fetch(
        `${API_BASE_URL}/substitutes/${encodeURIComponent(ingredientName.toLowerCase())}/`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`No substitutes found in database for "${ingredientName}"`);
        }
        throw new Error(`Failed to fetch substitutes: ${response.status}`);
      }
      
      const data: DbSubstitute[] = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }
      
      console.log('✅ Raw API response:', data);
      
      if (data.length === 0) {
        throw new Error(`No substitutes found in database for "${ingredientName}"`);
      }
      
      // Group all substitutes into one result
      const groupedResult: Substitute = {
        ingredient: searchQuery, // Use the search query
        substitutes: data.map(sub => sub.substitute_name), // All substitutes in one array
        ratio: '1:1', // Default ratio
        notes: data[0]?.reason || 'Suitable substitutes with similar properties'
      };
      
      console.log('✅ Grouped result:', [groupedResult]);
      return [groupedResult];
      
    } catch (err) {
      console.error('❌ API fetch failed:', err);
      setUsingFallback(true);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fallback to local data
  const findSubstitutesInLocalData = (query: string): Substitute[] => {
    const results: Substitute[] = [];
    const searchTerm = query.toLowerCase().trim();

    Object.keys(substituteData).forEach(key => {
      if (key.includes(searchTerm) || substituteData[key].ingredient.toLowerCase().includes(searchTerm)) {
        results.push(substituteData[key]);
      }
    });

    return results;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    
    try {
      // First try to fetch from API (using grouped version)
      const apiResults = await fetchSubstitutesFromAPIGrouped(query);
      setSearchResults(apiResults);
      setHasSearched(true);
      setError(null);
    } catch (err) {
      // If API fails, use local data as fallback
      console.log('🔄 Using local data as fallback');
      const localResults = findSubstitutesInLocalData(query);
      setSearchResults(localResults);
      setHasSearched(true);
      setError(`Using local data: ${err instanceof Error ? err.message : 'API unavailable'}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const popularIngredients = [
    'Garam Masala',
    'Ghee',
    'Paneer',
    'Curry Leaves',
    'Turmeric',
    'Cumin',
    'Cardamom',
    'Tamarind',
  ];

  const handleQuickSearch = async (ingredient: string) => {
    setSearchQuery(ingredient);
    const query = ingredient.trim();
    
    try {
      // Try API first for quick search too
      const apiResults = await fetchSubstitutesFromAPIGrouped(query);
      setSearchResults(apiResults);
      setHasSearched(true);
      setError(null);
    } catch (err) {
      // Fallback to local data
      const localResults = findSubstitutesInLocalData(query);
      setSearchResults(localResults);
      setHasSearched(true);
      setError(`Using local data: ${err instanceof Error ? err.message : 'API unavailable'}`);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setError(null);
    setUsingFallback(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Lightbulb className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ingredient Substitute Finder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Out of an ingredient? Find the perfect substitute to keep cooking without compromise
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Enter ingredient name (e.g., ghee, paneer, turmeric)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 py-6 text-lg rounded-xl"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 px-8"
                size="lg"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Find Substitutes'}
              </Button>
            </div>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2">
                {popularIngredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => handleQuickSearch(ingredient)}
                  >
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Searching for substitutes...</p>
          </div>
        )}

        {/* Error/Fallback Message */}
        {error && !loading && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="text-yellow-600">⚠️</div>
                <div>
                  <p className="text-yellow-800 text-sm">
                    <strong>Note:</strong> {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {hasSearched && !loading && (
          <div>
            {searchResults.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Substitutes Found for "{searchQuery}"
                </h2>
                {searchResults.map((result, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Ingredient Header */}
                        <div className="flex items-center gap-3 pb-4 border-b">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <ArrowRight className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 capitalize">
                              {result.ingredient}
                            </h3>
                            <p className="text-sm text-gray-600">Ratio: {result.ratio}</p>
                          </div>
                        </div>

                        {/* Substitutes */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">
                            You can use instead:
                          </h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            {result.substitutes.map((substitute, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 p-3 bg-green-50 rounded-lg"
                              >
                                <div className="w-2 h-2 bg-accent rounded-full" />
                                <span className="text-gray-800 capitalize">{substitute}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                          <div className="flex items-start gap-2">
                            <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-gray-900 mb-1">Pro Tip:</p>
                              <p className="text-gray-700">{result.notes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    No substitutes found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We could not find a substitute for "{searchQuery}". Try searching for another
                    ingredient.
                  </p>
                  <Button onClick={resetSearch}>
                    Try Another Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Info Section when no search */}
        {!hasSearched && !loading && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-gradient-to-br from-orange-50 to-white">
              <div className="text-4xl mb-3">🌿</div>
              <h3 className="font-semibold text-gray-900 mb-2">Spices & Herbs</h3>
              <p className="text-sm text-gray-600">
                Find alternatives for Indian spices and herbs
              </p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-green-50 to-white">
              <div className="text-4xl mb-3">🥛</div>
              <h3 className="font-semibold text-gray-900 mb-2">Dairy Products</h3>
              <p className="text-sm text-gray-600">
                Discover substitutes for paneer, ghee, and more
              </p>
            </Card>
            <Card className="text-center p-6 bg-gradient-to-br from-yellow-50 to-white">
              <div className="text-4xl mb-3">🌾</div>
              <h3 className="font-semibold text-gray-900 mb-2">Flours & Grains</h3>
              <p className="text-sm text-gray-600">
                Get alternatives for specialty flours
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}