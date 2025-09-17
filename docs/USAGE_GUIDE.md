# 📖 Usage Guide

Comprehensive usage guide for the PostgreSQL React App with real-world scenarios and examples.

## 📋 Table of Contents

- [🎯 Use Cases](#-use-cases)
- [🔌 Database Connection Scenarios](#-database-connection-scenarios)
- [📊 SQL Query Examples](#-sql-query-examples)
- [🗂️ String Management](#️-string-management)
- [🔍 Schema Inspection](#-schema-inspection)
- [🚀 Deployment Scenarios](#-deployment-scenarios)
- [🛠️ Troubleshooting Scenarios](#️-troubleshooting-scenarios)
- [💡 Best Practices](#-best-practices)

## 🎯 Use Cases

### 1. 🏢 Enterprise Development Teams

**Scenario:** A development team needs to test database connections across multiple environments.

**Use Case:**
- **Development:** Test local PostgreSQL connections
- **Staging:** Validate staging database configurations
- **Production:** Monitor production database health

**Implementation:**
```bash
# Development environment
DATABASE_URL=postgres://dev:dev@localhost:5432/devdb

# Staging environment
DATABASE_URL=postgres://staging:staging@staging-db:5432/stagingdb

# Production environment
DATABASE_URL=postgresql://prod:prod@prod-db:5432/proddb
```

### 2. 🎓 Educational Institutions

**Scenario:** Database administration courses need a hands-on tool for students.

**Use Case:**
- **Learning SQL:** Practice SQL queries safely
- **Database Design:** Test table creation and relationships
- **Connection Management:** Understand different connection methods

**Implementation:**
```sql
-- Create sample database for students
CREATE DATABASE student_db;

-- Create sample tables
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    grade VARCHAR(10)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    credits INTEGER
);
```

### 3. 🏗️ DevOps Teams

**Scenario:** DevOps teams need to validate database configurations during deployments.

**Use Case:**
- **Pre-deployment:** Test database connectivity
- **Post-deployment:** Verify database health
- **Monitoring:** Check database performance

**Implementation:**
```bash
# Pre-deployment testing
curl -X POST https://your-app.vercel.app/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT COUNT(*) FROM users;"}'

# Health check monitoring
curl https://your-app.vercel.app/api/health
```

### 4. 🔍 Database Administrators

**Scenario:** DBAs need a quick tool to inspect and test database schemas.

**Use Case:**
- **Schema Analysis:** Inspect table structures
- **Performance Testing:** Execute test queries
- **Connection Validation:** Test different connection strings

**Implementation:**
```bash
# Schema inspection
curl https://your-app.vercel.app/api/schema

# Connection information
curl https://your-app.vercel.app/api/connection-info

# Query execution
curl -X POST https://your-app.vercel.app/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM pg_stat_activity;"}'
```

## 🔌 Database Connection Scenarios

### 1. 🏠 Local Development

**Scenario:** Setting up a local development environment with PostgreSQL.

**Connection String:**
```bash
postgres://postgres:password@localhost:5432/mydb
```

**Setup Steps:**
1. **Install PostgreSQL:**
   ```bash
   # Windows: Download from postgresql.org
   # macOS: brew install postgresql
   # Linux: sudo apt-get install postgresql
   ```

2. **Create Database:**
   ```bash
   createdb mydb
   ```

3. **Test Connection:**
   ```bash
   psql -h localhost -U postgres -d mydb
   ```

4. **Use in App:**
   - Open the application
   - Enter connection string in the form
   - Click "Test Connection"

### 2. ☁️ Cloud Database (Neon)

**Scenario:** Using a serverless PostgreSQL database for production.

**Connection String:**
```bash
postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

**Setup Steps:**
1. **Sign up for Neon:**
   - Go to [neon.tech](https://neon.tech)
   - Create a new account
   - Create a new project

2. **Get Connection String:**
   - Copy the connection string from Neon dashboard
   - Note the SSL requirement

3. **Test Connection:**
   - Use the connection string in the app
   - Verify SSL connection works

### 3. 🏢 Enterprise Database

**Scenario:** Connecting to a corporate PostgreSQL instance.

**Connection String:**
```bash
postgres://corp_user:corp_pass@corp-db.company.com:5432/corp_db?sslmode=require
```

**Setup Steps:**
1. **Get Credentials:**
   - Contact your database administrator
   - Obtain connection credentials
   - Verify network access

2. **Test Connection:**
   - Use the connection string in the app
   - Verify SSL and network connectivity

3. **Save Connection:**
   - Save the connection string for future use
   - Test regularly to ensure connectivity

### 4. 🐳 Docker Database

**Scenario:** Using PostgreSQL in a Docker container.

**Connection String:**
```bash
postgres://postgres:password@localhost:5432/docker_db
```

**Setup Steps:**
1. **Run PostgreSQL Container:**
   ```bash
   docker run --name postgres-db \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=docker_db \
     -p 5432:5432 \
     -d postgres:15
   ```

2. **Test Connection:**
   - Use the connection string in the app
   - Verify container connectivity

## 📊 SQL Query Examples

### 1. 🔍 Data Exploration

**Scenario:** Exploring a new database to understand its structure.

**Queries:**
```sql
-- Get database version
SELECT version();

-- List all databases
SELECT datname FROM pg_database;

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Get table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users';
```

### 2. 📊 Data Analysis

**Scenario:** Analyzing data for business insights.

**Queries:**
```sql
-- Count records
SELECT COUNT(*) FROM users;

-- Group by analysis
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Date range analysis
SELECT DATE(created_at) as date, COUNT(*) as orders
FROM orders 
WHERE created_at >= '2024-01-01'
GROUP BY DATE(created_at)
ORDER BY date;

-- Top customers
SELECT customer_id, SUM(amount) as total_spent
FROM orders 
GROUP BY customer_id 
ORDER BY total_spent DESC 
LIMIT 10;
```

### 3. 🏗️ Schema Management

**Scenario:** Creating and modifying database schema.

**Queries:**
```sql
-- Create table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2),
    category_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add column
ALTER TABLE products ADD COLUMN description TEXT;

-- Create index
CREATE INDEX idx_products_category ON products(category_id);

-- Add foreign key
ALTER TABLE products 
ADD CONSTRAINT fk_products_category 
FOREIGN KEY (category_id) REFERENCES categories(id);
```

### 4. 🔧 Maintenance Queries

**Scenario:** Database maintenance and optimization.

**Queries:**
```sql
-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check active connections
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE state = 'active';

-- Vacuum analysis
VACUUM ANALYZE;
```

## 🗂️ String Management

### 1. 💾 Saving Connection Strings

**Scenario:** Managing multiple database connections for different environments.

**Implementation:**
```javascript
// Save development connection
const devConnection = "postgres://dev:dev@localhost:5432/devdb";
// Use the "String Management" tab to save

// Save staging connection
const stagingConnection = "postgres://staging:staging@staging-db:5432/stagingdb";

// Save production connection
const prodConnection = "postgresql://prod:prod@prod-db:5432/proddb?sslmode=require";
```

**Best Practices:**
- Use descriptive names for saved strings
- Include environment information
- Regularly test saved connections
- Keep credentials secure

### 2. 🔄 Connection String Rotation

**Scenario:** Rotating database credentials for security.

**Implementation:**
```bash
# Old connection string
postgres://old_user:old_pass@db:5432/mydb

# New connection string
postgres://new_user:new_pass@db:5432/mydb

# Update in the app
# 1. Test new connection
# 2. Save new connection string
# 3. Delete old connection string
```

### 3. 🌍 Multi-Environment Management

**Scenario:** Managing connections across multiple environments.

**Implementation:**
```bash
# Development
DEV_DB=postgres://dev:dev@localhost:5432/devdb

# Staging
STAGING_DB=postgres://staging:staging@staging-db:5432/stagingdb

# Production
PROD_DB=postgresql://prod:prod@prod-db:5432/proddb?sslmode=require
```

## 🔍 Schema Inspection

### 1. 📋 Table Analysis

**Scenario:** Understanding the structure of existing tables.

**Implementation:**
```bash
# Get all tables
curl http://localhost:5000/api/schema

# Response includes:
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

### 2. 🔗 Relationship Analysis

**Scenario:** Understanding table relationships and foreign keys.

**Queries:**
```sql
-- Get foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

### 3. 📊 Index Analysis

**Scenario:** Analyzing database indexes for performance optimization.

**Queries:**
```sql
-- Get all indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Get index usage statistics
SELECT
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## 🚀 Deployment Scenarios

### 1. 🌐 Vercel Deployment

**Scenario:** Deploying the application to Vercel for production use.

**Implementation:**
```bash
# Deploy to Vercel
npm run deploy

# Set environment variables
npx vercel env add DATABASE_URL
npx vercel env add NODE_ENV

# Verify deployment
curl https://your-app.vercel.app/api/health
```

**Configuration:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

### 2. 🔄 GitHub Actions Deployment

**Scenario:** Setting up automated deployment with GitHub Actions.

**Implementation:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 3. 🐳 Docker Deployment

**Scenario:** Deploying the application using Docker containers.

**Implementation:**
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgres://postgres:password@db:5432/mydb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=mydb
    ports:
      - "5432:5432"
```

## 🛠️ Troubleshooting Scenarios

### 1. 🔌 Connection Issues

**Scenario:** Database connection fails with authentication error.

**Problem:**
```bash
Error: password authentication failed for user "postgres"
```

**Solutions:**
1. **Check credentials:**
   ```bash
   # Verify username and password
   psql -h localhost -U postgres -d mydb
   ```

2. **Reset password:**
   ```bash
   # Connect as superuser
   sudo -u postgres psql
   
   # Reset password
   ALTER USER postgres PASSWORD 'new_password';
   ```

3. **Check pg_hba.conf:**
   ```bash
   # Edit authentication method
   sudo nano /etc/postgresql/15/main/pg_hba.conf
   
   # Change to:
   local   all             postgres                                md5
   ```

### 2. 🚪 Port Conflicts

**Scenario:** Application fails to start due to port conflicts.

**Problem:**
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Check port usage:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

2. **Kill process:**
   ```bash
   # Windows
   taskkill /PID <PID> /F
   
   # Linux/Mac
   kill -9 <PID>
   ```

3. **Use different port:**
   ```bash
   export PORT=5001
   npm start
   ```

### 3. 🗄️ Database Issues

**Scenario:** SQL queries fail with permission errors.

**Problem:**
```bash
Error: permission denied for table users
```

**Solutions:**
1. **Grant permissions:**
   ```sql
   GRANT SELECT, INSERT, UPDATE, DELETE ON users TO your_user;
   ```

2. **Check user roles:**
   ```sql
   SELECT rolname, rolsuper, rolinherit, rolcreaterole, rolcreatedb, rolcanlogin
   FROM pg_roles
   WHERE rolname = 'your_user';
   ```

3. **Use superuser:**
   ```bash
   # Connect as superuser
   psql -h localhost -U postgres -d mydb
   ```

### 4. 🚀 Deployment Issues

**Scenario:** Vercel deployment fails with build errors.

**Problem:**
```bash
Error: Build failed - Module not found
```

**Solutions:**
1. **Check dependencies:**
   ```bash
   npm install
   npm run build
   ```

2. **Verify file paths:**
   ```bash
   # Check if all files exist
   ls -la client/build/
   ```

3. **Check environment variables:**
   ```bash
   npx vercel env ls
   ```

## 💡 Best Practices

### 1. 🔒 Security

**Connection String Security:**
- Use environment variables for sensitive data
- Rotate credentials regularly
- Use SSL connections in production
- Limit database user permissions

**Query Security:**
- Validate input parameters
- Use parameterized queries
- Implement query timeouts
- Monitor query execution

### 2. 🚀 Performance

**Database Performance:**
- Use connection pooling
- Implement query caching
- Monitor query performance
- Optimize database indexes

**Application Performance:**
- Use production builds
- Implement error handling
- Monitor application metrics
- Use CDN for static assets

### 3. 🔄 Maintenance

**Regular Maintenance:**
- Test connections regularly
- Update dependencies
- Monitor application logs
- Backup database configurations

**Monitoring:**
- Set up health checks
- Monitor error rates
- Track performance metrics
- Alert on failures

### 4. 📚 Documentation

**Code Documentation:**
- Document API endpoints
- Include usage examples
- Maintain change logs
- Update README files

**User Documentation:**
- Provide setup guides
- Include troubleshooting steps
- Create video tutorials
- Maintain FAQ sections

---

## 🎯 Quick Reference

### Common Commands

```bash
# Start development
npm run dev

# Check ports
npm run check-ports

# Build for production
npm run build

# Deploy to Vercel
npm run deploy

# Test API
curl http://localhost:5000/api/health
```

### Common Queries

```sql
-- Health check
SELECT 1;

-- Database version
SELECT version();

-- List tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Table structure
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
```

### Common URLs

```bash
# Development
http://localhost:3000  # Frontend
http://localhost:5000  # Backend

# Production
https://your-app.vercel.app  # Full application
```

---

**Happy Database Testing! 🗄️✨**
