# Port Troubleshooting Guide

This guide helps you resolve port conflicts and configuration issues in the PostgreSQL React App.

## 🔍 Port Configuration

### Default Ports

| Environment | Backend Port | Frontend Port |
|-------------|--------------|---------------|
| Development | 5000 | 3000 |
| Production | 5000 | 5000 (served by Express) |
| Test | 5001 | 3001 |

### Port Configuration Files

- **`config/ports.js`** - Port configuration for all environments
- **`config/env.example`** - Environment variable examples
- **`scripts/check-ports.js`** - Port availability checker

## 🚨 Common Port Issues

### Issue 1: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Check what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

2. **Kill the process:**
   ```bash
   # Windows (replace PID with actual process ID)
   taskkill /PID <PID> /F
   
   # Linux/Mac
   kill -9 <PID>
   ```

3. **Use different ports:**
   ```bash
   # Set environment variables
   set BACKEND_PORT=5001
   set FRONTEND_PORT=3001
   npm run dev
   ```

### Issue 2: React Port Conflict

**Error Message:**
```
Something is already running on port 3000
```

**Solutions:**

1. **Let React choose a different port:**
   - Press `Y` when prompted
   - React will automatically use the next available port

2. **Set a specific port:**
   ```bash
   set PORT=3001
   npm run client
   ```

3. **Use environment variable:**
   ```bash
   set FRONTEND_PORT=3001
   npm run dev
   ```

### Issue 3: Backend Port Conflict

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**

1. **Change backend port:**
   ```bash
   set BACKEND_PORT=5001
   npm run server
   ```

2. **Update frontend API URL:**
   - The React app will automatically use the correct port
   - Or manually update `client/src/App.js` if needed

## 🛠️ Troubleshooting Commands

### Check Port Availability
```bash
npm run check-ports
```

### Start with Port Check
```bash
npm run dev
```

### Start Without Port Check
```bash
npm run dev:simple
```

### Manual Port Testing
```bash
# Test backend port
curl http://localhost:5000/api/health

# Test frontend port
curl http://localhost:3000
```

## 🔧 Port Configuration Options

### Environment Variables

Create a `.env` file in the root directory:

```env
# Port Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
PORT=5000

# Environment
NODE_ENV=development
```

### Custom Port Configuration

Edit `config/ports.js`:

```javascript
const config = {
  development: {
    backend: 5001,  // Custom backend port
    frontend: 3001, // Custom frontend port
  },
  // ... other environments
};
```

## 🚀 Development Workflow

### Recommended Startup Process

1. **Check ports first:**
   ```bash
   npm run check-ports
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **If ports are busy:**
   ```bash
   # Option 1: Kill processes using ports
   # Option 2: Use different ports
   set BACKEND_PORT=5001
   set FRONTEND_PORT=3001
   npm run dev
   ```

### Alternative Startup Methods

1. **Simple startup (no port check):**
   ```bash
   npm run dev:simple
   ```

2. **Start components separately:**
   ```bash
   # Terminal 1
   npm run server
   
   # Terminal 2
   npm run client
   ```

## 🔍 Port Monitoring

### Check Running Processes

**Windows:**
```bash
# List all processes using ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000

# Find process by name
tasklist | findstr node
```

**Linux/Mac:**
```bash
# List all processes using ports
lsof -i :5000
lsof -i :3000

# Find process by name
ps aux | grep node
```

### Port Usage Script

Create a custom port checker:

```javascript
// scripts/my-port-check.js
const net = require('net');

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function main() {
  const ports = [3000, 5000, 5001, 3001];
  for (const port of ports) {
    const available = await checkPort(port);
    console.log(`Port ${port}: ${available ? 'Available' : 'In Use'}`);
  }
}

main();
```

## 🎯 Best Practices

### Port Management

1. **Always check ports before starting**
2. **Use environment variables for port configuration**
3. **Document custom port configurations**
4. **Use different ports for different environments**

### Development Tips

1. **Keep port configuration in version control**
2. **Use consistent port ranges across team**
3. **Document port usage in README**
4. **Use port checking scripts**

### Production Considerations

1. **Use environment variables for production ports**
2. **Configure reverse proxy if needed**
3. **Monitor port usage in production**
4. **Use process managers (PM2, etc.)**

## 🆘 Getting Help

### If Port Issues Persist

1. **Check the logs:**
   ```bash
   npm run dev 2>&1 | tee dev.log
   ```

2. **Restart your system** (clears all port bindings)

3. **Use different port ranges:**
   ```bash
   set BACKEND_PORT=8000
   set FRONTEND_PORT=8001
   ```

4. **Check for antivirus/firewall interference**

### Common Solutions

- **Windows**: Restart Windows Defender or antivirus
- **Linux**: Check iptables/firewall rules
- **Mac**: Check System Preferences > Security & Privacy

### Support Resources

- **GitHub Issues**: Create an issue with port error details
- **Stack Overflow**: Search for specific port error messages
- **Node.js Documentation**: [nodejs.org/docs](https://nodejs.org/docs)

---

*This guide covers the most common port issues. For specific problems, check the application logs and create a GitHub issue with detailed error information.*
