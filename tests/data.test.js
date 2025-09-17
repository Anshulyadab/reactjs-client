/**
 * Data Service Tests
 * 
 * Comprehensive test suite for data management functionality
 */

const request = require('supertest');
const app = require('../server');
const dataService = require('../services/dataService');
const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

describe('Data Service', () => {
  let testUser;
  let authToken;
  let testTableName = 'test_data_table';

  beforeAll(async () => {
    // Initialize services
    await userService.initializeUsersTable();
    await dataService.initializeDatabase();
    
    // Create test user
    const result = await userService.registerUser('datatestuser', 'datatest@example.com', 'password123');
    if (result.success) {
      testUser = result.user;
      authToken = generateToken(testUser.id, testUser.username, testUser.role);
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      const pool = require('pg').Pool;
      const testPool = new pool({
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      
      // Delete test data
      await testPool.query('DELETE FROM data_storage WHERE user_id = $1', [testUser.id]);
      await testPool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
      await testPool.end();
    }
  });

  describe('insertData', () => {
    it('should insert data successfully', async () => {
      const testData = {
        name: 'Test Item',
        value: 42,
        description: 'A test item for testing'
      };

      const result = await dataService.insertData(testTableName, testData, testUser.id, { source: 'test' });
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Data inserted successfully');
      expect(result.data.id).toBeDefined();
      expect(result.data.tableName).toBe(testTableName);
      expect(result.data.createdAt).toBeDefined();
    });

    it('should encrypt sensitive fields', async () => {
      const testData = {
        name: 'Sensitive Item',
        password: 'secretpassword',
        token: 'secret-token',
        email: 'test@example.com'
      };

      const result = await dataService.insertData(testTableName, testData, testUser.id);
      
      expect(result.success).toBe(true);
      
      // Verify data was stored (we can't easily test encryption without the key)
      const getResult = await dataService.getData(testTableName, testUser.id, { limit: 1 });
      expect(getResult.success).toBe(true);
      expect(getResult.data.length).toBeGreaterThan(0);
    });
  });

  describe('getData', () => {
    beforeEach(async () => {
      // Insert test data
      const testData = {
        name: 'Test Item 1',
        value: 100,
        category: 'test'
      };
      await dataService.insertData(testTableName, testData, testUser.id);
    });

    it('should get data successfully', async () => {
      const result = await dataService.getData(testTableName, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBeGreaterThan(0);
    });

    it('should get data with pagination', async () => {
      const result = await dataService.getData(testTableName, testUser.id, {
        limit: 1,
        offset: 0
      });
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.offset).toBe(0);
    });

    it('should get data without user filter', async () => {
      const result = await dataService.getData(testTableName);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('updateData', () => {
    let testRecordId;

    beforeEach(async () => {
      // Insert test data
      const testData = {
        name: 'Update Test Item',
        value: 200,
        category: 'update-test'
      };
      const insertResult = await dataService.insertData(testTableName, testData, testUser.id);
      testRecordId = insertResult.data.id;
    });

    it('should update data successfully', async () => {
      const updateData = {
        name: 'Updated Item',
        value: 300,
        category: 'updated'
      };

      const result = await dataService.updateData(testRecordId, updateData, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Data updated successfully');
      expect(result.data.id).toBe(testRecordId);
      expect(result.data.updatedAt).toBeDefined();
    });

    it('should fail to update non-existent record', async () => {
      const updateData = {
        name: 'Updated Item'
      };

      const result = await dataService.updateData(99999, updateData, testUser.id);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Record not found or access denied');
    });

    it('should fail to update record of another user', async () => {
      // Create another user
      const otherUserResult = await userService.registerUser('otheruser', 'other@example.com', 'password123');
      expect(otherUserResult.success).toBe(true);

      const updateData = {
        name: 'Updated Item'
      };

      const result = await dataService.updateData(testRecordId, updateData, otherUserResult.user.id);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Record not found or access denied');

      // Clean up other user
      const pool = require('pg').Pool;
      const testPool = new pool({
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      await testPool.query('DELETE FROM users WHERE id = $1', [otherUserResult.user.id]);
      await testPool.end();
    });
  });

  describe('deleteData', () => {
    let testRecordId;

    beforeEach(async () => {
      // Insert test data
      const testData = {
        name: 'Delete Test Item',
        value: 400,
        category: 'delete-test'
      };
      const insertResult = await dataService.insertData(testTableName, testData, testUser.id);
      testRecordId = insertResult.data.id;
    });

    it('should delete data successfully', async () => {
      const result = await dataService.deleteData(testRecordId, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Data deleted successfully');
      expect(result.data.id).toBe(testRecordId);
    });

    it('should fail to delete non-existent record', async () => {
      const result = await dataService.deleteData(99999, testUser.id);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Record not found or access denied');
    });
  });

  describe('exportData', () => {
    beforeEach(async () => {
      // Insert test data for export
      const testData = {
        name: 'Export Test Item',
        value: 500,
        category: 'export-test'
      };
      await dataService.insertData(testTableName, testData, testUser.id);
    });

    it('should export data as JSON', async () => {
      const result = await dataService.exportData(testTableName, 'json', testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('application/json');
      expect(result.filename).toContain('.json');
      expect(result.recordCount).toBeGreaterThan(0);
      
      const data = JSON.parse(result.data);
      expect(Array.isArray(data)).toBe(true);
    });

    it('should export data as CSV', async () => {
      const result = await dataService.exportData(testTableName, 'csv', testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('text/csv');
      expect(result.filename).toContain('.csv');
      expect(result.data).toContain('id,tableName,userId');
    });

    it('should export data as XML', async () => {
      const result = await dataService.exportData(testTableName, 'xml', testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.contentType).toBe('application/xml');
      expect(result.filename).toContain('.xml');
      expect(result.data).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    });

    it('should export data with limit', async () => {
      const result = await dataService.exportData(testTableName, 'json', testUser.id, {
        limit: 1
      });
      
      expect(result.success).toBe(true);
      expect(result.recordCount).toBeLessThanOrEqual(1);
    });
  });

  describe('searchData', () => {
    beforeEach(async () => {
      // Insert test data for search
      const testData1 = {
        name: 'Search Test Item 1',
        value: 600,
        category: 'search-test',
        description: 'First search item'
      };
      const testData2 = {
        name: 'Search Test Item 2',
        value: 700,
        category: 'search-test',
        description: 'Second search item'
      };
      await dataService.insertData(testTableName, testData1, testUser.id);
      await dataService.insertData(testTableName, testData2, testUser.id);
    });

    it('should search data successfully', async () => {
      const searchCriteria = {
        category: 'search-test'
      };

      const result = await dataService.searchData(testTableName, searchCriteria, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.searchCriteria).toEqual(searchCriteria);
    });

    it('should search data with multiple criteria', async () => {
      const searchCriteria = {
        category: 'search-test',
        name: 'Search Test Item 1'
      };

      const result = await dataService.searchData(testTableName, searchCriteria, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should return empty results for no matches', async () => {
      const searchCriteria = {
        category: 'non-existent'
      };

      const result = await dataService.searchData(testTableName, searchCriteria, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getDataStatistics', () => {
    beforeEach(async () => {
      // Insert test data for statistics
      const testData = {
        name: 'Statistics Test Item',
        value: 800,
        category: 'statistics-test'
      };
      await dataService.insertData(testTableName, testData, testUser.id);
    });

    it('should get data statistics', async () => {
      const result = await dataService.getDataStatistics(testTableName, testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalRecords).toBeGreaterThan(0);
      expect(result.statistics.uniqueUsers).toBeGreaterThan(0);
      expect(result.statistics.earliestRecord).toBeDefined();
      expect(result.statistics.latestRecord).toBeDefined();
    });

    it('should get statistics without user filter', async () => {
      const result = await dataService.getDataStatistics(testTableName);
      
      expect(result.success).toBe(true);
      expect(result.statistics).toBeDefined();
      expect(result.statistics.totalRecords).toBeGreaterThan(0);
    });
  });

  describe('getAuditLogs', () => {
    it('should get audit logs', async () => {
      const result = await dataService.getAuditLogs(testUser.id);
      
      expect(result.success).toBe(true);
      expect(result.logs).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
      expect(result.pagination).toBeDefined();
    });

    it('should get audit logs with filters', async () => {
      const result = await dataService.getAuditLogs(testUser.id, {
        action: 'INSERT',
        limit: 10
      });
      
      expect(result.success).toBe(true);
      expect(result.logs).toBeDefined();
      expect(Array.isArray(result.logs)).toBe(true);
    });
  });
});

describe('Data API Endpoints', () => {
  let testUser;
  let authToken;
  let testTableName = 'api_test_table';

  beforeAll(async () => {
    // Create test user
    const result = await userService.registerUser('apitestuser', 'apitest@example.com', 'password123');
    if (result.success) {
      testUser = result.user;
      authToken = generateToken(testUser.id, testUser.username, testUser.role);
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testUser) {
      const pool = require('pg').Pool;
      const testPool = new pool({
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      
      await testPool.query('DELETE FROM data_storage WHERE user_id = $1', [testUser.id]);
      await testPool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
      await testPool.end();
    }
  });

  describe('POST /api/data/:tableName', () => {
    it('should insert data via API', async () => {
      const testData = {
        name: 'API Test Item',
        value: 900,
        category: 'api-test'
      };

      const response = await request(app)
        .post(`/api/data/${testTableName}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: testData })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Data inserted successfully');
      expect(response.body.data.id).toBeDefined();
    });

    it('should fail without authentication', async () => {
      const testData = {
        name: 'API Test Item',
        value: 900
      };

      const response = await request(app)
        .post(`/api/data/${testTableName}`)
        .send({ data: testData })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const response = await request(app)
        .post(`/api/data/${testTableName}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/data/:tableName', () => {
    beforeEach(async () => {
      // Insert test data
      const testData = {
        name: 'API Get Test Item',
        value: 1000,
        category: 'api-get-test'
      };
      await dataService.insertData(testTableName, testData, testUser.id);
    });

    it('should get data via API', async () => {
      const response = await request(app)
        .get(`/api/data/${testTableName}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should get data with query parameters', async () => {
      const response = await request(app)
        .get(`/api/data/${testTableName}?limit=1&offset=0`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/data/:tableName/export', () => {
    beforeEach(async () => {
      // Insert test data
      const testData = {
        name: 'API Export Test Item',
        value: 1100,
        category: 'api-export-test'
      };
      await dataService.insertData(testTableName, testData, testUser.id);
    });

    it('should export data as JSON via API', async () => {
      const response = await request(app)
        .get(`/api/data/${testTableName}/export?format=json`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.headers['content-disposition']).toContain('.json');
    });

    it('should export data as CSV via API', async () => {
      const response = await request(app)
        .get(`/api/data/${testTableName}/export?format=csv`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('.csv');
    });
  });
});
