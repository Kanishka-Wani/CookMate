import { Heart, Users, Target, Award, ChefHat, Sparkles, ArrowLeft, ArrowRight, Mail, Phone, MapPin, BookOpen, Globe, Utensils, Leaf, Clock, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';

const sliderImages = [
  {
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Traditional Indian Thali with diverse dishes"
  },
  {
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Colorful Indian street food preparation"
  },
  {
    url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Chef cooking authentic Indian cuisine"
  },
  {
    url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Assortment of traditional Indian spices"
  },
  {
    url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    alt: "Family cooking together in modern kitchen"
  }
];

const milestones = [
  { 
    icon: ChefHat,
    title: "The Culinary Spark",
    description: "COOKMATE began with a simple kitchen challenge - transforming available ingredients into authentic Indian meals. Our founder's passion for traditional cooking ignited a movement."
  },
  { 
    icon: Users,
    title: "Community Growth",
    description: "We evolved from a personal project into a vibrant community where home cooks share generations of culinary wisdom and family recipes."
  },
  { 
    icon: Globe,
    title: "Digital Transformation",
    description: "Expanded our reach with mobile apps, bringing intelligent recipe matching and traditional cooking techniques to kitchens nationwide."
  },
  { 
    icon: Sparkles,
    title: "Smart Innovation",
    description: "Pioneered AI-powered ingredient matching and personalized meal planning, making authentic Indian cooking accessible to modern families."
  },
  { 
    icon: TrendingUp,
    title: "Rapid Expansion",
    description: "Grew to become India's fastest-growing recipe platform, connecting thousands of home cooks daily while preserving culinary heritage."
  },
  { 
    icon: Star,
    title: "Culinary Excellence",
    description: "Recognized for revolutionizing home cooking by blending traditional techniques with cutting-edge technology for today's kitchens."
  }
];

const teamMembers = [
  { 
    name: 'Kanishka Wani', 
    role: 'Founder & Master Chef', 
    image: "https://media.licdn.com/dms/image/v2/D4D03AQHjU38VjhEjKg/profile-displayphoto-shrink_800_800/B4DZbueSFhHQAg-/0/1747757639212?e=1764201600&v=beta&t=qdLcKZRi5E8-MBYdLRvpbeYdMFtsCgW2WR61jCRIFx0",
    description: '3rd generation chef with 15+ years preserving family recipes and traditional cooking methods'
  },
  { 
    name: 'Neha Behare', 
    role: 'Tech Lead', 
    image: "https://media.licdn.com/dms/image/v2/D5603AQH-4nKx_rUylQ/profile-displayphoto-shrink_400_400/B56ZbcqSGYG4Ao-/0/1747458794974?e=1764201600&v=beta&t=m5dhRZPI3Xf5UjzjzlX930R8E9t5UtvkinvpMTZlDgA",
    description: 'Building intuitive technology that makes cooking smarter and more accessible for everyone'
  },
  { 
    name: 'Bhumi Gujarathi', 
    role: 'Recipe Curator', 
    image: "https://media.licdn.com/dms/image/v2/D5603AQHs2QBV5RGevw/profile-displayphoto-crop_800_800/B56ZlCjttqI0AI-/0/1757758284373?e=1764201600&v=beta&t=9-Ip6xtdDtVHvgpCi-l7gRUC8SmZJ66Wg_7Dc7VJvQo",
    description: 'Expert in regional Indian cuisines with deep knowledge of traditional cooking techniques'
  },
  { 
    name: 'Vaishnavi Desale', 
    role: 'Community Head', 
    image: "https://media-lga3-1.cdn.whatsapp.net/v/t61.24694-24/580955573_1332307358172806_2885601010720621698_n.jpg?ccb=11-4&oh=01_Q5Aa3AE8jkThhBh-kidn9fyNCFW2e33chkfdNFCmYRjGRNoKOw&oe=691E90D9&_nc_sid=5e03e0&_nc_cat=101",
    description: 'Connecting and nurturing our growing family of home cooks across India'
  },
];

export function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000); // Reduced from 4000ms to 3000ms for faster transitions

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentSlide]); // Added currentSlide to dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="relative py-16 md:py-20"> {/* Adjusted top padding */}
        <div className="container mx-auto px-4 md:px-6 max-w-7xl"> {/* Adjusted horizontal padding */}
          {/* Enhanced Hero Section */}
          <div className="max-w-5xl mx-auto text-center mb-20 md:mb-24"> {/* Adjusted bottom margin */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight"> {/* Adjusted font sizes */}
              Where <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Tradition</span> Meets <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Innovation</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed max-w-4xl mx-auto font-medium"> {/* Adjusted font size */}
              Rediscover the joy of <span className="font-bold text-amber-600">authentic Indian cooking</span> with smart technology that understands your kitchen and honors your heritage.
            </p>
          </div>

          {/* Mission & Vision Section */}
          <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-center mb-24 md:mb-32"> {/* Adjusted gaps */}
            <div className="space-y-6 md:space-y-8"> {/* Adjusted spacing */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                    <Target className="h-8 w-8 text-amber-50" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Culinary Mission</h2>
                </div>
                <div className="space-y-4 text-lg text-gray-800 leading-relaxed">
                  <p className="bg-amber-50/95 backdrop-blur-sm p-6 rounded-2xl border border-amber-200 shadow-lg">
                    <span className="font-bold text-amber-600">Preserving family recipes</span> while making them accessible to the modern home cook. We bridge the gap between traditional wisdom and contemporary convenience.
                  </p>
                  <p className="bg-orange-50/95 backdrop-blur-sm p-6 rounded-2xl border border-amber-200 shadow-lg">
                    <span className="font-bold text-orange-600">Reducing kitchen stress</span> through intelligent ingredient matching. Transform what's in your pantry into delicious, authentic Indian meals.
                  </p>
                  <p className="bg-red-50/95 backdrop-blur-sm p-6 rounded-2xl border border-amber-200 shadow-lg">
                    <span className="font-bold text-red-600">Building community</span> around the shared love of Indian cuisine. Every recipe tells a story, and every cook adds their chapter.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Enhanced Image Slider */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-4xl transform rotate-3 shadow-2xl"></div>
              <div 
                className="relative bg-amber-50 rounded-4xl p-3 shadow-2xl overflow-hidden border border-amber-100"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden"> {/* Adjusted height */}
                  {sliderImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                        index === currentSlide 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-0 scale-105'
                      }`}
                    >
                      <ImageWithFallback
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  ))}
                  
                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl p-3 shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-amber-200"
                  >
                    <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" /> {/* Adjusted icon size */}
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 md:right-6 top-1/2 transform -translate-y-1/2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl p-3 shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-amber-200"
                  >
                    <ArrowRight className="h-5 w-5 md:h-6 md:w-6" /> {/* Adjusted icon size */}
                  </button>

                  {/* Slide Indicators */}
                  <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                    {sliderImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide 
                            ? 'bg-amber-100 scale-125 shadow-lg' 
                            : 'bg-amber-100/70 hover:bg-amber-100 hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Slide Info */}
                  <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 bg-black/80 text-amber-100 px-3 py-1 md:px-4 md:py-2 rounded-2xl text-xs md:text-sm backdrop-blur-sm font-medium">
                    {sliderImages[currentSlide].alt}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Values Section */}
          <div className="mb-20 md:mb-28"> {/* Adjusted bottom margin */}
            <div className="text-center mb-12 md:mb-16"> {/* Adjusted bottom margin */}
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Our Cooking Philosophy</h2>
              <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
                The principles that guide every recipe, feature, and interaction on COOKMATE
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8"> {/* Adjusted gap */}
              {[
                {
                  icon: Heart,
                  title: "Authentic Heritage",
                  description: "Every recipe honors traditional cooking methods and regional authenticity while adapting them for modern home kitchens.",
                  color: "from-red-500 to-pink-500",
                  bg: "bg-red-50 border-red-200",
                  iconColor: "text-red-600"
                },
                {
                  icon: Leaf,
                  title: "Sustainable Cooking",
                  description: "We promote zero-waste kitchens by helping you use every ingredient creatively and reduce food waste.",
                  color: "from-green-500 to-emerald-500",
                  bg: "bg-green-50 border-green-200",
                  iconColor: "text-green-600"
                },
                {
                  icon: Sparkles,
                  title: "Smart Technology",
                  description: "Leveraging AI to solve real kitchen challenges while preserving the soul and spirit of traditional Indian cooking.",
                  color: "from-amber-500 to-orange-500",
                  bg: "bg-amber-50 border-amber-200",
                  iconColor: "text-amber-600"
                }
              ].map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className={`border-2 ${value.bg} rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 group overflow-hidden`}>
                    <CardContent className="p-6 md:p-8 relative"> {/* Adjusted padding */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${value.color}`}></div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${value.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" /> {/* Adjusted icon size */}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{value.title}</h3>
                      <p className="text-gray-800 leading-relaxed text-base md:text-lg font-medium">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Impact Statistics */}
          <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-4xl p-8 md:p-16 mb-20 md:mb-28 relative overflow-hidden text-amber-50"> {/* Adjusted padding */}
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Transforming Indian Kitchens</h2>
              <p className="text-lg md:text-xl text-amber-100 text-center mb-12 md:mb-16 max-w-2xl mx-auto font-medium">
                Join the revolution of smart, sustainable, and joyful cooking experiences
              </p>
              <div className="grid md:grid-cols-4 gap-6 md:gap-8 text-center"> {/* Adjusted gap */}
                {[
                  { number: "5,000+", label: "Authentic Recipes", icon: BookOpen },
                  { number: "50,000+", label: "Active Home Cooks", icon: Users },
                  { number: "100,000+", label: "Meals Created", icon: Utensils },
                  { number: "4.8/5", label: "User Satisfaction", icon: Award },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="transform hover:scale-105 transition-transform duration-300">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 md:p-4 bg-amber-500/30 rounded-2xl backdrop-blur-sm">
                          <Icon className="h-6 w-6 md:h-8 md:w-8 text-amber-50" /> {/* Adjusted icon size */}
                        </div>
                      </div>
                      <div className="text-2xl md:text-3xl font-bold mb-2 text-amber-50">{stat.number}</div>
                      <p className="text-amber-100 font-semibold text-sm md:text-base">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Journey Section */}
          <div className="mb-24 md:mb-32"> {/* Adjusted bottom margin */}
            <div className="text-center mb-12 md:mb-16"> {/* Adjusted bottom margin */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Culinary Journey</h2>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto font-medium">
                From a simple kitchen idea to India's most loved recipe platform
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"> {/* Adjusted gap */}
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <Card key={index} className="bg-amber-50/95 backdrop-blur-sm border border-amber-200 shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    <CardContent className="p-0">
                      <div className="p-6 md:p-8"> {/* Adjusted padding */}
                        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <Icon className="h-6 w-6 md:h-8 md:w-8 text-amber-50" /> {/* Adjusted icon size */}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">{milestone.title}</h3>
                        <p className="text-gray-800 leading-relaxed text-sm md:text-base font-medium">{milestone.description}</p>
                      </div>
                      <div className="px-6 md:px-8 pb-6"> {/* Adjusted padding */}
                        <div className="flex items-center gap-2 text-sm text-amber-600 font-semibold">
                          <Clock className="h-4 w-4 text-amber-600" />
                          Chapter {index + 1}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-24 md:mb-32"> {/* Adjusted bottom margin */}
            <div className="text-center mb-12 md:mb-16"> {/* Adjusted bottom margin */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto font-medium">
                The passionate individuals bringing traditional Indian cooking into the digital age
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"> {/* Adjusted gap */}
              {teamMembers.map((member, index) => (
                <Card key={member.name} className="bg-amber-50/95 backdrop-blur-sm border border-amber-200 shadow-xl rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <CardContent className="p-0">
                    <div className="relative h-60 md:h-69 overflow-hidden"> {/* Adjusted height */}
                      <ImageWithFallback
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        fallbackSrc="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-5 md:p-6 text-center"> {/* Adjusted padding */}
                      <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-amber-600 font-semibold mb-3 text-sm md:text-base">{member.role}</p>
                      <p className="text-gray-700 text-xs md:text-sm leading-relaxed font-medium">{member.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="max-w-5xl mx-auto mb-20 md:mb-28"> {/* Adjusted bottom margin */}
            <Card className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-amber-50 shadow-2xl border-0 rounded-4xl overflow-hidden">
              <CardContent className="p-8 md:p-16 text-center relative overflow-hidden"> {/* Adjusted padding */}
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-400/30"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl translate-x-32 translate-y-32"></div>
                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Transform Your Cooking Journey?</h2>
                  <p className="text-lg md:text-xl text-amber-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                    Join thousands of home cooks who have rediscovered the joy of Indian cooking with COOKMATE
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center"> {/* Adjusted gap */}
                    <Button size="lg" className="bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold px-8 md:px-10 py-4 md:py-6 text-base md:text-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300">
                      Start Cooking Today
                    </Button>
                    <Button size="lg" variant="outline" className="border-2 border-amber-50 text-amber-50 hover:bg-amber-50 hover:text-amber-700 font-bold px-8 md:px-10 py-4 md:py-6 text-base md:text-lg rounded-2xl backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                      Share Your Recipe
                    </Button>
                  </div>
                  <p className="text-amber-200 mt-6 md:mt-8 text-xs md:text-sm font-medium">
                    No credit card required • Free forever for home cooks
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Contact Section */}
          <div className="text-center max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Let's Cook Up Something Amazing Together</h3>
            <p className="text-lg md:text-xl text-gray-800 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Have questions, recipe ideas, or want to collaborate? Our kitchen is always open for conversation.
            </p>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-gray-800"> {/* Adjusted gap */}
              {[
                { icon: Mail, label: "Email Us", value: "hello@cookmate.com", href: "mailto:hello@cookmate.com" },
                { icon: Phone, label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210" },
                { icon: MapPin, label: "Visit Us", value: "Dhule, India", href: "#" }
              ].map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <a key={index} href={contact.href} className="group">
                    <Card className="bg-amber-50/95 backdrop-blur-sm border border-amber-200 shadow-lg rounded-2xl p-5 md:p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                      <CardContent className="p-0">
                        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-amber-100 rounded-2xl mb-4 group-hover:bg-amber-200 transition-colors duration-300">
                          <Icon className="h-6 w-6 md:h-8 md:w-8 text-amber-700" /> {/* Adjusted icon size */}
                        </div>
                        <div className="font-bold text-gray-900 mb-2 text-base md:text-lg">{contact.label}</div>
                        <div className="text-amber-600 font-semibold text-sm md:text-base">{contact.value}</div>
                      </CardContent>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}