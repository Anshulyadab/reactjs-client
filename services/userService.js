/**
 * User Service
 * 
 * Handles user registration, authentication, and management
 */

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { generateToken } = require('../middleware/auth');

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

/**
 * Initialize users table
 */
const initializeUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        github_id VARCHAR(50),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP
      )
    `);

    // Add GitHub-specific columns if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS github_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
    `);

    // Create default admin user if no users exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      await createDefaultAdmin();
    }

    console.log('✅ Users table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing users table:', error);
    throw error;
  }
};

/**
 * Create default admin user
 */
const createDefaultAdmin = async () => {
  try {
    const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
    `, ['admin', 'admin@postgresapp.com', hashedPassword, 'admin']);

    console.log('✅ Default admin user created');
    console.log('📧 Username: admin');
    console.log('🔑 Password: admin123 (change this in production!)');
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

/**
 * Register a new user
 */
const registerUser = async (username, email, password, role = 'user') => {
  try {
    // Validate input
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, role, created_at
    `, [username, email, passwordHash, role]);

    const user = result.rows[0];
    console.log(`✅ User registered: ${username} (${email})`);

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Authenticate user login
 */
const loginUser = async (username, password) => {
  try {
    // Find user by username or email
    const result = await pool.query(`
      SELECT id, username, email, password_hash, role, is_active, 
             login_attempts, locked_until
      FROM users 
      WHERE username = $1 OR email = $1
    `, [username]);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return {
        success: false,
        message: 'Account is temporarily locked due to too many failed login attempts'
      };
    }

    // Check if account is active
    if (!user.is_active) {
      return {
        success: false,
        message: 'Account is deactivated'
      };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = user.login_attempts + 1;
      let lockedUntil = null;

      // Lock account after 5 failed attempts for 30 minutes
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }

      await pool.query(
        'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
        [newAttempts, lockedUntil, user.id]
      );

      return {
        success: false,
        message: 'Invalid credentials'
      };
    }

    // Reset login attempts on successful login
    await pool.query(
      'UPDATE users SET login_attempts = 0, locked_until = NULL, last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id, user.username, user.role);

    console.log(`✅ User logged in: ${user.username}`);

    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    return {
      success: false,
      message: 'Login failed'
    };
  }
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, role, created_at, last_login
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      user: result.rows[0]
    };
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return {
      success: false,
      message: 'Failed to get user profile'
    };
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  try {
    const allowedFields = ['username', 'email'];
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field) && value !== undefined) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return {
        success: false,
        message: 'No valid fields to update'
      };
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const result = await pool.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, role, updated_at
    `, values);

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      user: result.rows[0]
    };
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return {
      success: false,
      message: 'Failed to update profile'
    };
  }
};

/**
 * Change user password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) {
      return {
        success: false,
        message: 'Current password is incorrect'
      };
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, userId]
    );

    return {
      success: true,
      message: 'Password updated successfully'
    };
  } catch (error) {
    console.error('❌ Change password error:', error);
    return {
      success: false,
      message: 'Failed to change password'
    };
  }
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async () => {
  try {
    const result = await pool.query(`
      SELECT id, username, email, role, is_active, created_at, last_login
      FROM users 
      ORDER BY created_at DESC
    `);

    return {
      success: true,
      users: result.rows
    };
  } catch (error) {
    console.error('❌ Get users error:', error);
    return {
      success: false,
      message: 'Failed to get users'
    };
  }
};

/**
 * Update user status (admin only)
 */
const updateUserStatus = async (userId, isActive) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, is_active',
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'User not found'
      };
    }

    return {
      success: true,
      user: result.rows[0]
    };
  } catch (error) {
    console.error('❌ Update user status error:', error);
    return {
      success: false,
      message: 'Failed to update user status'
    };
  }
};

module.exports = {
  initializeUsersTable,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUsers,
  updateUserStatus
};
