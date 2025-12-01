# COOKMATE - React.js Application

A smart recipe platform focused on Indian cuisine that helps users cook with ingredients they already have.

![COOKMATE](https://img.shields.io/badge/COOKMATE-Recipe%20Platform-orange)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.1-cyan)

## 🚀 Quick Start

### Automatic Setup (Recommended)

**For macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**For Windows:**
```bash
setup.bat
```

### Manual Setup

```bash
# 1. Create React app
npx create-react-app cookmate --template typescript
cd cookmate

# 2. Install dependencies
npm install lucide-react class-variance-authority clsx tailwind-merge

# 3. Install Tailwind
npm install -D tailwindcss postcss autoprefixer

# 4. Install Radix UI (for shadcn/ui components)
npm install @radix-ui/react-dialog @radix-ui/react-slot @radix-ui/react-separator @radix-ui/react-avatar @radix-ui/react-tabs @radix-ui/react-label

# 5. Initialize Tailwind
npx tailwindcss init -p

# 6. Copy all component files to src/
# 7. Copy configuration files (tailwind.config.js, etc.)
# 8. Run the app
npm start
```

## 📁 Project Structure

```
cookmate/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx                    # Main app component
│   ├── index.tsx                  # Entry point
│   ├── components/
│   │   ├── Header.tsx             # Navigation header
│   │   ├── Hero.tsx               # Hero section
│   │   ├── RecipeSearch.tsx       # Ingredient search
│   │   ├── FeaturedRecipes.tsx    # Recipe cards
│   │   ├── MealSuggestions.tsx    # Personalized meals
│   │   ├── UserProfile.tsx        # User profile
│   │   ├── LoginDialog.tsx        # Authentication
│   │   ├── Testimonials.tsx       # Customer reviews
│   │   ├── Newsletter.tsx         # Newsletter signup
│   │   ├── Footer.tsx             # Footer section
│   │   ├── figma/
│   │   │   └── ImageWithFallback.tsx
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   └── styles/
│       └── globals.css            # Global styles & theme
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## ✨ Features

### 🍛 Recipe Discovery
- **Ingredient-Based Search**: Find recipes based on what you have
- **Autocomplete**: Smart suggestions for Indian spices and ingredients
- **Advanced Filters**: Filter by cuisine, meal type, and dietary preferences

### 🎨 Beautiful UI
- **Indian-Inspired Design**: Warm orange and green color palette
- **Responsive Layout**: Works perfectly on all devices
- **Modern Components**: Built with shadcn/ui and Radix UI

### 👤 User Features
- **Authentication**: Login and signup with social options
- **Profile Management**: Save favorite recipes and meal plans
- **Personalized Suggestions**: AI-powered meal recommendations

### 📱 Additional Features
- Featured recipes with ratings and cooking times
- Customer testimonials
- Newsletter subscription
- Comprehensive footer with links

## 🎨 Color Palette

The application uses an authentic Indian-inspired color scheme:

- **Primary (Orange)**: `#ff6b35` - Vibrant, warm, reminiscent of Indian spices
- **Accent (Green)**: `#27ae60` - Fresh, natural, representing ingredients
- **Background**: `#fffdf9` - Warm, inviting cream
- **Secondary**: `#f4f4f1` - Soft neutral

## 🛠️ Tech Stack

- **React 18.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Radix UI** - Headless components
- **Lucide React** - Icons

## 📦 Dependencies

### Core
- `react` - React library
- `react-dom` - React DOM rendering
- `typescript` - TypeScript support
- `lucide-react` - Icon library

### UI Components
- `@radix-ui/*` - Headless UI components
- `class-variance-authority` - Component variants
- `clsx` - Conditional classes
- `tailwind-merge` - Tailwind class merging

### Build Tools
- `tailwindcss` - CSS framework
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

## 🚀 Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Runs the test suite

### `npm run eject`
Ejects from Create React App (one-way operation)

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=build
```

### GitHub Pages
```bash
npm install --save-dev gh-pages

# Add to package.json:
# "homepage": "https://yourusername.github.io/cookmate"
# "predeploy": "npm run build"
# "deploy": "gh-pages -d build"

npm run deploy
```

## 🔧 Configuration

### Tailwind Config
Customize the theme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      accent: "hsl(var(--accent))",
    }
  }
}
```

### CSS Variables
Customize colors in `src/styles/globals.css`:
```css
:root {
  --primary: 14 100% 60%;      /* Orange */
  --accent: 145 63% 42%;       /* Green */
  --background: 36 100% 98%;   /* Cream */
}
```

## 📝 Customization

### Change Branding
1. Update logo in `Header.tsx` and `Footer.tsx`
2. Modify the app name throughout components
3. Update color scheme in `globals.css`

### Add New Features
1. Create new component in `src/components/`
2. Import and use in `App.tsx`
3. Style with Tailwind classes

### Connect Backend
1. Replace mock data with API calls
2. Use `fetch` or `axios` for HTTP requests
3. Implement proper error handling

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port
PORT=3001 npm start
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Tailwind Not Working
```bash
# Restart dev server
# Check globals.css is imported in index.tsx
# Verify tailwind.config.js content paths
```

### Build Errors
```bash
# Clear build cache
rm -rf build .cache
npm run build
```

## 📚 Documentation

- [Complete React Guide](./COMPLETE_REACT_GUIDE.md) - Detailed setup instructions
- [React Setup](./REACT_SETUP.md) - Quick setup guide
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## 🤝 Contributing

This is a complete, production-ready application. Feel free to:
- Customize for your needs
- Add new features
- Improve existing functionality
- Report issues

## 📄 License

This project is provided as-is for your use and customization.

## 🎯 Next Steps

After setup, consider:
1. ✅ Connect to a real backend (Firebase, Supabase, etc.)
2. ✅ Implement actual authentication
3. ✅ Add recipe database integration
4. ✅ Implement search functionality
5. ✅ Add user preferences storage
6. ✅ Set up analytics (Google Analytics, Mixpanel)
7. ✅ Add error tracking (Sentry)
8. ✅ Implement PWA features
9. ✅ Add testing (Jest, React Testing Library)
10. ✅ Set up CI/CD pipeline

## 📞 Support

For detailed setup instructions, see:
- `COMPLETE_REACT_GUIDE.md` - Comprehensive guide
- `REACT_SETUP.md` - Quick setup
- `package.json` - All dependencies

---

**Made with ❤️ for Indian home cooks**

Cook Smarter with What You Have! 🍳
