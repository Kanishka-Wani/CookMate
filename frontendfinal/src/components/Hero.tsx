import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ChefHat } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

const heroImages = [
  {
    url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
    alt: 'Butter Chicken Masala in bowl',
    heading: 'Cook Smarter with What You Have',
    tagline: 'Transform Your Pantry into Delicious Possibilities'
  },
  {
    url: 'https://media.istockphoto.com/id/1736097860/photo/kulfi-ice-cream-in-two-clay-pots-with-small-dessert-spoon-on-a-white-background.jpg?s=612x612&w=0&k=20&c=zfYie9L2Zh9YstXEULewjd_FgzN6OB98SXSK5doDdfI=',
    alt: 'Hyderabadi Biryani in copper pot',
    heading: 'Discover Authentic Indian Flavors',
    tagline: 'Authentic Flavors, Made Simple with Every Spice'
  },
  {
    url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
    alt: 'Crispy Masala Dosa with chutneys',
    heading: 'Your Kitchen, Your Masterpiece',
    tagline: 'From Everyday Ingredients to Extraordinary Meals'
  },
  {
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
    alt: 'Chole Bhature platter',
    heading: 'Master the Art of Indian Cooking',
    tagline: 'Master Traditional Indian Recipes, One Ingredient at a Time'
  },
  {
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80',
    alt: 'Samosa Chaat with toppings',
    heading: 'Celebrate Indian Cuisine Daily',
    tagline: 'Celebrate Indian Cuisine with What\'s Already in Your Kitchen'
  }
];

export function Hero({ onGetStartedClick }: HeroProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Auto slide functionality
  useEffect(() => {
    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSlideChange((currentImageIndex - 1 + heroImages.length) % heroImages.length);
      } else if (e.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentImageIndex]);

  const handleNextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
      setIsAnimating(false);
    }, 500);
  };

  const handleSlideChange = (index: number) => {
    if (index === currentImageIndex || isAnimating) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsAnimating(false);
    }, 500);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isAnimating) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swipe left - next slide
      handleNextSlide();
    } else {
      // Swipe right - previous slide
      handleSlideChange((currentImageIndex - 1 + heroImages.length) % heroImages.length);
    }
    
    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section 
      className="relative overflow-hidden min-h-[600px] lg:min-h-[700px] flex items-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Background Image Slider */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-500 ease-in-out transform ${
              index === currentImageIndex 
                ? 'opacity-100 scale-100 z-10' 
                : 'opacity-0 scale-105 z-0'
            }`}
          >
            <ImageWithFallback
              src={image.url}
              alt={image.alt}
              className="w-full h-full object-cover"
              fallbackSrc="https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.1.0&auto=format&fit=crop&w=1920&q=80"
            />
          </div>
        ))}
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30 z-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"></div>
      </div>

      {/* Subtle floating elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-3 h-3 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-4 h-4 bg-red-500/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-orange-500/30 rounded-full animate-ping"></div>
      </div>

      <div className="container mx-auto px-4 py-24 relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          {/* Enhanced Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              

              {/* Enhanced Text with Better Transitions */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
                  {heroImages[currentImageIndex].heading}
                </h1>
                <p className="text-xl lg:text-2xl text-gray-100 leading-relaxed font-light max-w-3xl mx-auto">
                  {heroImages[currentImageIndex].tagline}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button
              onClick={onGetStartedClick}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-primary/25 inline-flex items-center gap-3"
            >
              <ChefHat className="w-5 h-5" />
              
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`group relative transition-all duration-300 ${
              index === currentImageIndex 
                ? 'scale-110' 
                : 'scale-100 hover:scale-105'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            disabled={isAnimating}
          >
            <div className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex 
                ? 'bg-primary w-8 shadow-lg shadow-primary/50' 
                : 'bg-white/50 w-4 group-hover:bg-white/75 group-hover:w-6'
            }`} />
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-30">
        <div 
          className="h-full bg-primary transition-all duration-5000 ease-linear"
          style={{ 
            width: isAnimating ? '100%' : '0%'
          }}
          key={currentImageIndex}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => handleSlideChange((currentImageIndex - 1 + heroImages.length) % heroImages.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
        disabled={isAnimating}
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 disabled:opacity-50"
        disabled={isAnimating}
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
}