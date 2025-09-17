const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { findOrCreateGitHubUser, getGitHubProfile } = require('../services/githubAuthService');
const { createSession, clearSession } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Configure GitHub OAuth Strategy (only if credentials are provided)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/auth/github/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub OAuth profile received:', {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value
      });

      const result = await findOrCreateGitHubUser(profile);
      
      if (result.success) {
        return done(null, result.user);
      } else {
        return done(null, false, { message: result.message });
      }
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return done(error, null);
    }
  }));
  console.log('✅ GitHub OAuth strategy configured');
} else {
  console.log('⚠️  GitHub OAuth not configured - missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
}

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgres://dbuser:pass@db.anshulyadav.live:5432/mydb?sslmode=require',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const result = await pool.query(
      'SELECT id, username, email, role, github_id, avatar_url FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length > 0) {
      done(null, result.rows[0]);
    } else {
      done(null, false);
    }
  } catch (error) {
    done(error, null);
  }
});

// GitHub OAuth Routes

/**
 * @route GET /api/auth/github
 * @desc Initiate GitHub OAuth login
 * @access Public
 */
router.get('/github', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(400).json({
      success: false,
      message: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.'
    });
  }
  passport.authenticate('github', {
    scope: ['user:email']
  })(req, res, next);
});

/**
 * @route GET /api/auth/github/callback
 * @desc GitHub OAuth callback
 * @access Public
 */
router.get('/github/callback', (req, res, next) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.redirect('/login?error=github_auth_not_configured');
  }
  
  passport.authenticate('github', { 
    failureRedirect: '/login?error=github_auth_failed',
    session: false 
  })(req, res, next);
}, async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=github_auth_failed');
    }

    // Create JWT session
    createSession(res, req.user.id, req.user.username, req.user.role);

    // Redirect to frontend with success
    res.redirect('/?login=success&provider=github');
  } catch (error) {
    console.error('GitHub callback error:', error);
    res.redirect('/login?error=github_auth_failed');
  }
});

/**
 * @route GET /api/auth/github/profile
 * @desc Get GitHub user profile
 * @access Private
 */
router.get('/github/profile', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers['x-access-token'] || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgres://dbuser:pass@db.anshulyadav.live:5432/mydb?sslmode=require',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    const result = await pool.query(
      'SELECT id, username, email, role, github_id, avatar_url, created_at, last_login FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];
    
    // Get additional GitHub data if user has GitHub ID
    let githubData = null;
    if (user.github_id) {
      try {
        // You would need to store the access token to make API calls
        // For now, we'll return basic info
        githubData = {
          github_id: user.github_id,
          avatar_url: user.avatar_url,
          last_login: user.last_login
        };
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        github_id: user.github_id,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        last_login: user.last_login
      },
      github: githubData
    });
  } catch (error) {
    console.error('GitHub profile error:', error);
    res.status(500).json({ success: false, message: 'Failed to get GitHub profile' });
  }
});

/**
 * @route POST /api/auth/github/logout
 * @desc Logout GitHub user
 * @access Private
 */
router.post('/github/logout', (req, res) => {
  clearSession(res);
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * @route GET /api/auth/github/status
 * @desc Check GitHub OAuth status
 * @access Public
 */
router.get('/github/status', (req, res) => {
  const isConfigured = !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
  
  res.json({
    success: true,
    configured: isConfigured,
    clientId: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not_configured',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:8080/api/auth/github/callback'
  });
});

module.exports = router;
