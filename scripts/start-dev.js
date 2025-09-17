#!/usr/bin/env node

/**
 * Development Startup Script
 * 
 * This script starts the development environment with proper port handling
 */

const { spawn } = require('child_process');
const { ports, environment } = require('../config/ports');

console.log('🚀 Starting PostgreSQL React App Development Environment');
console.log('================================================');
console.log(`📊 Environment: ${environment}`);
console.log(`🌐 Backend Port: ${ports.backend}`);
console.log(`⚛️  Frontend Port: ${ports.frontend}`);
console.log('');

// Start backend server
console.log('🔧 Starting backend server...');
const backend = spawn('npm', ['run', 'server'], {
  stdio: 'inherit',
  shell: true
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('⚛️  Starting React frontend...');
  const frontend = spawn('npm', ['run', 'client'], {
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down development servers...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  });

}, 2000);

backend.on('error', (error) => {
  console.error('❌ Backend server error:', error);
  process.exit(1);
});

backend.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`);
    process.exit(1);
  }
});
