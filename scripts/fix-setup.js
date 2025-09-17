/**
 * Fix Setup Script
 * 
 * Fixes common setup issues and provides guidance
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing setup issues...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found. Creating template...');
  
  const envTemplate = `# Database Configuration
# Replace with your actual Neon database URL
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Server Configuration
PORT=8080
NODE_ENV=development

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="24h"
ADMIN_PASSWORD="admin123"

# GitHub OAuth (optional - will show warning if not configured)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GITHUB_CALLBACK_URL="http://localhost:8080/api/auth/github/callback"
SESSION_SECRET="your-session-secret-for-oauth-change-this-in-production"
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file exists');
}

// Check if Prisma client is generated
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  console.log('⚠️  Prisma client not generated. Generating...');
  try {
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated');
  } catch (error) {
    console.log('❌ Failed to generate Prisma client:', error.message);
  }
} else {
  console.log('✅ Prisma client exists');
}

console.log('\n🎯 Next Steps:');
console.log('1. Update your .env file with actual database credentials');
console.log('2. Get a Neon database URL from https://neon.tech');
console.log('3. Run: npm run prisma:push (to create tables)');
console.log('4. Run: npm run dev (to start the application)');

console.log('\n📋 Quick Setup Commands:');
console.log('npm run prisma:generate  # Generate Prisma client');
console.log('npm run prisma:push      # Push schema to database');
console.log('npm run dev              # Start development server');

console.log('\n🌐 Access Points:');
console.log('Application: http://localhost:8080');
console.log('API: http://localhost:8080/api');
console.log('Prisma Studio: npm run prisma:studio');

console.log('\n✅ Setup fix completed!');
