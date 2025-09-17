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

## Project Structure

```
postgres-react-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Styling
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
├── server.js              # Express backend server
├── package.json           # Backend dependencies
├── env.example            # Environment variables template
└── README.md             # This file
```

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

- Backend runs on port 5000 by default
- Frontend runs on port 3000 by default
- Change ports in `.env` file if needed

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

## License

MIT License - feel free to use this project for learning and development!
