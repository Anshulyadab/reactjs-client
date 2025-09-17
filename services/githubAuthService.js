const bcrypt = require('bcryptjs');
const { prisma, query } = require('../lib/prisma');
require('dotenv').config();

/**
 * Find or create a user from GitHub OAuth data
 * @param {Object} profile - GitHub user profile
 * @returns {Object} User data
 */
const findOrCreateGitHubUser = async (profile) => {
  // Use the Prisma user service
  const { findOrCreateGitHubUser: prismaFindOrCreate } = require('./prismaUserService');
  return await prismaFindOrCreate(profile);
};

/**
 * Get GitHub user profile from GitHub API
 * @param {string} accessToken - GitHub access token
 * @returns {Object} GitHub user profile
 */
const getGitHubProfile = async (accessToken) => {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'PostgreSQL-React-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const profile = await response.json();
    
    // Get user emails
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'PostgreSQL-React-App'
      }
    });

    const emails = emailResponse.ok ? await emailResponse.json() : [];
    const primaryEmail = emails.find(email => email.primary) || emails[0];

    return {
      id: profile.id,
      username: profile.login,
      displayName: profile.name || profile.login,
      emails: [{ value: primaryEmail?.email || profile.email }],
      photos: [{ value: profile.avatar_url }],
      profileUrl: profile.html_url,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following
    };
  } catch (err) {
    console.error('Error getting GitHub profile:', err);
    throw err;
  }
};

/**
 * Initialize GitHub OAuth tables
 */
const initializeGitHubTables = async () => {
  try {
    // Add GitHub-specific columns to users table if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS github_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE
    `);

    // Create unique index on github_id
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id 
      ON users(github_id) 
      WHERE github_id IS NOT NULL
    `);

    console.log('GitHub OAuth tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing GitHub tables:', err);
    throw err;
  }
};

module.exports = {
  findOrCreateGitHubUser,
  getGitHubProfile,
  initializeGitHubTables
};
