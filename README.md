# PostgreSQL React App

A full-stack application that connects a React frontend to a PostgreSQL database through an Express.js backend API.

## Features

- ✅ React frontend with modern UI
- ✅ Express.js backend server
- ✅ PostgreSQL database connection
- ✅ String input and storage functionality
- ✅ Real-time database connection testing
- ✅ Responsive design
- ✅ Error handling and user feedback

## Prerequisites

Before running this application, make sure you have:

1. **Node.js** (v14 or higher)
2. **PostgreSQL** database server running
3. **npm** or **yarn** package manager

## Setup Instructions

### 1. Database Setup

First, create a PostgreSQL database:

```sql
-- Connect to PostgreSQL and create a database
CREATE DATABASE testdb;

-- Create a user (optional, you can use default postgres user)
CREATE USER testuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE testdb TO testuser;
```

### 2. Environment Configuration

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your database credentials:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=testdb
   DB_PASSWORD=your_password_here
   DB_PORT=5432
   PORT=5000
   ```

### 3. Install Dependencies

Install backend dependencies:
```bash
npm install
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

### 4. Run the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev
```

#### Option 2: Run separately

**Backend (Terminal 1):**
```bash
npm run server
```

**Frontend (Terminal 2):**
```bash
npm run client
```

## Usage

1. **Start the application** using one of the methods above
2. **Open your browser** and go to `http://localhost:3000`
3. **Test database connection** by clicking the "Test Connection" button
4. **Enter a string** in the input field and click "Save String"
5. **View saved strings** in the list below
6. **Refresh the list** to see the latest entries

## API Endpoints

The backend provides the following API endpoints:

- `GET /api/health` - Server health check
- `GET /api/test-db` - Test database connection
- `POST /api/save-string` - Save a string to the database
- `GET /api/strings` - Retrieve all saved strings

## 📁 Project Structure

```
postgres-react-app/
├── 📁 client/                    # React frontend application
│   ├── 📁 src/                  # React source code
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Styling
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   ├── 📁 public/              # Static assets
│   └── package.json            # Frontend dependencies
│
├── 📁 .github/workflows/        # GitHub Actions CI/CD
│   ├── deploy.yml              # Full deployment workflow
│   ├── deploy-simple.yml       # Simple deployment workflow
│   └── test.yml                # Testing workflow
│
├── 📁 docs/                     # Documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── GITHUB_ACTIONS_SETUP.md # GitHub Actions setup
│   └── PROJECT_STRUCTURE.md    # Project organization
│
├── 📁 scripts/                  # Utility scripts
│   ├── deploy.bat              # Windows deployment
│   ├── deploy.sh               # Linux/Mac deployment
│   └── get-vercel-credentials.js # Vercel helper
│
├── 📁 config/                   # Configuration
│   └── env.example             # Environment template
│
├── 📄 server.js                 # Express backend server
├── 📄 package.json              # Backend dependencies
├── 📄 vercel.json               # Vercel configuration
└── 📄 README.md                 # This file
```

For detailed project structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Database Schema

The application automatically creates a table called `test_strings` with the following structure:

```sql
CREATE TABLE test_strings (
    id SERIAL PRIMARY KEY,
    input_string TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   net start postgresql-x64-13
   
   # macOS (with Homebrew)
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Verify database credentials** in your `.env` file

3. **Check if the database exists:**
   ```sql
   \l  -- List all databases in psql
   ```

### Port Conflicts

**Check port availability:**
```bash
npm run check-ports
```

**Common port conflicts:**
- Backend (5000) or Frontend (3000) already in use
- Use different ports: `set BACKEND_PORT=5001 && set FRONTEND_PORT=3001`

For detailed port troubleshooting, see [docs/PORT_TROUBLESHOOTING.md](docs/PORT_TROUBLESHOOTING.md).

### Common Errors

- **"relation does not exist"**: The table will be created automatically on first use
- **"connection refused"**: Check if PostgreSQL is running and credentials are correct
- **"CORS error"**: Make sure the backend server is running on the correct port

## Development

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Modify `client/src/App.js` and `client/src/App.css`
3. **Database**: Add new tables or modify existing schema

### Environment Variables

All sensitive configuration should be stored in the `.env` file:

- `DB_USER` - PostgreSQL username
- `DB_HOST` - Database host (usually localhost)
- `DB_NAME` - Database name
- `DB_PASSWORD` - Database password
- `DB_PORT` - Database port (default: 5432)
- `PORT` - Backend server port (default: 5000)

## 🚀 Deployment to Vercel + Neon

This app is ready for production deployment with Vercel and Neon database.

### Option 1: GitHub Actions (Recommended)

**Automatic deployment** with GitHub Actions:

1. **Push to GitHub** and set up secrets
2. **Automatic deployment** on every push
3. **Preview deployments** for pull requests

See [docs/GITHUB_ACTIONS_SETUP.md](docs/GITHUB_ACTIONS_SETUP.md) for detailed setup.

### Option 2: Manual Deploy

1. **Set up Neon Database**
   - Create account at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy your connection string

2. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login and deploy
   vercel login
   vercel
   
   # Add environment variable
   vercel env add NEON_DATABASE_URL
   # Paste your Neon connection string
   
   # Deploy to production
   vercel --prod
   ```

3. **Or use the deployment script**
   ```bash
   # Windows
   scripts/deploy.bat
   
   # Linux/Mac
   ./scripts/deploy.sh
   ```

### Environment Variables for Production

- `NEON_DATABASE_URL`: Your Neon database connection string
- `NODE_ENV`: Set to `production` (automatic on Vercel)

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🌐 Live Demo

Once deployed, your app will be available at:
`https://your-app-name.vercel.app`

Features available in production:
- ✅ Full PostgreSQL database integration
- ✅ Real-time database testing interface
- ✅ SQL query execution
- ✅ Database schema inspection
- ✅ Connection diagnostics
- ✅ Responsive design
- ✅ HTTPS/SSL security

## License

MIT License - feel free to use this project for learning and development!
