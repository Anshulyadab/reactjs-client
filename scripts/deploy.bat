@echo off
echo 🚀 PostgreSQL React App Deployment Script
echo ==========================================

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel
)

REM Check if user is logged in to Vercel
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 Please login to Vercel:
    vercel login
)

echo 📦 Building React app...
npm run build

echo 🚀 Deploying to Vercel...
vercel

echo 🔧 Setting up environment variables...
echo Please enter your Neon database connection string:
set /p neon_url="NEON_DATABASE_URL: "

if not "%neon_url%"=="" (
    echo %neon_url% | vercel env add NEON_DATABASE_URL
    echo ✅ Environment variable added!
) else (
    echo ⚠️  Skipping environment variable setup
)

echo 🔄 Redeploying with environment variables...
vercel --prod

echo 🎉 Deployment complete!
echo Your app should be available at: https://your-app-name.vercel.app
echo.
echo 📋 Next steps:
echo 1. Test your app at the provided URL
echo 2. Check the 'Connection Info' tab to verify database connection
echo 3. Try saving a string to test the full functionality
echo.
echo 📚 For more information, see DEPLOYMENT.md
pause
