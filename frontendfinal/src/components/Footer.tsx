import { ChefHat, Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { useState } from 'react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'support' | null>(null);

  const handleNavClick = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePolicyClick = (policy: 'privacy' | 'terms' | 'support') => {
    setActiveModal(policy);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-primary">COOKMATE</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your smart companion for authentic Indian cooking. Discover recipes, 
                plan meals, and cook delicious dishes with ingredients you already have.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-primary">
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Quick Links</h3>
              <nav className="flex flex-col space-y-3">
                <button 
                  onClick={() => handleNavClick('recipes')}
                  className="text-gray-400 hover:text-primary transition-colors text-left"
                >
                  Browse Recipes
                </button>
                <button 
                  onClick={() => handleNavClick('recipe-recommender')}
                  className="text-gray-400 hover:text-primary transition-colors text-left"
                >
                  Recipe Recommender
                </button>
                <button 
                  onClick={() => handleNavClick('substitute')}
                  className="text-gray-400 hover:text-primary transition-colors text-left"
                >
                  Ingredient Substitute
                </button>
                <button 
                  onClick={() => handleNavClick('add-recipe')}
                  className="text-gray-400 hover:text-primary transition-colors text-left"
                >
                  Share Recipe
                </button>
                <button 
                  onClick={() => handleNavClick('about')}
                  className="text-gray-400 hover:text-primary transition-colors text-left"
                >
                  About Us
                </button>
              </nav>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-gray-400">hello@cookmate.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-gray-400">+91 98765 43210</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-gray-400">
                    123 Food Street<br />
                    Dhule, Maharashtra 424001<br />
                    India
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {currentYear} COOKMATE. All rights reserved.
            </div>
            
            <nav className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
              <button 
                onClick={() => handlePolicyClick('privacy')}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handlePolicyClick('terms')}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handlePolicyClick('support')}
                className="text-gray-400 hover:text-primary transition-colors"
              >
                Support
              </button>
            </nav>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <div className="grid md:grid-cols-3 gap-6 text-center md:text-left">
              <div>
                <h4 className="font-semibold text-primary mb-2">Smart Cooking</h4>
                <p className="text-gray-400 text-sm">
                  AI-powered recipe recommendations based on your ingredients
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-accent mb-2">Authentic Flavors</h4>
                <p className="text-gray-400 text-sm">
                  Traditional Indian recipes with modern cooking guidance
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-orange-500 mb-2">Community First</h4>
                <p className="text-gray-400 text-sm">
                  Share and discover recipes with our cooking community
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms of Service'}
                  {activeModal === 'support' && 'Support & Help'}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 ml-4 bg-white hover:bg-gray-100 border border-gray-200"
                  onClick={closeModal}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                {activeModal === 'privacy' && (
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900">Your Privacy Matters</h3>
                    <p>
                      At COOKMATE, we are committed to protecting your privacy and ensuring the security of your personal information.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 mt-6">Information We Collect</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Recipe preferences and cooking history</li>
                      <li>Ingredient inventory and dietary preferences</li>
                      <li>Account information for personalized experience</li>
                      <li>Anonymous usage data to improve our services</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mt-6">How We Use Your Data</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Provide personalized recipe recommendations</li>
                      <li>Improve our AI-powered cooking assistant</li>
                      <li>Enhance your cooking experience</li>
                      <li>Never share your personal data with third parties</li>
                    </ul>

                    <p className="text-sm text-gray-600 mt-6">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </div>
                )}

                {activeModal === 'terms' && (
                  <div className="space-y-4 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900">Terms of Service</h3>
                    <p>
                      Welcome to COOKMATE! By using our services, you agree to these terms and conditions.
                    </p>
                    
                    <h4 className="font-semibold text-gray-900 mt-6">User Responsibilities</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Provide accurate information for better recipe recommendations</li>
                      <li>Respect other users in the community</li>
                      <li>Share only original or properly attributed recipes</li>
                      <li>Use the service for personal, non-commercial purposes</li>
                    </ul>

                    <h4 className="font-semibold text-gray-900 mt-6">Service Usage</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>AI recommendations are suggestions, not professional advice</li>
                      <li>Always follow proper food safety guidelines</li>
                      <li>Check for food allergies and dietary restrictions</li>
                      <li>Recipe results may vary based on ingredients and cooking conditions</li>
                    </ul>

                    <p className="text-sm text-gray-600 mt-6">
                      By using COOKMATE, you acknowledge and accept these terms.
                    </p>
                  </div>
                )}

                {activeModal === 'support' && (
                  <div className="space-y-6 text-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900">How Can We Help You?</h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Quick Support</h4>
                      <p className="text-blue-800 text-sm">
                        Email us at: <strong>support@cookmate.com</strong>
                      </p>
                      <p className="text-blue-800 text-sm">
                        Call us: <strong>+91 98765 43210</strong>
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Frequently Asked Questions</h4>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900">How does the AI recipe recommender work?</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Our AI analyzes your available ingredients and suggests the best matching recipes from our database.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900">Can I save my favorite recipes?</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Yes! Create an account to save recipes, track your cooking history, and get personalized recommendations.
                        </p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-semibold text-gray-900">How accurate are ingredient substitutions?</h5>
                        <p className="text-sm text-gray-600 mt-1">
                          Our substitution suggestions are based on culinary expertise and user feedback, but always taste and adjust as needed.
                        </p>
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Community Support</h4>
                      <p className="text-green-800 text-sm">
                        Join our community of home cooks to share tips, ask questions, and get inspired!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <Button onClick={closeModal} className="bg-primary hover:bg-primary/90">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}