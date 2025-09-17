#!/usr/bin/env node

/**
 * Vercel Credentials Helper
 * 
 * This script helps you get the necessary credentials for GitHub Actions deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel Credentials Helper');
console.log('============================\n');

try {
  // Check if Vercel CLI is installed
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
  } catch (error) {
    console.log('❌ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed');
  }

  // Check if user is logged in
  try {
    const whoami = execSync('vercel whoami', { encoding: 'utf8' });
    console.log(`✅ Logged in as: ${whoami.trim()}`);
  } catch (error) {
    console.log('❌ Not logged in to Vercel. Please login:');
    console.log('   Run: vercel login');
    process.exit(1);
  }

  // Get token
  try {
    const token = execSync('vercel token', { encoding: 'utf8' });
    console.log('\n🔑 VERCEL_TOKEN:');
    console.log(token.trim());
  } catch (error) {
    console.log('❌ Could not get Vercel token');
  }

  // Check if project is linked
  const vercelConfigPath = path.join(process.cwd(), '.vercel', 'project.json');
  
  if (fs.existsSync(vercelConfigPath)) {
    const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
    console.log('\n📁 VERCEL_ORG_ID:');
    console.log(config.orgId);
    console.log('\n📁 VERCEL_PROJECT_ID:');
    console.log(config.projectId);
  } else {
    console.log('\n❌ Project not linked to Vercel');
    console.log('   Run: vercel link');
    console.log('   Then run this script again');
  }

  console.log('\n📋 Next Steps:');
  console.log('1. Go to your GitHub repository');
  console.log('2. Go to Settings → Secrets and variables → Actions');
  console.log('3. Add these secrets:');
  console.log('   - VERCEL_TOKEN');
  console.log('   - VERCEL_ORG_ID');
  console.log('   - VERCEL_PROJECT_ID');
  console.log('   - NEON_DATABASE_URL (your Neon connection string)');
  console.log('\n4. Push to GitHub and watch the magic happen! 🚀');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
