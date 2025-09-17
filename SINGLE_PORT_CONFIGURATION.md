# 🚀 Single Port Configuration (8080)

## ✅ **CONFIGURATION COMPLETED!**

Your PostgreSQL React App has been successfully configured to use a **single port (8080)** for both frontend and backend, with the API accessible at `localhost:8080/api`.

---

## 🔧 **Configuration Changes**

### **Port Configuration:**
- **Single Port:** 8080 (for both frontend and backend)
- **API Endpoint:** `localhost:8080/api`
- **Application:** `localhost:8080`
- **All environments** use the same port configuration

### **Architecture:**
```
┌─────────────────────────────────────┐
│           Port 8080                 │
├─────────────────────────────────────┤
│  Express Server                     │
│  ├── /api/* → API Routes            │
│  ├── /static → React Build Files    │
│  └── /* → React App (SPA)           │
└─────────────────────────────────────┘
```

---

## 🚀 **Development Workflow**

### **Start Commands:**
```bash
# Full development (recommended)
npm run dev
# → Builds React app + starts server on port 8080

# Quick start (without port checking)
npm run dev:simple
# → Builds React app + starts server

# Server only
npm run server
# → Starts server only (requires manual build)

# Build React app only
npm run build
# → Builds React app to client/build/
```

### **Development Process:**
1. **Build React App:** `npm run build`
2. **Start Server:** `npm run server`
3. **Access Application:** http://localhost:8080
4. **Access API:** http://localhost:8080/api

---

## 🌐 **Access Points**

### **Local Development:**
- **Application:** http://localhost:8080
- **API:** http://localhost:8080/api
- **Health Check:** http://localhost:8080/api/health

### **Production:**
- **Application:** https://psql-client-6pbioawlu-darkps-projects.vercel.app
- **API:** https://psql-client-6pbioawlu-darkps-projects.vercel.app/api

---

## 📁 **Files Modified**

### **Configuration Files:**
- ✅ `config/ports.js` - Single port configuration
- ✅ `config/env.example` - Updated port documentation
- ✅ `package.json` - Simplified dev scripts

### **Server Files:**
- ✅ `server.js` - Serve React app on same port, updated CORS
- ✅ `scripts/check-ports.js` - Single port checking

### **Client Files:**
- ✅ `client/src/App.js` - Updated API base URL
- ✅ `client/src/components/AdminDashboard.js` - Updated API URL

### **Documentation:**
- ✅ `README.md` - Updated all port references
- ✅ All testing examples updated to port 8080

---

## 🔍 **Port Checking**

### **Check Port Availability:**
```bash
npm run check-ports
```

### **Expected Output:**
```
🔍 Checking port availability...
📊 Environment: development

✅ Available - Application (Port 8080)

🎉 Port is available! You can start the application.

To start the application:
  npm run dev

URLs:
  Application: http://localhost:8080
  API:         http://localhost:8080/api
```

---

## 🧪 **Testing**

### **API Testing:**
```bash
# Health check
curl http://localhost:8080/api/health

# Database connection
curl http://localhost:8080/api/connection-info

# Execute query
curl -X POST http://localhost:8080/api/execute-query \
  -H "Content-Type: application/json" \
  -d '{"query":"SELECT version();"}'
```

### **Frontend Testing:**
- Open http://localhost:8080 in browser
- All React Router routes work properly
- API calls use relative URLs (/api/*)

---

## 🎯 **Benefits of Single Port Configuration**

### **Simplified Development:**
- ✅ **One port to remember** (8080)
- ✅ **No CORS issues** between frontend and backend
- ✅ **Simplified deployment** process
- ✅ **Easier testing** and debugging

### **Production Ready:**
- ✅ **Vercel deployment** works seamlessly
- ✅ **Static file serving** handled by Express
- ✅ **React Router** works with catch-all route
- ✅ **API routes** properly separated

### **Development Experience:**
- ✅ **Faster startup** (no separate React dev server)
- ✅ **Consistent environment** across dev/prod
- ✅ **Simplified scripts** and commands
- ✅ **Better port management**

---

## 🔧 **Environment Variables**

### **Required:**
```bash
PORT=8080
NODE_ENV=development
DATABASE_URL=your_database_connection_string
```

### **Optional:**
```bash
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
ADMIN_PASSWORD=your_admin_password
```

---

## 🚀 **Quick Start Guide**

### **1. Install Dependencies:**
```bash
npm install
npm run install-client
```

### **2. Configure Environment:**
```bash
cp config/env.example .env
# Edit .env with your database credentials
```

### **3. Start Development:**
```bash
npm run dev
```

### **4. Access Application:**
- Open http://localhost:8080
- API available at http://localhost:8080/api

---

## 🎉 **Ready to Use!**

Your PostgreSQL React App is now configured with a **single port (8080)** for both frontend and backend, making development and deployment much simpler!

**Key URLs:**
- **Application:** http://localhost:8080
- **API:** http://localhost:8080/api
- **Production:** https://psql-client-6pbioawlu-darkps-projects.vercel.app

**Start developing:** `npm run dev` 🚀
