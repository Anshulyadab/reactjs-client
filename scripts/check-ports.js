#!/usr/bin/env node

/**
 * Port Conflict Checker
 * 
 * This script checks if the required ports are available
 */

const net = require('net');
const { ports, environment } = require('../config/ports');

function checkPort(port, name) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve({ port, name, available: true });
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve({ port, name, available: false });
    });
  });
}

async function checkAllPorts() {
  console.log('🔍 Checking port availability...');
  console.log(`📊 Environment: ${environment}`);
  console.log('');

  const portChecks = [
    checkPort(ports.backend, 'Backend'),
    checkPort(ports.frontend, 'Frontend')
  ];

  const results = await Promise.all(portChecks);

  let allAvailable = true;

  results.forEach(({ port, name, available }) => {
    const status = available ? '✅ Available' : '❌ In Use';
    const color = available ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    
    console.log(`${color}${status}${reset} - ${name} (Port ${port})`);
    
    if (!available) {
      allAvailable = false;
    }
  });

  console.log('');

  if (allAvailable) {
    console.log('🎉 All ports are available! You can start the application.');
    console.log('');
    console.log('To start the application:');
    console.log('  npm run dev');
    console.log('');
    console.log('URLs:');
    console.log(`  Backend:  http://localhost:${ports.backend}`);
    console.log(`  Frontend: http://localhost:${ports.frontend}`);
  } else {
    console.log('⚠️  Some ports are in use. Please:');
    console.log('1. Stop other applications using these ports');
    console.log('2. Or change the port configuration in config/ports.js');
    console.log('3. Or set environment variables:');
    console.log(`   BACKEND_PORT=<different_port>`);
    console.log(`   FRONTEND_PORT=<different_port>`);
  }

  return allAvailable;
}

// Run the check
checkAllPorts().then((available) => {
  process.exit(available ? 0 : 1);
}).catch((error) => {
  console.error('Error checking ports:', error);
  process.exit(1);
});
