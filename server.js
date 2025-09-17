const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const { ports, environment } = require('./config/ports');
const PORT = ports.backend;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// PostgreSQL connection pool - supports both Neon and custom connection strings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 'postgres://dbuser:pass@db.anshulyadav.live:5432/mydb?sslmode=require',
  // Add connection options for better compatibility with Neon
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err.message);
  // Don't exit the process, just log the error
});

// Function to test database connection
async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection successful to db.anshulyadav.live');
    return true;
  } catch (err) {
    console.log('Database connection failed:', err.message);
    console.log('App will run with in-memory storage fallback.');
    return false;
  }
}

// Test connection on startup
testDatabaseConnection();

// In-memory storage fallback
let inMemoryStorage = [];
let nextId = 1;

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time');
    client.release();
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: err.message 
    });
  }
});

// Save string to database
app.post('/api/save-string', async (req, res) => {
  try {
    const { inputString } = req.body;
    
    if (!inputString) {
      return res.status(400).json({ 
        success: false, 
        message: 'Input string is required' 
      });
    }

    try {
      // Try to save to PostgreSQL first
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS test_strings (
          id SERIAL PRIMARY KEY,
          input_string TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert the string
      const result = await pool.query(
        'INSERT INTO test_strings (input_string) VALUES ($1) RETURNING *',
        [inputString]
      );

      res.json({ 
        success: true, 
        message: 'String saved successfully to database',
        data: result.rows[0]
      });
    } catch (dbErr) {
      console.log('Database save failed, using in-memory storage:', dbErr.message);
      
      // Fallback to in-memory storage
      const newItem = {
        id: nextId++,
        input_string: inputString,
        created_at: new Date().toISOString()
      };
      
      inMemoryStorage.unshift(newItem); // Add to beginning of array
      
      res.json({ 
        success: true, 
        message: 'String saved successfully (in-memory storage)',
        data: newItem
      });
    }
  } catch (err) {
    console.error('Error saving string:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save string',
      error: err.message 
    });
  }
});

// Get all saved strings
app.get('/api/strings', async (req, res) => {
  try {
    try {
      // Try to fetch from PostgreSQL first
      const result = await pool.query(
        'SELECT * FROM test_strings ORDER BY created_at DESC'
      );
      res.json({ 
        success: true, 
        data: result.rows 
      });
    } catch (dbErr) {
      console.log('Database fetch failed, using in-memory storage:', dbErr.message);
      
      // Fallback to in-memory storage
      res.json({ 
        success: true, 
        data: inMemoryStorage 
      });
    }
  } catch (err) {
    console.error('Error fetching strings:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch strings',
      error: err.message 
    });
  }
});

// Execute custom SQL query
app.post('/api/execute-query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'SQL query is required' 
      });
    }

    // Security check - only allow SELECT, INSERT, UPDATE, DELETE queries
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select') && 
        !trimmedQuery.startsWith('insert') && 
        !trimmedQuery.startsWith('update') && 
        !trimmedQuery.startsWith('delete') &&
        !trimmedQuery.startsWith('create') &&
        !trimmedQuery.startsWith('drop') &&
        !trimmedQuery.startsWith('alter')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER queries are allowed' 
      });
    }

    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      message: 'Query executed successfully',
      data: result.rows,
      rowCount: result.rowCount,
      command: result.command
    });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Query execution failed',
      error: err.message 
    });
  }
});

// Get database schema information
app.get('/api/schema', async (req, res) => {
  try {
    const tablesQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const columnsQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
    
    const [tablesResult, columnsResult] = await Promise.all([
      pool.query(tablesQuery),
      pool.query(columnsQuery)
    ]);
    
    res.json({ 
      success: true, 
      data: {
        tables: tablesResult.rows,
        columns: columnsResult.rows
      }
    });
  } catch (err) {
    console.error('Error fetching schema:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch schema',
      error: err.message 
    });
  }
});

// Get database connection info
app.get('/api/connection-info', async (req, res) => {
  try {
    const versionQuery = 'SELECT version() as version';
    const currentTimeQuery = 'SELECT NOW() as current_time';
    const currentUserQuery = 'SELECT current_user as current_user';
    const currentDatabaseQuery = 'SELECT current_database() as current_database';
    
    const [versionResult, timeResult, userResult, dbResult] = await Promise.all([
      pool.query(versionQuery),
      pool.query(currentTimeQuery),
      pool.query(currentUserQuery),
      pool.query(currentDatabaseQuery)
    ]);
    
    res.json({ 
      success: true, 
      data: {
        version: versionResult.rows[0].version,
        currentTime: timeResult.rows[0].current_time,
        currentUser: userResult.rows[0].current_user,
        currentDatabase: dbResult.rows[0].current_database,
        connectionString: process.env.DATABASE_URL ? 'Using DATABASE_URL' : 
                         process.env.NEON_DATABASE_URL ? 'Using NEON_DATABASE_URL' : 
                         'Using custom connection string'
      }
    });
  } catch (err) {
    console.error('Error fetching connection info:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch connection info',
      error: err.message 
    });
  }
});

// Delete string by ID
app.delete('/api/strings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    try {
      const result = await pool.query(
        'DELETE FROM test_strings WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'String not found' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'String deleted successfully',
        data: result.rows[0]
      });
    } catch (dbErr) {
      // Fallback to in-memory storage
      const index = inMemoryStorage.findIndex(item => item.id == id);
      if (index === -1) {
        return res.status(404).json({ 
          success: false, 
          message: 'String not found' 
        });
      }
      
      const deletedItem = inMemoryStorage.splice(index, 1)[0];
      res.json({ 
        success: true, 
        message: 'String deleted successfully (in-memory)',
        data: deletedItem
      });
    }
  } catch (err) {
    console.error('Error deleting string:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete string',
      error: err.message 
    });
  }
});

// Catch-all handler: send back React's index.html file for client-side routing
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📊 Environment: ${environment}`);
    console.log(`🌐 Backend URL: http://localhost:${PORT}`);
    console.log(`⚛️  Frontend URL: http://localhost:${ports.frontend}`);
  });
}

// Export for Vercel
module.exports = app;
