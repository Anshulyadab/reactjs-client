/**
 * Port Configuration
 * 
 * This file defines the port configuration for different environments
 */

const config = {
  development: {
    backend: process.env.BACKEND_PORT || 5000,
    frontend: process.env.FRONTEND_PORT || 3000,
  },
  production: {
    backend: process.env.PORT || 5000,
    frontend: process.env.PORT || 5000, // Same port in production (served by Express)
  },
  test: {
    backend: process.env.BACKEND_PORT || 5001,
    frontend: process.env.FRONTEND_PORT || 3001,
  }
};

const environment = process.env.NODE_ENV || 'development';
const ports = config[environment];

module.exports = {
  ports,
  environment,
  config
};
