# 🧪 Testing Guide

Comprehensive testing guide for the PostgreSQL React App across all environments.

## 📋 Table of Contents

- [🔍 Testing Overview](#-testing-overview)
- [🏠 Development Testing](#-development-testing)
- [🧪 Test Environment](#-test-environment)
- [🚀 Production Testing](#-production-testing)
- [🔌 Database Testing](#-database-testing)
- [🌐 API Testing](#-api-testing)
- [⚛️ Frontend Testing](#️-frontend-testing)
- [🚀 Deployment Testing](#-deployment-testing)
- [🛠️ Troubleshooting Tests](#️-troubleshooting-tests)

## 🔍 Testing Overview

### Testing Strategy

| Environment | Purpose | Testing Type | Tools |
|-------------|---------|--------------|-------|
| **Development** | Local development | Manual + Unit | Browser, Postman, Jest |
| **Test** | CI/CD pipeline | Automated | Jest, Supertest, Cypress |
| **Production** | Live application | Smoke + Monitoring | Browser, Vercel logs |

### Test Categories

1. **🔌 Connection Tests** - Database connectivity
2. **📊 Query Tests** - SQL execution
3. **🗂️ CRUD Tests** - String management
4. **🔍 Schema Tests** - Database inspection
5. **🌐 API Tests** - Backend endpoints
6. **⚛️ UI Tests** - Frontend functionality
7. **🚀 Deployment Tests** - Production deployment

## 🏠 Development Testing

### Prerequisites

```bash
# Install dependencies
npm install
npm run install-client

# Set up environment
cp config/env.example .env
# Edit .env with your database credentials
```

### 1. Port Testing

**Test port availability:**
```bash
npm run check-ports
```

**Expected Output:**
```
🔍 Checking port availability...
📊 Environment: development

✅ Available - Backend (Port 5000)
✅ Available - Frontend (Port 3000)

🎉 All ports are available! You can start the application.
```

**Test port conflicts:**
```bash
# Start another service on port 5000
# Then run:
npm run check-ports

# Expected: Port conflict detection
```

### 2. Application Startup Testing

**Start development server:**
```bash
npm run dev
```

**Expected Output:**
```
🚀 Starting PostgreSQL React App Development Environment
================================================
📊 Environment: development
🌐 Backend Port: 5000
⚛️  Frontend Port: 3000

🔧 Starting backend server...
🚀 Server is running on port 5000
📊 Environment: development
🌐 Backend URL: http://localhost:5000
⚛️  Frontend URL: http://localhost:3000

⚛️  Starting React frontend...
Compiled successfully!
You can now view client in the browser.
  Local:            http://localhost:3000
  On Your Network:  http://192.168.137.1:3000
```

### 3. Database Connection Testing

**Test database connection:**
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Test connection failure:**
```bash
# Stop PostgreSQL service
# Then test:
curl http://localhost:5000/api/health

# Expected: Fallback to in-memory storage
```

### 4. Frontend Testing

**Open browser and test:**

1. **Connection Form:**
   - Navigate to http://localhost:3000
   - Test connection string input
   - Verify connection status display

2. **String Management:**
   - Save a connection string
   - View saved strings
   - Delete a string

3. **SQL Query Tester:**
   - Execute predefined queries
   - Test custom SQL queries
   - Verify result display

4. **Database Schema:**
   - View table information
   - Check column details

5. **Connection Info:**
   - View database version
   - Check current user
   - Verify connection method

### 5. API Testing with Postman

**Create Postman collection:**

```json
{
  "info": {
    "name": "PostgreSQL React App API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Save String",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"connectionString\": \"postgres://user:pass@localhost:5432/mydb\"\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/save-string",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "save-string"]
        }
      }
    }
  ]
}
```

## 🧪 Test Environment

### Setup Test Environment

```bash
# Set test environment
export NODE_ENV=test
export BACKEND_PORT=5001
export FRONTEND_PORT=3001
export DATABASE_URL=postgres://test:test@localhost:5432/testdb
```

### 1. Unit Testing

**Run unit tests:**
```bash
npm test
```

**Test coverage:**
```bash
npm run test:coverage
```

**Watch mode:**
```bash
npm run test:watch
```

### 2. Integration Testing

**Create test database:**
```bash
# Create test database
createdb testdb

# Run integration tests
npm run test:integration
```

**Test API endpoints:**
```javascript
// tests/api.test.js
const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  test('GET /api/health', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
  });

  test('POST /api/execute-query', async () => {
    const response = await request(app)
      .post('/api/execute-query')
      .send({ query: 'SELECT 1 as test' })
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].test).toBe(1);
  });
});
```

### 3. Database Testing

**Test database operations:**
```javascript
// tests/database.test.js
const { Pool } = require('pg');

describe('Database Operations', () => {
  let pool;

  beforeAll(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  test('Database connection', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    expect(result.rows[0].test).toBe(1);
    client.release();
  });

  test('Table creation', async () => {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100)
      )
    `);
    client.release();
  });
});
```

### 4. E2E Testing

**Install Cypress:**
```bash
npm install --save-dev cypress
```

**Create E2E tests:**
```javascript
// cypress/e2e/app.cy.js
describe('PostgreSQL React App', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load the application', () => {
    cy.contains('PostgreSQL React App').should('be.visible');
  });

  it('should test database connection', () => {
    cy.get('[data-testid="connection-string-input"]')
      .type('postgres://test:test@localhost:5432/testdb');
    
    cy.get('[data-testid="test-connection-btn"]').click();
    
    cy.get('[data-testid="connection-status"]')
      .should('contain', 'Connected');
  });

  it('should execute SQL query', () => {
    cy.get('[data-testid="sql-query-input"]')
      .type('SELECT 1 as test');
    
    cy.get('[data-testid="execute-query-btn"]').click();
    
    cy.get('[data-testid="query-results"]')
      .should('contain', 'test');
  });
});
```

## 🚀 Production Testing

### 1. Build Testing

**Test production build:**
```bash
npm run build
npm start
```

**Verify build output:**
```bash
# Check if build directory exists
ls -la client/build/

# Expected files:
# - index.html
# - static/css/
# - static/js/
```

### 2. Vercel Deployment Testing

**Deploy to Vercel:**
```bash
npm run deploy
```

**Test deployment:**
```bash
# Get deployment URL
npx vercel ls

# Test production URL
curl https://your-app.vercel.app/api/health
```

**Check deployment logs:**
```bash
npx vercel logs <deployment-url>
```

### 3. Environment Variables Testing

**Verify environment variables:**
```bash
npx vercel env ls
```

**Test with different environments:**
```bash
# Test preview deployment
npx vercel --target preview

# Test production deployment
npx vercel --prod
```

### 4. Database Connection Testing

**Test production database:**
```bash
# Test with production database
curl https://your-app.vercel.app/api/health

# Expected: Connected to production database
```

**Test query execution:**
```bash
curl -X POST https://your-app.vercel.app/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT version();"}'
```

## 🔌 Database Testing

### 1. Connection String Testing

**Test various connection strings:**

```bash
# Local PostgreSQL
postgres://postgres:password@localhost:5432/mydb

# Neon Database
postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require

# Custom PostgreSQL
postgres://user:pass@your-host:5432/your-db
```

**Test connection failures:**
```bash
# Invalid credentials
postgres://wrong:wrong@localhost:5432/mydb

# Invalid host
postgres://user:pass@invalid-host:5432/mydb

# Invalid port
postgres://user:pass@localhost:9999/mydb
```

### 2. SQL Query Testing

**Test allowed queries:**
```sql
-- SELECT queries
SELECT * FROM users;
SELECT COUNT(*) FROM orders;
SELECT name, email FROM users WHERE active = true;

-- INSERT queries
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');

-- UPDATE queries
UPDATE users SET name = 'Jane' WHERE id = 1;

-- DELETE queries
DELETE FROM users WHERE id = 1;

-- CREATE queries
CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));

-- DROP queries
DROP TABLE test_table;

-- ALTER queries
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

**Test blocked queries:**
```sql
-- These should be blocked for security
DROP DATABASE mydb;
TRUNCATE TABLE users;
GRANT ALL PRIVILEGES ON DATABASE mydb TO user;
```

### 3. Schema Testing

**Test schema inspection:**
```bash
curl http://localhost:5000/api/schema
```

**Expected response:**
```json
{
  "success": true,
  "tables": [
    {
      "table_name": "users",
      "columns": [
        {
          "column_name": "id",
          "data_type": "integer",
          "is_nullable": "NO",
          "column_default": "nextval('users_id_seq'::regclass)"
        },
        {
          "column_name": "name",
          "data_type": "character varying",
          "is_nullable": "YES",
          "column_default": null
        }
      ]
    }
  ]
}
```

## 🌐 API Testing

### 1. Health Check Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. String Management Testing

```bash
# Save a string
curl -X POST http://localhost:5000/api/save-string \
  -H "Content-Type: application/json" \
  -d '{"connectionString": "postgres://user:pass@localhost:5432/mydb"}'

# Get all strings
curl http://localhost:5000/api/strings

# Delete a string
curl -X DELETE http://localhost:5000/api/strings/1
```

### 3. Query Execution Testing

```bash
# Execute a query
curl -X POST http://localhost:5000/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT version();"}'

# Test error handling
curl -X POST http://localhost:5000/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "INVALID SQL"}'
```

### 4. Connection Info Testing

```bash
# Get connection information
curl http://localhost:5000/api/connection-info

# Expected response:
{
  "success": true,
  "version": "PostgreSQL 15.0",
  "current_user": "postgres",
  "current_database": "mydb",
  "connection_method": "direct"
}
```

## ⚛️ Frontend Testing

### 1. Component Testing

```javascript
// client/src/App.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders application title', () => {
    render(<App />);
    expect(screen.getByText('PostgreSQL React App')).toBeInTheDocument();
  });

  test('displays connection form', () => {
    render(<App />);
    expect(screen.getByTestId('connection-string-input')).toBeInTheDocument();
  });

  test('handles connection string input', () => {
    render(<App />);
    const input = screen.getByTestId('connection-string-input');
    fireEvent.change(input, { target: { value: 'postgres://test:test@localhost:5432/testdb' } });
    expect(input.value).toBe('postgres://test:test@localhost:5432/testdb');
  });
});
```

### 2. Integration Testing

```javascript
// client/src/__tests__/integration.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock fetch
global.fetch = jest.fn();

describe('Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('should test database connection', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Connected' })
    });

    render(<App />);
    
    const input = screen.getByTestId('connection-string-input');
    fireEvent.change(input, { target: { value: 'postgres://test:test@localhost:5432/testdb' } });
    
    const button = screen.getByTestId('test-connection-btn');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });
  });
});
```

### 3. E2E Testing

```javascript
// cypress/e2e/app.cy.js
describe('PostgreSQL React App E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should complete full workflow', () => {
    // Test connection
    cy.get('[data-testid="connection-string-input"]')
      .type('postgres://test:test@localhost:5432/testdb');
    
    cy.get('[data-testid="test-connection-btn"]').click();
    
    cy.get('[data-testid="connection-status"]')
      .should('contain', 'Connected');

    // Execute query
    cy.get('[data-testid="sql-query-input"]')
      .type('SELECT 1 as test');
    
    cy.get('[data-testid="execute-query-btn"]').click();
    
    cy.get('[data-testid="query-results"]')
      .should('contain', 'test');

    // View schema
    cy.get('[data-testid="schema-tab"]').click();
    
    cy.get('[data-testid="schema-content"]')
      .should('be.visible');
  });
});
```

## 🚀 Deployment Testing

### 1. Local Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Test production build
curl http://localhost:5000/api/health
```

### 2. Vercel Deployment

```bash
# Deploy to Vercel
npm run deploy

# Test deployment
curl https://your-app.vercel.app/api/health

# Check deployment status
npx vercel ls
```

### 3. Environment Variables

```bash
# Check environment variables
npx vercel env ls

# Test with different environments
npx vercel --target preview
npx vercel --prod
```

### 4. Database Connection

```bash
# Test production database connection
curl https://your-app.vercel.app/api/health

# Test query execution
curl -X POST https://your-app.vercel.app/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT version();"}'
```

## 🛠️ Troubleshooting Tests

### 1. Port Conflict Testing

```bash
# Test port availability
npm run check-ports

# Test port conflicts
# Start another service on port 5000
# Then run:
npm run check-ports

# Expected: Port conflict detection
```

### 2. Database Connection Testing

```bash
# Test with invalid credentials
curl -X POST http://localhost:5000/api/save-string \
  -H "Content-Type: application/json" \
  -d '{"connectionString": "postgres://wrong:wrong@localhost:5432/mydb"}'

# Expected: Connection failure with fallback
```

### 3. Error Handling Testing

```bash
# Test invalid SQL
curl -X POST http://localhost:5000/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "INVALID SQL"}'

# Expected: Error response with message
```

### 4. Fallback Testing

```bash
# Stop PostgreSQL service
# Test application functionality
curl http://localhost:5000/api/health

# Expected: Fallback to in-memory storage
```

## 📊 Test Results

### Expected Test Results

| Test Category | Development | Test | Production |
|---------------|-------------|------|------------|
| **Port Testing** | ✅ Pass | ✅ Pass | ✅ Pass |
| **Database Connection** | ✅ Pass | ✅ Pass | ✅ Pass |
| **API Endpoints** | ✅ Pass | ✅ Pass | ✅ Pass |
| **Frontend UI** | ✅ Pass | ✅ Pass | ✅ Pass |
| **Query Execution** | ✅ Pass | ✅ Pass | ✅ Pass |
| **Schema Inspection** | ✅ Pass | ✅ Pass | ✅ Pass |
| **Deployment** | N/A | ✅ Pass | ✅ Pass |

### Test Coverage

- **Unit Tests:** 90%+ coverage
- **Integration Tests:** 85%+ coverage
- **E2E Tests:** 80%+ coverage
- **API Tests:** 95%+ coverage

---

## 🎯 Testing Checklist

### Before Development
- [ ] Port availability checked
- [ ] Database connection verified
- [ ] Environment variables set
- [ ] Dependencies installed

### During Development
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] API endpoints tested
- [ ] Frontend functionality verified

### Before Deployment
- [ ] Production build successful
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] All tests passing

### After Deployment
- [ ] Production URL accessible
- [ ] API endpoints responding
- [ ] Database connection working
- [ ] Frontend loading correctly

---

**Happy Testing! 🧪✨**
