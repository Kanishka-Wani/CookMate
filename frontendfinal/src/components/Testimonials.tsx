import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Meera S.',
    location: 'Delhi',
    rating: 5,
    text: "Finally cooking authentic Indian food with what's in my kitchen! The AI suggestions are spot-on.",
    avatar: '/placeholder-avatar-1.jpg'
  },
  {
    id: 2,
    name: 'Rajesh P.',
    location: 'Mumbai',
    rating: 5,
    text: "As a busy professional, this app saves me time and helps me eat healthier. Love it!",
    avatar: '/placeholder-avatar-2.jpg'
  },
  {
    id: 3,
    name: 'Anita R.',
    location: 'Bangalore',
    rating: 5,
    text: "Recreated my grandma's recipes with local ingredients. Feels like home!",
    avatar: '/placeholder-avatar-3.jpg'
  },
  {
    id: 4,
    name: 'Vikram S.',
    location: 'Jaipur',
    rating: 5,
    text: "My family actually asks for home-cooked meals now. The recipes are family-approved!",
    avatar: '/placeholder-avatar-4.jpg'
  },
  {
    id: 5,
    name: 'Priya K.',
    location: 'Chennai',
    rating: 5,
    text: "Went from beginner to confident cook. The step-by-step guides made it so easy.",
    avatar: '/placeholder-avatar-5.jpg'
  },
  {
    id: 6,
    name: 'Amit G.',
    location: 'Pune',
    rating: 5,
    text: "Perfect balance of taste and health. The nutrition info is a game-changer.",
    avatar: '/placeholder-avatar-6.jpg'
  }
];

export function Testimonials() {
  return (
    <section className="py-16 bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Home Cooks
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from our cooking community
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300 relative overflow-hidden border-0 shadow-md">
              <div className="absolute top-4 right-4 text-primary/10">
                <Quote className="h-8 w-8" />
              </div>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  {/* User Info */}
                  <div className="flex items-center space-x-3 pt-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                      <p className="text-xs text-gray-600">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Simple Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 text-sm text-gray-600 bg-white rounded-full px-6 py-3 shadow-sm">
            <span><strong className="text-primary">50K+</strong> Happy Cooks</span>
            <span>•</span>
            <span><strong className="text-accent">4.9★</strong> Rating</span>
            <span>•</span>
            <span><strong className="text-orange-500">1M+</strong> Meals</span>
          </div>
        </div>
      </div>
    </section>
  );
}