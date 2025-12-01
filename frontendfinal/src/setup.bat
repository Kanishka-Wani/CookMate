@echo off
echo.
echo 🍳 COOKMATE - React Setup Script
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo ✅ Node.js detected
node --version
echo.

REM Create React App
echo 📦 Creating React app...
call npx create-react-app cookmate --template typescript

cd cookmate

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install lucide-react class-variance-authority clsx tailwind-merge

REM Install dev dependencies
echo.
echo 📦 Installing Tailwind CSS...
call npm install -D tailwindcss postcss autoprefixer

REM Install Radix UI components
echo.
echo 📦 Installing Radix UI components...
call npm install @radix-ui/react-dialog @radix-ui/react-slot @radix-ui/react-separator @radix-ui/react-avatar @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-select @radix-ui/react-checkbox @radix-ui/react-radio-group @radix-ui/react-switch @radix-ui/react-slider @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-dropdown-menu @radix-ui/react-navigation-menu @radix-ui/react-menubar @radix-ui/react-context-menu @radix-ui/react-hover-card @radix-ui/react-alert-dialog @radix-ui/react-accordion @radix-ui/react-aspect-ratio @radix-ui/react-collapsible @radix-ui/react-progress @radix-ui/react-scroll-area @radix-ui/react-toggle @radix-ui/react-toggle-group

REM Initialize Tailwind
echo.
echo ⚙️ Initializing Tailwind CSS...
call npx tailwindcss init -p

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Copy all component files from the original app to src\components\
echo    2. Copy the tailwind.config.js file to the root directory
echo    3. Copy the globals.css to src\styles\
echo    4. Update src\index.tsx to import globals.css
echo    5. Run 'npm start' to start the development server
echo.
echo 📖 See COMPLETE_REACT_GUIDE.md for detailed instructions
echo.
echo 🎉 Happy coding!
pause
