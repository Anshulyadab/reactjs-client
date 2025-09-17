# 🚀 PostgreSQL React App

A comprehensive full-stack application for testing PostgreSQL database connections with a modern React frontend and Express.js backend. Perfect for database administrators, developers, and teams who need to test and manage PostgreSQL connections.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
- [🌍 Environments](#-environments)
- [🧪 Testing](#-testing)
- [📖 Usage Guide](#-usage-guide)
- [🔧 Configuration](#-configuration)
- [🚀 Deployment](#-deployment)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

This application provides a complete interface for:
- **Testing PostgreSQL connections** with various connection strings
- **Executing SQL queries** safely with built-in security checks
- **Managing database strings** with CRUD operations
- **Inspecting database schemas** and connection information
- **Deploying to production** with Vercel and Neon integration

## ✨ Features

### 🔌 Database Features
- ✅ **Multiple Connection Support** - Neon, custom PostgreSQL, local databases
- ✅ **Connection Testing** - Real-time connection validation
- ✅ **SQL Query Execution** - Safe query execution with security checks
- ✅ **Schema Inspection** - View tables, columns, and database structure
- ✅ **Connection Info** - Database version, user, and connection details

### 🎨 Frontend Features
- ✅ **Modern React UI** - Clean, responsive interface with glassmorphism design
- ✅ **Tabbed Interface** - Organized sections for different functionalities
- ✅ **Real-time Feedback** - Live connection status and error handling
- ✅ **Predefined Queries** - Common SQL queries for quick testing
- ✅ **Custom Query Input** - Execute your own SQL statements

### 🚀 Deployment Features
- ✅ **Vercel Integration** - One-click deployment to Vercel
- ✅ **Neon Database** - Serverless PostgreSQL integration
- ✅ **GitHub Actions** - Automated CI/CD pipeline
- ✅ **Environment Management** - Multiple environment support
- ✅ **Port Management** - Automatic port conflict resolution

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Express Backend│    │  PostgreSQL DB  │
│   (Port 3000)   │◄──►│   (Port 5000)   │◄──►│  (Neon/Local)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐            ┌─────▼─────┐           ┌─────▼─────┐
    │  UI/UX  │            │   API     │           │   Data    │
    │  State  │            │  Routes   │           │ Storage   │
    │Management│            │Middleware │           │  Schema   │
    └─────────┘            └───────────┘           └───────────┘
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** database (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd postgres-react-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm run install-client
   ```

3. **Set up environment variables:**
   ```bash
   cp config/env.example .env
   # Edit .env with your database credentials
   ```

4. **Start development:**
   ```bash
   npm run dev
   ```

5. **Access the application:**
   - Application: http://localhost:8080
   - API: http://localhost:8080/api

## 🌍 Environments

### 🏠 Development Environment

**Purpose:** Local development and testing

**Configuration:**
```bash
NODE_ENV=development
PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
```

**Usage:**
- **Local development** with hot reload
- **Database testing** with local PostgreSQL
- **Feature development** and debugging
- **API testing** with Postman or similar tools

**Start Commands:**
```bash
npm run dev          # Start with port checking and build
npm run dev:simple   # Start without port checking
npm run server       # Start server only
npm run build        # Build React app
```

### 🧪 Test Environment

**Purpose:** Automated testing and CI/CD

**Configuration:**
```bash
NODE_ENV=test
PORT=8080
DATABASE_URL=postgres://test:test@localhost:5432/testdb
```

**Usage:**
- **Unit testing** with Jest
- **Integration testing** with test database
- **CI/CD pipeline** testing
- **Automated deployment** validation

**Test Commands:**
```bash
npm test             # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

### 🚀 Production Environment

**Purpose:** Live application deployment

**Configuration:**
```bash
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

**Usage:**
- **Live application** for end users
- **Production database** with Neon or custom PostgreSQL
- **Scalable deployment** with Vercel
- **Monitoring and logging** in production

**Deployment:**
```bash
npm run build        # Build for production
npm start           # Start production server
npm run deploy      # Deploy to Vercel
```

## 🧪 Testing

### 🔍 Port Testing

**Check port availability:**
```bash
npm run check-ports
```

**Expected Output:**
```
🔍 Checking port availability...
📊 Environment: development

✅ Available - Application (Port 8080)

🎉 Port is available! You can start the application.
```

### 🗄️ Database Testing

**1. Connection Testing:**
```bash
# Test database connection
curl http://localhost:8080/api/health

# Expected response:
{"status":"ok","database":"connected"}
```

**2. Query Testing:**
```bash
# Test SQL query execution
curl -X POST http://localhost:8080/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT version();"}'
```

**3. Schema Testing:**
```bash
# Test schema inspection
curl http://localhost:8080/api/schema

# Expected response:
{"success":true,"tables":[...]}
```

### 🌐 Frontend Testing

**1. Component Testing:**
```bash
cd client
npm test
```

**2. E2E Testing:**
```bash
# Start the application
npm run dev

# Open browser and test:
# - Connection form
# - SQL query execution
# - Schema inspection
# - String management
```

### 🚀 Deployment Testing

**1. Local Production Build:**
```bash
npm run build
npm start
```

**2. Vercel Deployment:**
```bash
npm run deploy
```

**3. Environment Variables:**
```bash
npx vercel env ls
```

## 📖 Usage Guide

### 🔌 Database Connection Testing

**1. Basic Connection:**
```javascript
// Test connection with connection string
const connectionString = "postgres://user:pass@host:5432/db";
// Use the connection form in the UI
```

**2. Neon Database:**
```javascript
// Neon connection string format
const neonUrl = "postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require";
```

**3. Local PostgreSQL:**
```javascript
// Local connection string
const localUrl = "postgres://postgres:password@localhost:5432/mydb";
```

### 📊 SQL Query Execution

**1. Safe Queries (Allowed):**
```sql
-- SELECT queries
SELECT * FROM users;
SELECT COUNT(*) FROM orders;

-- INSERT queries
INSERT INTO users (name, email) VALUES ('John', 'john@example.com');

-- UPDATE queries
UPDATE users SET name = 'Jane' WHERE id = 1;

-- DELETE queries
DELETE FROM users WHERE id = 1;
```

**2. Schema Operations:**
```sql
-- Create table
CREATE TABLE test_table (id SERIAL PRIMARY KEY, name VARCHAR(100));

-- Drop table
DROP TABLE test_table;

-- Alter table
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

**3. Security Features:**
- ✅ Only SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER allowed
- ✅ SQL injection protection
- ✅ Query timeout protection
- ✅ Result size limits

### 🗂️ String Management

**1. Save Connection Strings:**
```javascript
// Save a connection string
const connectionString = "postgres://user:pass@host:5432/db";
// Use the "String Management" tab to save and manage strings
```

**2. Retrieve Saved Strings:**
```javascript
// Get all saved strings
GET /api/strings

// Get specific string
GET /api/strings/:id
```

**3. Delete Strings:**
```javascript
// Delete a string
DELETE /api/strings/:id
```

### 🔍 Schema Inspection

**1. View Tables:**
```javascript
// Get all tables
GET /api/schema

// Response includes:
{
  "success": true,
  "tables": [
    {
      "table_name": "users",
      "columns": [
        {"column_name": "id", "data_type": "integer"},
        {"column_name": "name", "data_type": "character varying"}
      ]
    }
  ]
}
```

**2. Connection Information:**
```javascript
// Get connection details
GET /api/connection-info

// Response includes:
{
  "success": true,
  "version": "PostgreSQL 15.0",
  "current_user": "postgres",
  "current_database": "mydb",
  "connection_method": "direct"
}
```

## 🔧 Configuration

### 📁 Environment Variables

**Database Configuration:**
```bash
# Individual parameters
DB_USER=postgres
DB_HOST=localhost
DB_NAME=mydb
DB_PASSWORD=your_password
DB_PORT=5432

# Connection strings (choose one)
DATABASE_URL=postgres://user:pass@host:5432/db
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

**Server Configuration:**
```bash
NODE_ENV=development
PORT=5000
BACKEND_PORT=5000
FRONTEND_PORT=3000
```

### ⚙️ Port Configuration

**Default Ports:**
```javascript
// config/ports.js
const config = {
  development: {
    backend: 5000,
    frontend: 3000
  },
  production: {
    backend: 5000,
    frontend: 5000  // Served by Express
  },
  test: {
    backend: 5001,
    frontend: 3001
  }
};
```

**Custom Ports:**
```bash
# Set custom ports
export BACKEND_PORT=8000
export FRONTEND_PORT=8001
npm run dev
```

### 🗄️ Database Configuration

**1. Local PostgreSQL:**
```bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb mydb

# Set connection string
DATABASE_URL=postgres://postgres:password@localhost:5432/mydb
```

**2. Neon Database:**
```bash
# Sign up at neon.tech
# Create a new project
# Copy connection string
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

**3. Custom PostgreSQL:**
```bash
# Use your own PostgreSQL instance
DATABASE_URL=postgres://user:pass@your-host:5432/your-db
```

## 🚀 Deployment

### 🌐 Vercel Deployment

**1. Automatic Deployment:**
```bash
# Deploy to Vercel
npm run deploy

# Or use Vercel CLI
npx vercel --prod
```

**2. Environment Variables:**
```bash
# Set environment variables in Vercel
npx vercel env add DATABASE_URL
npx vercel env add NODE_ENV
```

**3. Custom Domain:**
```bash
# Add custom domain in Vercel dashboard
# Or use Vercel CLI
npx vercel domains add yourdomain.com
```

### 🔄 GitHub Actions

**1. Setup GitHub Actions:**
```bash
# Follow the guide in docs/GITHUB_ACTIONS_SETUP.md
# Set up GitHub Secrets:
# - VERCEL_TOKEN
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID
```

**2. Automated Deployment:**
```bash
# Push to main branch triggers deployment
git push origin main
```

**3. Manual Deployment:**
```bash
# Trigger deployment manually
gh workflow run deploy.yml
```

### 🗄️ Database Deployment

**1. Neon Database:**
```bash
# Sign up at neon.tech
# Create project
# Copy connection string
# Add to Vercel environment variables
```

**2. Custom PostgreSQL:**
```bash
# Set up your PostgreSQL instance
# Configure SSL if needed
# Add connection string to environment variables
```

## 🛠️ Troubleshooting

### 🔌 Connection Issues

**Problem:** Database connection failed
```bash
Error: password authentication failed for user "postgres"
```

**Solutions:**
1. **Check credentials** in `.env` file
2. **Verify PostgreSQL is running:**
   ```bash
   # Windows
   net start postgresql-x64-13
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```
3. **Test connection manually:**
   ```bash
   psql -h localhost -U postgres -d mydb
   ```

### 🚪 Port Conflicts

**Problem:** Port already in use
```bash
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Check port availability:**
   ```bash
   npm run check-ports
   ```
2. **Kill process using port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -i :5000
   kill -9 <PID>
   ```
3. **Use different ports:**
   ```bash
   set BACKEND_PORT=5001
   set FRONTEND_PORT=3001
   npm run dev
   ```

### 🚀 Deployment Issues

**Problem:** Vercel deployment failed
```bash
Error: Build failed
```

**Solutions:**
1. **Check build logs:**
   ```bash
   npx vercel logs <deployment-url>
   ```
2. **Verify environment variables:**
   ```bash
   npx vercel env ls
   ```
3. **Test local build:**
   ```bash
   npm run build
   npm start
   ```

### 🗄️ Database Issues

**Problem:** Table doesn't exist
```bash
Error: relation "users" does not exist
```

**Solutions:**
1. **Create table manually:**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100),
     email VARCHAR(100)
   );
   ```
2. **Use the app to create tables:**
   - Go to "SQL Query Tester" tab
   - Execute CREATE TABLE statements

## 📚 Documentation

### 📁 Documentation Structure

```
docs/
├── README.md                    # Documentation index
├── DEPLOYMENT.md               # Deployment guide
├── GITHUB_ACTIONS_SETUP.md     # GitHub Actions setup
├── PORT_TROUBLESHOOTING.md     # Port troubleshooting
└── PROJECT_STRUCTURE.md        # Project organization
```

### 🔗 Useful Links

- **Vercel Documentation:** https://vercel.com/docs
- **Neon Documentation:** https://neon.tech/docs
- **PostgreSQL Documentation:** https://www.postgresql.org/docs/
- **React Documentation:** https://reactjs.org/docs
- **Express.js Documentation:** https://expressjs.com/

### 📖 API Documentation

**Base URL:** `http://localhost:5000/api` (development) or `https://your-app.vercel.app/api` (production)

**Endpoints:**
- `GET /api/health` - Health check
- `POST /api/save-string` - Save connection string
- `GET /api/strings` - Get all saved strings
- `DELETE /api/strings/:id` - Delete string
- `POST /api/execute-query` - Execute SQL query
- `GET /api/schema` - Get database schema
- `GET /api/connection-info` - Get connection information

## 🤝 Contributing

### 🛠️ Development Setup

1. **Fork the repository**
2. **Clone your fork:**
   ```bash
   git clone https://github.com/your-username/postgres-react-app.git
   cd postgres-react-app
   ```
3. **Install dependencies:**
   ```bash
   npm install
   npm run install-client
   ```
4. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Make changes and test:**
   ```bash
   npm run dev
   npm test
   ```
6. **Commit and push:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```
7. **Create Pull Request**

### 📝 Code Style

- **ESLint** for JavaScript/React code
- **Prettier** for code formatting
- **Conventional Commits** for commit messages
- **JSDoc** for function documentation

### 🧪 Testing

- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **E2E tests** for user workflows
- **Port testing** for development setup

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Vercel** for hosting and deployment
- **Neon** for serverless PostgreSQL
- **React** team for the amazing framework
- **Express.js** team for the backend framework
- **PostgreSQL** community for the database

---

**Made with ❤️ for the developer community**

For support, please open an issue on GitHub or contact the maintainers.