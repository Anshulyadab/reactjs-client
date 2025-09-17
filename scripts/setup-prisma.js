/**
 * Prisma Setup Script
 * 
 * Sets up Prisma with Neon database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Prisma with Neon database...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating from template...');
  
  const envTemplate = `# Database Configuration
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Server Configuration
PORT=8080
NODE_ENV=development

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
ADMIN_PASSWORD="admin123"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:8080/api/auth/github/callback"
SESSION_SECRET="your-session-secret-for-oauth-change-this-in-production"

# Redis (Optional)
REDIS_URL="redis://localhost:6379"
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created. Please update with your actual values.\n');
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully\n');

  // Push schema to database
  console.log('🗄️  Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema pushed successfully\n');

  // Seed database (optional)
  console.log('🌱 Seeding database...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('✅ Database seeded successfully\n');
  } catch (error) {
    console.log('⚠️  No seed script found (this is optional)\n');
  }

  console.log('🎉 Prisma setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with actual database credentials');
  console.log('2. Run: npm run dev');
  console.log('3. Access your app at: http://localhost:8080');
  console.log('4. View your database at: npx prisma studio');

} catch (error) {
  console.error('❌ Prisma setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure your DATABASE_URL is correct in .env');
  console.log('2. Ensure your database is accessible');
  console.log('3. Check your internet connection');
  process.exit(1);
}
