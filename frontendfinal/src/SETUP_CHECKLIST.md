# COOKMATE - React Setup Checklist ✅

## Prerequisites
- [ ] Node.js installed (v16 or higher) - Check with `node --version`
- [ ] npm installed - Check with `npm --version`
- [ ] Basic understanding of React
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### Phase 1: Create React App
- [ ] Open terminal/command prompt
- [ ] Run: `npx create-react-app cookmate --template typescript`
- [ ] Wait for installation to complete
- [ ] Navigate into project: `cd cookmate`

### Phase 2: Install Dependencies

#### Core Dependencies
- [ ] Run: `npm install lucide-react`
- [ ] Run: `npm install class-variance-authority`
- [ ] Run: `npm install clsx`
- [ ] Run: `npm install tailwind-merge`

#### Tailwind CSS
- [ ] Run: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Run: `npx tailwindcss init -p`

#### Radix UI Components
- [ ] Run: `npm install @radix-ui/react-dialog`
- [ ] Run: `npm install @radix-ui/react-slot`
- [ ] Run: `npm install @radix-ui/react-separator`
- [ ] Run: `npm install @radix-ui/react-avatar`
- [ ] Run: `npm install @radix-ui/react-tabs`
- [ ] Run: `npm install @radix-ui/react-label`

**OR use the automated setup script:**
- [ ] Mac/Linux: Run `./setup.sh`
- [ ] Windows: Run `setup.bat`

### Phase 3: Copy Files

#### Configuration Files
- [ ] Copy `package.json` to project root
- [ ] Copy `tailwind.config.js` to project root
- [ ] Copy `postcss.config.js` to project root

#### Source Files
- [ ] Create `src/components/` folder
- [ ] Copy all component files to `src/components/`
  - [ ] Header.tsx
  - [ ] Hero.tsx
  - [ ] LoginDialog.tsx
  - [ ] RecipeSearch.tsx
  - [ ] FeaturedRecipes.tsx
  - [ ] MealSuggestions.tsx
  - [ ] UserProfile.tsx
  - [ ] Testimonials.tsx
  - [ ] Newsletter.tsx
  - [ ] Footer.tsx

#### UI Components
- [ ] Create `src/components/ui/` folder
- [ ] Copy all UI component files to `src/components/ui/`
  - [ ] button.tsx
  - [ ] card.tsx
  - [ ] dialog.tsx
  - [ ] input.tsx
  - [ ] badge.tsx
  - [ ] avatar.tsx
  - [ ] tabs.tsx
  - [ ] label.tsx
  - [ ] separator.tsx
  - [ ] sheet.tsx
  - [ ] (and all others)

#### Figma Components
- [ ] Create `src/components/figma/` folder
- [ ] Copy `ImageWithFallback.tsx` to `src/components/figma/`

#### Styles
- [ ] Create `src/styles/` folder
- [ ] Copy `globals.css` to `src/styles/`

#### Main Files
- [ ] Copy `App.tsx` to `src/`
- [ ] Create `src/index.tsx` with entry point code

### Phase 4: Configuration

#### Update index.tsx
- [ ] Create file if not exists
- [ ] Add React imports
- [ ] Import globals.css
- [ ] Import App component
- [ ] Set up ReactDOM.render

#### Verify tailwind.config.js
- [ ] Check content paths include `./src/**/*.{js,jsx,ts,tsx}`
- [ ] Verify theme configuration
- [ ] Check color scheme settings

#### Update globals.css
- [ ] Verify Tailwind directives at top
- [ ] Check CSS variables are defined
- [ ] Verify color scheme (orange/green)

### Phase 5: Verification

#### Check File Structure
```
src/
├── index.tsx
├── App.tsx
├── components/
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── (all other components)
│   ├── figma/
│   │   └── ImageWithFallback.tsx
│   └── ui/
│       └── (all UI components)
└── styles/
    └── globals.css
```

- [ ] All files in correct locations
- [ ] No missing files
- [ ] Proper folder structure

#### Check Imports
- [ ] All imports use relative paths
- [ ] No broken import statements
- [ ] UI components imported correctly

### Phase 6: Run Application

#### First Run
- [ ] Run: `npm install` (if not done already)
- [ ] Run: `npm start`
- [ ] Wait for compilation
- [ ] App opens at http://localhost:3000
- [ ] No console errors

#### Visual Check
- [ ] Header appears with COOKMATE logo
- [ ] Hero section loads with images
- [ ] Recipe search is functional
- [ ] Featured recipes display
- [ ] Meal suggestions appear
- [ ] Footer displays correctly
- [ ] No visual glitches

#### Functionality Check
- [ ] Click "Login" button - dialog opens
- [ ] Click user icon - profile opens
- [ ] Search ingredients - autocomplete works
- [ ] Add ingredients - badges appear
- [ ] Newsletter form works
- [ ] All buttons are clickable
- [ ] Links navigate correctly

#### Responsive Check
- [ ] Resize browser window
- [ ] Check mobile view (< 768px)
- [ ] Check tablet view (768px - 1024px)
- [ ] Check desktop view (> 1024px)
- [ ] All elements responsive

### Phase 7: Testing

#### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if Mac)
- [ ] Test in Edge

#### Performance Check
- [ ] Page loads quickly
- [ ] Images load properly
- [ ] No lag when scrolling
- [ ] Animations smooth

#### Console Check
- [ ] Open browser DevTools
- [ ] Check Console tab - no errors
- [ ] Check Network tab - all resources load
- [ ] Check Lighthouse score

### Phase 8: Build for Production

#### Production Build
- [ ] Run: `npm run build`
- [ ] Wait for build to complete
- [ ] Check `build/` folder created
- [ ] No build errors

#### Test Production Build
- [ ] Install serve: `npm install -g serve`
- [ ] Run: `serve -s build`
- [ ] Test at http://localhost:3000
- [ ] Verify all features work

### Phase 9: Customization (Optional)

#### Branding
- [ ] Logo updated (already COOKMATE ✅)
- [ ] Colors customized (optional)
- [ ] Fonts changed (optional)
- [ ] Images replaced (optional)

#### Features
- [ ] Backend API connected (optional)
- [ ] Authentication implemented (optional)
- [ ] Database integrated (optional)
- [ ] Analytics added (optional)

### Phase 10: Deployment

#### Choose Platform
- [ ] Vercel (recommended)
- [ ] Netlify
- [ ] GitHub Pages
- [ ] Other hosting

#### Deploy
- [ ] Follow platform instructions
- [ ] Push code to repository
- [ ] Connect to hosting service
- [ ] Deploy application
- [ ] Test live URL

## Troubleshooting Checklist

If something doesn't work:

### Installation Issues
- [ ] Delete `node_modules` folder
- [ ] Delete `package-lock.json`
- [ ] Run `npm install` again
- [ ] Restart terminal

### Import Errors
- [ ] Check file paths are correct
- [ ] Verify file names match imports
- [ ] Check for typos in imports
- [ ] Ensure all files are in place

### Styling Issues
- [ ] Verify `globals.css` is imported
- [ ] Check `tailwind.config.js` content paths
- [ ] Restart dev server
- [ ] Clear browser cache

### Build Errors
- [ ] Check console for specific errors
- [ ] Fix TypeScript errors
- [ ] Verify all dependencies installed
- [ ] Update dependencies if needed

## Success Criteria ✅

Your setup is complete when:
- ✅ App runs without errors
- ✅ All pages/sections display correctly
- ✅ Navigation works
- ✅ Forms are functional
- ✅ Responsive on all screen sizes
- ✅ Build completes successfully
- ✅ No console errors

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Test production build
serve -s build

# Install specific package
npm install package-name

# Update all packages
npm update
```

## Time Estimates

- **Automated Setup**: 10-15 minutes
- **Manual Setup**: 30-45 minutes
- **File Copying**: 5-10 minutes
- **Testing**: 10-15 minutes
- **Customization**: Variable
- **Total**: 1-2 hours for complete setup

## Need Help?

If you get stuck:
1. Check error messages carefully
2. Read COMPLETE_REACT_GUIDE.md
3. Check package.json for dependencies
4. Verify all files are in correct locations
5. Search error messages online
6. Check React/Tailwind documentation

## Congratulations! 🎉

Once all checkboxes are marked, you have a fully functional COOKMATE React application!

- Production-ready code
- Modern React best practices
- Beautiful Indian-themed UI
- Fully responsive design
- Complete feature set

**Happy Cooking! 🍳**
