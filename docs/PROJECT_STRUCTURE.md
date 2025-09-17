# Project Structure

This document describes the organization and structure of the PostgreSQL React App project.

## 📁 Directory Structure

```
postgres-react-app/
├── 📁 client/                    # React frontend application
│   ├── 📁 public/               # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── 📁 src/                  # React source code
│   │   ├── App.js              # Main React component
│   │   ├── App.css             # Main styles
│   │   ├── index.js            # React entry point
│   │   └── index.css           # Global styles
│   ├── package.json            # Frontend dependencies
│   └── package-lock.json       # Frontend dependency lock
│
├── 📁 .github/                  # GitHub configuration
│   └── 📁 workflows/           # GitHub Actions workflows
│       ├── deploy.yml          # Full deployment workflow
│       ├── deploy-simple.yml   # Simple deployment workflow
│       └── test.yml            # Testing workflow
│
├── 📁 docs/                     # Documentation
│   ├── DEPLOYMENT.md           # Deployment guide
│   ├── GITHUB_ACTIONS_SETUP.md # GitHub Actions setup
│   └── PROJECT_STRUCTURE.md    # This file
│
├── 📁 scripts/                  # Utility scripts
│   ├── deploy.bat              # Windows deployment script
│   ├── deploy.sh               # Linux/Mac deployment script
│   └── get-vercel-credentials.js # Vercel credentials helper
│
├── 📁 config/                   # Configuration files
│   └── env.example             # Environment variables template
│
├── 📄 server.js                 # Express backend server
├── 📄 package.json              # Backend dependencies & scripts
├── 📄 package-lock.json         # Backend dependency lock
├── 📄 vercel.json               # Vercel deployment configuration
├── 📄 .gitignore                # Git ignore rules
└── 📄 README.md                 # Project overview & setup
```

## 🎯 File Purposes

### Core Application Files

| File | Purpose |
|------|---------|
| `server.js` | Express.js backend server with PostgreSQL integration |
| `client/src/App.js` | Main React component with PostgreSQL testing interface |
| `client/src/App.css` | Styling for the React application |
| `package.json` | Backend dependencies and npm scripts |
| `client/package.json` | Frontend dependencies and React scripts |

### Configuration Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `config/env.example` | Environment variables template |
| `.gitignore` | Files to exclude from version control |
| `.github/workflows/*.yml` | GitHub Actions CI/CD workflows |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Project overview, setup, and quick start |
| `docs/DEPLOYMENT.md` | Comprehensive deployment guide |
| `docs/GITHUB_ACTIONS_SETUP.md` | GitHub Actions setup instructions |
| `docs/PROJECT_STRUCTURE.md` | This file - project organization |

### Scripts

| File | Purpose |
|------|---------|
| `scripts/deploy.bat` | Windows deployment automation |
| `scripts/deploy.sh` | Linux/Mac deployment automation |
| `scripts/get-vercel-credentials.js` | Helper to get Vercel credentials |

## 🔧 Development Workflow

### Local Development
1. **Backend**: `npm run server` (runs `server.js` with nodemon)
2. **Frontend**: `npm run client` (runs React dev server)
3. **Both**: `npm run dev` (runs both concurrently)

### Production Build
1. **Build**: `npm run build` (builds React app)
2. **Start**: `npm start` (runs production server)

### Deployment
1. **Manual**: Use scripts in `scripts/` directory
2. **Automatic**: Push to GitHub (triggers GitHub Actions)

## 📦 Dependencies

### Backend Dependencies
- `express` - Web framework
- `cors` - Cross-origin resource sharing
- `pg` - PostgreSQL client
- `dotenv` - Environment variable loading

### Frontend Dependencies
- `react` - UI library
- `react-dom` - React DOM rendering
- `react-scripts` - Create React App scripts

### Development Dependencies
- `nodemon` - Auto-restart server during development
- `concurrently` - Run multiple commands simultaneously

## 🚀 Deployment Architecture

### Vercel Deployment
- **Frontend**: Static files served from `client/build/`
- **Backend**: Serverless functions via `server.js`
- **Database**: Neon PostgreSQL (cloud-hosted)

### GitHub Actions
- **Trigger**: Push to main branch or pull request
- **Process**: Build → Test → Deploy
- **Result**: Automatic deployment to Vercel

## 🔍 Key Features

### PostgreSQL Integration
- Connection pooling with automatic fallback
- Real-time database testing interface
- SQL query execution with security validation
- Database schema inspection
- Connection diagnostics

### React Interface
- Tabbed interface for different features
- Real-time status indicators
- Responsive design
- Error handling and user feedback

### Production Ready
- Environment-based configuration
- SSL/HTTPS support
- Global CDN via Vercel
- Automatic scaling
- Monitoring and logging

## 📝 Adding New Features

### Backend (Express)
1. Add routes to `server.js`
2. Update API documentation
3. Test with the React interface

### Frontend (React)
1. Modify `client/src/App.js`
2. Update styles in `client/src/App.css`
3. Test in development mode

### Documentation
1. Update relevant files in `docs/`
2. Update `README.md` if needed
3. Update this structure file if organization changes

## 🐛 Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 3000/5000 are available
2. **Database connection**: Verify environment variables
3. **Build failures**: Check Node.js version (requires 18+)
4. **Deployment issues**: Check Vercel logs and GitHub Actions

### Getting Help
1. Check `docs/` directory for detailed guides
2. Review GitHub Actions logs
3. Check Vercel dashboard for deployment status
4. Verify environment variables are set correctly
