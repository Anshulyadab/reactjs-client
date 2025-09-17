/**
 * Authentication Tests
 * 
 * Comprehensive test suite for authentication functionality
 */

const request = require('supertest');
const app = require('../server');
const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');

describe('Authentication System', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Initialize test database
    await userService.initializeUsersTable();
  });

  beforeEach(async () => {
    // Create test user
    const result = await userService.registerUser('testuser', 'test@example.com', 'password123');
    if (result.success) {
      testUser = result.user;
      authToken = generateToken(testUser.id, testUser.username, testUser.role);
    }
  });

  afterEach(async () => {
    // Clean up test data
    if (testUser) {
      // Delete test user from database
      const pool = require('pg').Pool;
      const testPool = new pool({
        connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      });
      await testPool.query('DELETE FROM users WHERE username = $1', ['testuser']);
      await testPool.end();
    }
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('user');
      expect(response.body.user.password).toBeUndefined();
    });

    it('should fail with invalid email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with short password', async () => {
      const userData = {
        username: 'testuser3',
        email: 'test3@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should fail with duplicate username', async () => {
      const userData = {
        username: 'testuser',
        email: 'different@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        username: 'testuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.username).toBe(loginData.username);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should fail with invalid username', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with invalid password', async () => {
      const loginData = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe('testuser');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. No token provided.');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token.');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile with valid data', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.username).toBe(updateData.username);
      expect(response.body.user.email).toBe(updateData.email);
    });

    it('should fail with invalid email', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password with valid current password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password updated successfully');
    });

    it('should fail with incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should fail with short new password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: '123'
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(passwordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });
  });
});

describe('User Service Functions', () => {
  beforeAll(async () => {
    await userService.initializeUsersTable();
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const result = await userService.registerUser('serviceuser', 'service@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user.username).toBe('serviceuser');
      expect(result.user.email).toBe('service@example.com');
      expect(result.user.role).toBe('user');
    });

    it('should fail with duplicate username', async () => {
      const result = await userService.registerUser('serviceuser', 'different@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('already exists');
    });
  });

  describe('loginUser', () => {
    it('should login with valid credentials', async () => {
      const result = await userService.loginUser('serviceuser', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user.username).toBe('serviceuser');
    });

    it('should fail with invalid credentials', async () => {
      const result = await userService.loginUser('serviceuser', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile', async () => {
      // First register a user
      const registerResult = await userService.registerUser('profileuser', 'profile@example.com', 'password123');
      expect(registerResult.success).toBe(true);

      const result = await userService.getUserProfile(registerResult.user.id);
      
      expect(result.success).toBe(true);
      expect(result.user.username).toBe('profileuser');
      expect(result.user.email).toBe('profile@example.com');
    });

    it('should fail with non-existent user', async () => {
      const result = await userService.getUserProfile(99999);
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
    });
  });
});
