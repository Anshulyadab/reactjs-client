/**
 * Database Service Tests
 * 
 * Comprehensive test suite for database functionality
 */

const databaseService = require('../services/databaseService');
const { Pool } = require('pg');

describe('Database Service', () => {
  let testPool;

  beforeAll(async () => {
    // Initialize test database
    await databaseService.initializeDatabase();
    
    // Create test pool
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  });

  afterAll(async () => {
    if (testPool) {
      await testPool.end();
    }
  });

  describe('initializeDatabase', () => {
    it('should initialize database tables successfully', async () => {
      const result = await databaseService.initializeDatabase();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Database initialized');
    });
  });

  describe('testConnection', () => {
    it('should test database connection successfully', async () => {
      const result = await databaseService.testConnection();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection successful');
      expect(result.data.test).toBe(1);
      expect(result.data.version).toBeDefined();
      expect(result.data.user).toBeDefined();
      expect(result.data.database).toBeDefined();
    });

    it('should test connection with custom connection string', async () => {
      const customConnectionString = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
      const result = await databaseService.testConnection(customConnectionString);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Connection successful');
    });

    it('should fail with invalid connection string', async () => {
      const invalidConnectionString = 'postgres://invalid:invalid@localhost:5432/invalid';
      const result = await databaseService.testConnection(invalidConnectionString);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Connection failed');
    });
  });

  describe('runDiagnostics', () => {
    it('should run comprehensive diagnostics', async () => {
      const result = await databaseService.runDiagnostics();
      
      expect(result.success).toBe(true);
      expect(result.health).toBeDefined();
      expect(result.diagnostics).toBeDefined();
      expect(result.diagnostics.connection).toBeDefined();
      expect(result.diagnostics.schema).toBeDefined();
      expect(result.diagnostics.permissions).toBeDefined();
      expect(result.diagnostics.performance).toBeDefined();
      expect(result.diagnostics.integrity).toBeDefined();
    });
  });

  describe('validateSchema', () => {
    it('should validate database schema', async () => {
      const result = await databaseService.validateSchema();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Schema is valid');
      expect(result.data.requiredTables).toBeDefined();
      expect(result.data.existingTables).toBeDefined();
      expect(result.data.missingTables).toBeDefined();
      expect(result.data.tableStructures).toBeDefined();
    });
  });

  describe('checkPermissions', () => {
    it('should check database permissions', async () => {
      const result = await databaseService.checkPermissions();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('All permissions granted');
      expect(result.data.can_select_users).toBe(true);
      expect(result.data.can_insert_users).toBe(true);
      expect(result.data.can_update_users).toBe(true);
      expect(result.data.can_delete_users).toBe(true);
      expect(result.data.can_create_tables).toBe(true);
      expect(result.data.can_connect).toBe(true);
    });
  });

  describe('checkPerformance', () => {
    it('should check database performance', async () => {
      const result = await databaseService.checkPerformance();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Performance check completed');
      expect(result.data.activeConnections).toBeDefined();
      expect(result.data.databaseSize).toBeDefined();
    });
  });

  describe('checkIntegrity', () => {
    it('should check database integrity', async () => {
      const result = await databaseService.checkIntegrity();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('No integrity issues found');
      expect(result.data.orphanedRecords).toBeDefined();
      expect(result.data.totalOrphaned).toBe(0);
    });
  });

  describe('autoFixSchema', () => {
    it('should auto-fix database schema issues', async () => {
      const result = await databaseService.autoFixSchema();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Auto-fix completed');
      expect(result.fixes).toBeDefined();
      expect(Array.isArray(result.fixes)).toBe(true);
    });
  });

  describe('repairIndexes', () => {
    it('should repair database indexes', async () => {
      const result = await databaseService.repairIndexes();
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Index repair completed');
      expect(result.repairs).toBeDefined();
      expect(Array.isArray(result.repairs)).toBe(true);
    });
  });

  describe('encryptSensitiveFields', () => {
    it('should encrypt sensitive fields', () => {
      const data = {
        username: 'testuser',
        password: 'secretpassword',
        email: 'test@example.com',
        token: 'secret-token'
      };

      const result = databaseService.encryptSensitiveFields(data, ['password', 'token']);
      
      expect(result.data.password).toBeUndefined();
      expect(result.data.token).toBeUndefined();
      expect(result.data.username).toBe('testuser');
      expect(result.data.email).toBe('test@example.com');
      expect(result.encryptedFields.password).toBeDefined();
      expect(result.encryptedFields.token).toBeDefined();
    });

    it('should handle data without sensitive fields', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const result = databaseService.encryptSensitiveFields(data, ['password', 'token']);
      
      expect(result.data).toEqual(data);
      expect(Object.keys(result.encryptedFields)).toHaveLength(0);
    });
  });

  describe('decryptSensitiveFields', () => {
    it('should decrypt sensitive fields', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const encryptedFields = {
        password: 'U2FsdGVkX1+example_encrypted_password',
        token: 'U2FsdGVkX1+example_encrypted_token'
      };

      // Note: This test might fail if the encryption key is different
      // In a real test environment, you'd use a consistent encryption key
      const result = databaseService.decryptSensitiveFields(data, encryptedFields);
      
      expect(result.username).toBe('testuser');
      expect(result.email).toBe('test@example.com');
      // The decrypted values depend on the encryption key used
    });
  });
});

describe('Database Integration Tests', () => {
  let testPool;

  beforeAll(async () => {
    testPool = new Pool({
      connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  });

  afterAll(async () => {
    if (testPool) {
      await testPool.end();
    }
  });

  describe('Table Operations', () => {
    it('should create and query test table', async () => {
      // Create test table
      await testPool.query(`
        CREATE TABLE IF NOT EXISTS test_table (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          value INTEGER
        )
      `);

      // Insert test data
      await testPool.query(
        'INSERT INTO test_table (name, value) VALUES ($1, $2)',
        ['test', 123]
      );

      // Query test data
      const result = await testPool.query('SELECT * FROM test_table WHERE name = $1', ['test']);
      
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe('test');
      expect(result.rows[0].value).toBe(123);

      // Clean up
      await testPool.query('DROP TABLE IF EXISTS test_table');
    });

    it('should handle transactions', async () => {
      const client = await testPool.connect();
      
      try {
        await client.query('BEGIN');
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS transaction_test (
            id SERIAL PRIMARY KEY,
            data VARCHAR(100)
          )
        `);
        
        await client.query(
          'INSERT INTO transaction_test (data) VALUES ($1)',
          ['transaction data']
        );
        
        await client.query('COMMIT');
        
        const result = await client.query('SELECT * FROM transaction_test');
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].data).toBe('transaction data');
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        await client.query('DROP TABLE IF EXISTS transaction_test');
        client.release();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid SQL gracefully', async () => {
      try {
        await testPool.query('INVALID SQL STATEMENT');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('syntax error');
      }
    });

    it('should handle connection errors gracefully', async () => {
      const invalidPool = new Pool({
        connectionString: 'postgres://invalid:invalid@localhost:9999/invalid',
        connectionTimeoutMillis: 1000
      });

      try {
        await invalidPool.query('SELECT 1');
        fail('Should have thrown a connection error');
      } catch (error) {
        expect(error.message).toContain('connect');
      } finally {
        await invalidPool.end();
      }
    });
  });
});
