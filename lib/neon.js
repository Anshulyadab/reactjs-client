/**
 * Neon Database Client
 * 
 * Enhanced PostgreSQL client for Neon serverless database
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool with Neon-optimized settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Neon-optimized connection settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  // Enable statement timeout for Neon
  statement_timeout: 30000, // 30 seconds
  query_timeout: 30000, // 30 seconds
});

// Enhanced query function with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get client for transactions
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    console.error(`The last executed query on this client was: ${client.lastQuery}`);
  }, 5000);
  
  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    // Clear our timeout
    clearTimeout(timeout);
    // Set the methods back to their old un-monkey-patched version
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};

// Test connection
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Neon database connected successfully');
    console.log('📊 Database info:', {
      time: result.rows[0].current_time,
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
    });
    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('❌ Neon database connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Initialize database with required tables
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing Neon database...');
    
    // Create users table with GitHub integration
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        role VARCHAR(20) DEFAULT 'user',
        github_id VARCHAR(50),
        github_username VARCHAR(50),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE
      )
    `);

    // Create strings table for the original functionality
    await query(`
      CREATE TABLE IF NOT EXISTS strings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        input_string TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_data table for generic data storage
    await query(`
      CREATE TABLE IF NOT EXISTS user_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        table_name VARCHAR(100) NOT NULL,
        encrypted_data TEXT,
        raw_data JSONB,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id);
      CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username);
      CREATE INDEX IF NOT EXISTS idx_strings_user_id ON strings(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_data_table_name ON user_data(table_name);
    `);

    // Create default admin user if no users exist
    const userCount = await query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) === 0) {
      const bcrypt = require('bcryptjs');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@example.com', passwordHash, 'admin']
      );
      console.log('✅ Default admin user created');
    }

    console.log('✅ Neon database initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error.message };
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ Database pool closed');
  } catch (error) {
    console.error('❌ Error closing database pool:', error);
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  initializeDatabase,
  closePool
};
