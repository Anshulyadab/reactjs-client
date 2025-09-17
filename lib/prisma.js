/**
 * Prisma Client Wrapper
 * 
 * Enhanced Prisma client for Neon database with connection pooling
 */

const { PrismaClient } = require('@prisma/client');

// Global variable to store Prisma client instance
const globalForPrisma = globalThis;

// Create Prisma client with enhanced configuration
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
    }
  }
});

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Enhanced query function with error handling
const query = async (callback) => {
  try {
    return await callback(prisma);
  } catch (error) {
    console.error('Prisma query error:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database successfully');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as version`;
    console.log('📊 Database info:', result[0]);
    
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('❌ Prisma database connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Initialize database with required data
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database with Prisma...');
    
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });
    
    if (!adminUser) {
      const bcrypt = require('bcryptjs');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          passwordHash: passwordHash,
          role: 'admin'
        }
      });
      console.log('✅ Default admin user created');
    }
    
    console.log('✅ Database initialized successfully with Prisma');
    return { success: true };
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return { success: false, error: error.message };
  }
};

// Graceful shutdown
const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting Prisma:', error);
  }
};

// Health check
const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date().toISOString() };
  }
};

module.exports = {
  prisma,
  query,
  testConnection,
  initializeDatabase,
  disconnect,
  healthCheck
};
