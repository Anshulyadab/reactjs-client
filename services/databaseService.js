/**
 * Database Service
 * 
 * Handles database connections, diagnostics, and automated fixes
 */

const { Pool } = require('pg');
const crypto = require('crypto-js');

// Initialize database pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

/**
 * Initialize database tables and schema
 */
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database schema...');

    // Create connection_strings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS connection_strings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        connection_string TEXT NOT NULL,
        encrypted_string TEXT,
        user_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_tested TIMESTAMP,
        test_status VARCHAR(20) DEFAULT 'unknown'
      )
    `);

    // Create data_storage table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS data_storage (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        encrypted_fields JSONB,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `);

    // Create audit_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(100),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_connection_strings_user_id ON connection_strings(user_id);
      CREATE INDEX IF NOT EXISTS idx_connection_strings_name ON connection_strings(name);
      CREATE INDEX IF NOT EXISTS idx_data_storage_table_name ON data_storage(table_name);
      CREATE INDEX IF NOT EXISTS idx_data_storage_user_id ON data_storage(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `);

    console.log('✅ Database schema initialized successfully');
    return { success: true, message: 'Database initialized' };
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Test database connection
 */
const testConnection = async (connectionString = null) => {
  try {
    const testPool = connectionString ? 
      new Pool({ 
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 5000
      }) : 
      pool;

    const startTime = Date.now();
    const result = await testPool.query('SELECT 1 as test, version() as version, current_user as user, current_database() as database');
    const responseTime = Date.now() - startTime;

    if (connectionString && testPool !== pool) {
      await testPool.end();
    }

    return {
      success: true,
      message: 'Connection successful',
      data: {
        test: result.rows[0].test,
        version: result.rows[0].version,
        user: result.rows[0].user,
        database: result.rows[0].database,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      message: 'Connection failed',
      error: error.message
    };
  }
};

/**
 * Run comprehensive database diagnostics
 */
const runDiagnostics = async (connectionString = null) => {
  try {
    const testPool = connectionString ? 
      new Pool({ 
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }) : 
      pool;

    const diagnostics = {
      connection: await testConnection(connectionString),
      schema: await validateSchema(testPool),
      permissions: await checkPermissions(testPool),
      performance: await checkPerformance(testPool),
      integrity: await checkIntegrity(testPool)
    };

    if (connectionString && testPool !== pool) {
      await testPool.end();
    }

    const overallHealth = Object.values(diagnostics).every(d => d.success);
    
    return {
      success: true,
      health: overallHealth ? 'healthy' : 'issues_detected',
      diagnostics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
    return {
      success: false,
      message: 'Diagnostics failed',
      error: error.message
    };
  }
};

/**
 * Validate database schema
 */
const validateSchema = async (testPool = pool) => {
  try {
    // Check if required tables exist
    const requiredTables = ['users', 'connection_strings', 'data_storage', 'audit_logs'];
    const existingTables = await testPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    const existingTableNames = existingTables.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTableNames.includes(table));

    // Check table structures
    const tableStructures = {};
    for (const table of existingTableNames) {
      const columns = await testPool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position
      `, [table]);
      
      tableStructures[table] = columns.rows;
    }

    return {
      success: missingTables.length === 0,
      message: missingTables.length === 0 ? 'Schema is valid' : 'Missing tables detected',
      data: {
        requiredTables,
        existingTables: existingTableNames,
        missingTables,
        tableStructures
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Schema validation failed',
      error: error.message
    };
  }
};

/**
 * Check user permissions
 */
const checkPermissions = async (testPool = pool) => {
  try {
    const permissions = await testPool.query(`
      SELECT 
        has_table_privilege('users', 'SELECT') as can_select_users,
        has_table_privilege('users', 'INSERT') as can_insert_users,
        has_table_privilege('users', 'UPDATE') as can_update_users,
        has_table_privilege('users', 'DELETE') as can_delete_users,
        has_database_privilege(current_database(), 'CREATE') as can_create_tables,
        has_database_privilege(current_database(), 'CONNECT') as can_connect
    `);

    const perms = permissions.rows[0];
    const allPermissions = Object.values(perms).every(p => p === true);

    return {
      success: allPermissions,
      message: allPermissions ? 'All permissions granted' : 'Some permissions missing',
      data: perms
    };
  } catch (error) {
    return {
      success: false,
      message: 'Permission check failed',
      error: error.message
    };
  }
};

/**
 * Check database performance
 */
const checkPerformance = async (testPool = pool) => {
  try {
    // Check active connections
    const connections = await testPool.query(`
      SELECT COUNT(*) as active_connections
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);

    // Check database size
    const dbSize = await testPool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as database_size
    `);

    // Check slow queries (if available)
    const slowQueries = await testPool.query(`
      SELECT query, mean_time, calls
      FROM pg_stat_statements 
      WHERE mean_time > 1000
      ORDER BY mean_time DESC
      LIMIT 5
    `).catch(() => ({ rows: [] })); // pg_stat_statements might not be available

    return {
      success: true,
      message: 'Performance check completed',
      data: {
        activeConnections: parseInt(connections.rows[0].active_connections),
        databaseSize: dbSize.rows[0].database_size,
        slowQueries: slowQueries.rows
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Performance check failed',
      error: error.message
    };
  }
};

/**
 * Check database integrity
 */
const checkIntegrity = async (testPool = pool) => {
  try {
    // Check for orphaned records
    const orphanedRecords = await testPool.query(`
      SELECT 
        'connection_strings' as table_name,
        COUNT(*) as orphaned_count
      FROM connection_strings cs
      LEFT JOIN users u ON cs.user_id = u.id
      WHERE cs.user_id IS NOT NULL AND u.id IS NULL
      
      UNION ALL
      
      SELECT 
        'data_storage' as table_name,
        COUNT(*) as orphaned_count
      FROM data_storage ds
      LEFT JOIN users u ON ds.user_id = u.id
      WHERE ds.user_id IS NOT NULL AND u.id IS NULL
    `);

    const totalOrphaned = orphanedRecords.rows.reduce((sum, row) => sum + parseInt(row.orphaned_count), 0);

    return {
      success: totalOrphaned === 0,
      message: totalOrphaned === 0 ? 'No integrity issues found' : 'Orphaned records detected',
      data: {
        orphanedRecords: orphanedRecords.rows,
        totalOrphaned
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Integrity check failed',
      error: error.message
    };
  }
};

/**
 * Auto-fix database issues
 */
const autoFixSchema = async (connectionString = null) => {
  try {
    const testPool = connectionString ? 
      new Pool({ 
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }) : 
      pool;

    const fixes = [];

    // Fix missing tables
    const schemaValidation = await validateSchema(testPool);
    if (!schemaValidation.success && schemaValidation.data.missingTables.length > 0) {
      for (const table of schemaValidation.data.missingTables) {
        try {
          await testPool.query(await getTableCreationSQL(table));
          fixes.push(`Created missing table: ${table}`);
        } catch (error) {
          fixes.push(`Failed to create table ${table}: ${error.message}`);
        }
      }
    }

    // Fix missing indexes
    const missingIndexes = await checkMissingIndexes(testPool);
    for (const index of missingIndexes) {
      try {
        await testPool.query(index.sql);
        fixes.push(`Created missing index: ${index.name}`);
      } catch (error) {
        fixes.push(`Failed to create index ${index.name}: ${error.message}`);
      }
    }

    // Fix orphaned records
    const integrityCheck = await checkIntegrity(testPool);
    if (!integrityCheck.success && integrityCheck.data.totalOrphaned > 0) {
      try {
        await testPool.query(`
          DELETE FROM connection_strings 
          WHERE user_id IS NOT NULL 
          AND user_id NOT IN (SELECT id FROM users)
        `);
        
        await testPool.query(`
          DELETE FROM data_storage 
          WHERE user_id IS NOT NULL 
          AND user_id NOT IN (SELECT id FROM users)
        `);
        
        fixes.push(`Cleaned up ${integrityCheck.data.totalOrphaned} orphaned records`);
      } catch (error) {
        fixes.push(`Failed to clean orphaned records: ${error.message}`);
      }
    }

    if (connectionString && testPool !== pool) {
      await testPool.end();
    }

    return {
      success: true,
      message: 'Auto-fix completed',
      fixes,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Auto-fix failed:', error);
    return {
      success: false,
      message: 'Auto-fix failed',
      error: error.message
    };
  }
};

/**
 * Get table creation SQL
 */
const getTableCreationSQL = async (tableName) => {
  const tableSQL = {
    'users': `
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP
      )
    `,
    'connection_strings': `
      CREATE TABLE connection_strings (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        connection_string TEXT NOT NULL,
        encrypted_string TEXT,
        user_id INTEGER REFERENCES users(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_tested TIMESTAMP,
        test_status VARCHAR(20) DEFAULT 'unknown'
      )
    `,
    'data_storage': `
      CREATE TABLE data_storage (
        id SERIAL PRIMARY KEY,
        table_name VARCHAR(100) NOT NULL,
        data JSONB NOT NULL,
        encrypted_fields JSONB,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB
      )
    `,
    'audit_logs': `
      CREATE TABLE audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(100),
        record_id INTEGER,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
  };

  return tableSQL[tableName] || `CREATE TABLE ${tableName} (id SERIAL PRIMARY KEY)`;
};

/**
 * Check for missing indexes
 */
const checkMissingIndexes = async (testPool = pool) => {
  const requiredIndexes = [
    { name: 'idx_users_username', sql: 'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)' },
    { name: 'idx_users_email', sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)' },
    { name: 'idx_connection_strings_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_connection_strings_user_id ON connection_strings(user_id)' },
    { name: 'idx_data_storage_table_name', sql: 'CREATE INDEX IF NOT EXISTS idx_data_storage_table_name ON data_storage(table_name)' }
  ];

  const existingIndexes = await testPool.query(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public'
  `);

  const existingIndexNames = existingIndexes.rows.map(row => row.indexname);
  return requiredIndexes.filter(index => !existingIndexNames.includes(index.name));
};

/**
 * Repair database indexes
 */
const repairIndexes = async (connectionString = null) => {
  try {
    const testPool = connectionString ? 
      new Pool({ 
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      }) : 
      pool;

    const repairs = [];

    // Reindex all tables
    const tables = await testPool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    for (const table of tables.rows) {
      try {
        await testPool.query(`REINDEX TABLE ${table.tablename}`);
        repairs.push(`Reindexed table: ${table.tablename}`);
      } catch (error) {
        repairs.push(`Failed to reindex ${table.tablename}: ${error.message}`);
      }
    }

    // Update table statistics
    await testPool.query('ANALYZE');
    repairs.push('Updated table statistics');

    if (connectionString && testPool !== pool) {
      await testPool.end();
    }

    return {
      success: true,
      message: 'Index repair completed',
      repairs,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Index repair failed:', error);
    return {
      success: false,
      message: 'Index repair failed',
      error: error.message
    };
  }
};

/**
 * Encrypt sensitive data
 */
const encryptSensitiveFields = (data, fieldsToEncrypt = ['password', 'token', 'secret']) => {
  const encrypted = { ...data };
  const encryptedFields = {};

  for (const field of fieldsToEncrypt) {
    if (data[field]) {
      const encryptedValue = crypto.AES.encrypt(data[field], process.env.ENCRYPTION_KEY || 'default-key').toString();
      encryptedFields[field] = encryptedValue;
      delete encrypted[field];
    }
  }

  return { data: encrypted, encryptedFields };
};

/**
 * Decrypt sensitive data
 */
const decryptSensitiveFields = (data, encryptedFields) => {
  const decrypted = { ...data };

  for (const [field, encryptedValue] of Object.entries(encryptedFields)) {
    try {
      const decryptedValue = crypto.AES.decrypt(encryptedValue, process.env.ENCRYPTION_KEY || 'default-key').toString(crypto.enc.Utf8);
      decrypted[field] = decryptedValue;
    } catch (error) {
      console.error(`Failed to decrypt field ${field}:`, error);
    }
  }

  return decrypted;
};

module.exports = {
  initializeDatabase,
  testConnection,
  runDiagnostics,
  validateSchema,
  checkPermissions,
  checkPerformance,
  checkIntegrity,
  autoFixSchema,
  repairIndexes,
  encryptSensitiveFields,
  decryptSensitiveFields
};
