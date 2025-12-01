import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const API_BASE_URL = 'http://127.0.0.1:8000';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendRecipes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/send-recipes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSent(true);
        setEmail('');
      } else {
        setError(data.error || 'Failed to send recipes. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto text-center">
            <CardContent className="p-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Recipes Sent Successfully! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                We've sent <strong>5 delicious recipes</strong> from our collection to your email address. 
                Check your inbox and start cooking!
              </p>
              <div className="space-y-4">
                <Button 
                  onClick={() => setIsSent(false)}
                  variant="outline"
                >
                  Send Recipes to Another Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-primary to-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                {/* Content Side */}
                <div className="p-12 bg-white">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4 bg-primary/10 text-primary">
                        Instant Recipe Delivery
                      </Badge>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Get 5 Random Recipes Instantly
                      </h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        Enter your email and we'll immediately send you 5 random recipes 
                        from our collection of 25,000+ Indian dishes. No subscription required!
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Instant Delivery</h4>
                          <p className="text-gray-600 text-sm">Recipes sent immediately to your inbox</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">No Subscription</h4>
                          <p className="text-gray-600 text-sm">We don't store your email or subscribe you</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Random Selection</h4>
                          <p className="text-gray-600 text-sm">Get 5 random recipes from our database</p>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={handleSendRecipes} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-primary"
                          required
                        />
                      </div>
                      {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                      )}
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-3 text-lg rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Recipes...</span>
                          </div>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Me 5 Random Recipes
                          </>
                        )}
                      </Button>
                    </form>

                    <p className="text-sm text-gray-500 text-center">
                      • No email storage • Instant delivery • 5 random recipes • No spam
                    </p>
                  </div>
                </div>

                {/* Visual Side - Updated for instant recipes */}
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-12 flex items-center justify-center">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-32 h-32 bg-white rounded-full shadow-2xl mx-auto flex items-center justify-center">
                        <div className="text-4xl">🍳</div>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">5</span>
                      </div>
                    </div>

                    {/* Sample Recipe Preview */}
                    <div className="bg-white/90 rounded-lg p-6 shadow-lg max-w-xs mx-auto">
                      <div className="text-left space-y-3">
                        <h4 className="font-bold text-gray-900 text-sm">Sample Recipe</h4>
                        <div className="bg-gray-100 h-20 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Random Selection</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          You'll receive 5 complete recipes with ingredients and instructions...
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          From our database
                        </Badge>
                      </div>
                    </div>

                    <div className="text-white/80 space-y-2">
                      <p className="font-semibold">Instant Recipe Access</p>
                      <p className="text-sm">No waiting, no subscription, just recipes!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12 text-white/90">
          <div className="flex items-center justify-center space-x-8 flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>25+ recipes in database</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Instant delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>No email storage</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}