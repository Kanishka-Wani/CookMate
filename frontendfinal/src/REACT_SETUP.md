# COOKMATE - React.js Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Installation Steps

### 1. Create React App
```bash
npx create-react-app cookmate --template typescript
cd cookmate
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install lucide-react class-variance-authority clsx tailwind-merge

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Radix UI for shadcn components
npm install @radix-ui/react-dialog @radix-ui/react-slot @radix-ui/react-separator
npm install @radix-ui/react-avatar @radix-ui/react-tabs @radix-ui/react-label
npm install @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group
npm install @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-tooltip
npm install @radix-ui/react-popover @radix-ui/react-dropdown-menu
npm install @radix-ui/react-navigation-menu @radix-ui/react-menubar
npm install @radix-ui/react-context-menu @radix-ui/react-hover-card
npm install @radix-ui/react-alert-dialog @radix-ui/react-accordion
npm install @radix-ui/react-aspect-ratio @radix-ui/react-collapsible
npm install @radix-ui/react-progress @radix-ui/react-scroll-area
npm install @radix-ui/react-toggle @radix-ui/react-toggle-group
```

### 3. Project Structure
Copy all files from the existing application to your new React app:

```
src/
├── App.tsx
├── index.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── LoginDialog.tsx
│   ├── RecipeSearch.tsx
│   ├── FeaturedRecipes.tsx
│   ├── MealSuggestions.tsx
│   ├── UserProfile.tsx
│   ├── Testimonials.tsx
│   ├── Newsletter.tsx
│   ├── Footer.tsx
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/
│       └── (all shadcn components)
└── styles/
    └── globals.css
```

### 4. Update Import Paths
All import paths are relative and should work as-is in React:
- `import { Button } from './components/ui/button'`
- `import { Header } from './components/Header'`

### 5. Configuration Files

#### tailwind.config.js
See the tailwind.config.js file in the repository.

#### src/index.tsx
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 6. Update package.json scripts
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 7. Run the Application
```bash
npm start
```

The application will open at http://localhost:3000

## Key Features
- ✅ Fully responsive design
- ✅ Indian cuisine-focused recipe platform
- ✅ Ingredient-based search with autocomplete
- ✅ Featured recipes with ratings
- ✅ Personalized meal suggestions
- ✅ User authentication system
- ✅ Profile management
- ✅ Testimonials section
- ✅ Newsletter subscription
- ✅ Warm orange/green color palette

## Troubleshooting

### Module not found errors
Make sure all dependencies are installed and paths are correct.

### Tailwind styles not working
1. Ensure `globals.css` is imported in `index.tsx`
2. Check that `tailwind.config.js` includes the correct content paths
3. Restart the development server

### TypeScript errors
If you prefer JavaScript, you can rename all `.tsx` files to `.jsx` and remove type annotations.

## Building for Production
```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Deployment
You can deploy the built application to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## Need Help?
The application is already fully functional. All components are ready to use with no additional setup required beyond the installation steps above.
