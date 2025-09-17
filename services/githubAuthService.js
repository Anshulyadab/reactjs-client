const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgres://dbuser:pass@db.anshulyadav.live:5432/mydb?sslmode=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Find or create a user from GitHub OAuth data
 * @param {Object} profile - GitHub user profile
 * @returns {Object} User data
 */
const findOrCreateGitHubUser = async (profile) => {
  try {
    // Check if user already exists by GitHub ID
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE github_id = $1',
      [profile.id]
    );

    if (existingUser.rows.length > 0) {
      // Update last login time
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE github_id = $1',
        [profile.id]
      );
      return {
        success: true,
        user: {
          id: existingUser.rows[0].id,
          username: existingUser.rows[0].username,
          email: existingUser.rows[0].email,
          role: existingUser.rows[0].role,
          github_id: existingUser.rows[0].github_id,
          avatar_url: existingUser.rows[0].avatar_url
        }
      };
    }

    // Check if user exists by email
    const existingEmailUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [profile.emails[0].value]
    );

    if (existingEmailUser.rows.length > 0) {
      // Link GitHub account to existing user
      await pool.query(
        'UPDATE users SET github_id = $1, avatar_url = $2, last_login = CURRENT_TIMESTAMP WHERE email = $3',
        [profile.id, profile.photos[0].value, profile.emails[0].value]
      );
      return {
        success: true,
        user: {
          id: existingEmailUser.rows[0].id,
          username: existingEmailUser.rows[0].username,
          email: existingEmailUser.rows[0].email,
          role: existingEmailUser.rows[0].role,
          github_id: profile.id,
          avatar_url: profile.photos[0].value
        }
      };
    }

    // Create new user
    const username = profile.username || profile.displayName || `github_${profile.id}`;
    const email = profile.emails[0].value;
    const avatarUrl = profile.photos[0].value;
    const role = 'user'; // Default role for GitHub users

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, github_id, avatar_url, created_at, last_login) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, username, email, role, github_id, avatar_url`,
      [username, email, null, role, profile.id, avatarUrl]
    );

    return {
      success: true,
      user: result.rows[0]
    };
  } catch (err) {
    console.error('Error in findOrCreateGitHubUser:', err);
    return {
      success: false,
      message: 'Failed to authenticate with GitHub',
      error: err.message
    };
  }
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
