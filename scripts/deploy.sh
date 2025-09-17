#!/bin/bash

# PostgreSQL React App - Vercel + Neon Deployment Script
echo "🚀 PostgreSQL React App Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "📦 Building React app..."
npm run build

echo "🚀 Deploying to Vercel..."
vercel

echo "🔧 Setting up environment variables..."
echo "Please enter your Neon database connection string:"
read -p "NEON_DATABASE_URL: " neon_url

if [ ! -z "$neon_url" ]; then
    vercel env add NEON_DATABASE_URL
    echo "$neon_url" | vercel env add NEON_DATABASE_URL
    echo "✅ Environment variable added!"
else
    echo "⚠️  Skipping environment variable setup"
fi

echo "🔄 Redeploying with environment variables..."
vercel --prod

echo "🎉 Deployment complete!"
echo "Your app should be available at: https://your-app-name.vercel.app"
echo ""
echo "📋 Next steps:"
echo "1. Test your app at the provided URL"
echo "2. Check the 'Connection Info' tab to verify database connection"
echo "3. Try saving a string to test the full functionality"
echo ""
echo "📚 For more information, see DEPLOYMENT.md"
