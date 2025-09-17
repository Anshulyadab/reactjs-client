/**
 * Port Configuration
 * 
 * This file defines the port configuration for different environments
 */

const config = {
  development: {
    backend: process.env.PORT || 8080,
    frontend: process.env.PORT || 8080, // Same port for both frontend and backend
  },
  production: {
    backend: process.env.PORT || 8080,
    frontend: process.env.PORT || 8080, // Same port in production (served by Express)
  },
  test: {
    backend: process.env.PORT || 8080,
    frontend: process.env.PORT || 8080, // Same port for testing
  }
};

const environment = process.env.NODE_ENV || 'development';
const ports = config[environment];

module.exports = {
  ports,
  environment,
  config
};
