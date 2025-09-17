/**
 * Prisma User Service
 * 
 * User management using Prisma ORM
 */

const bcrypt = require('bcryptjs');
const { prisma, query } = require('../lib/prisma');

/**
 * Find or create a user from GitHub OAuth data
 */
const findOrCreateGitHubUser = async (profile) => {
  return await query(async (prisma) => {
    try {
      // Check if user already exists by GitHub ID
      let user = await prisma.user.findUnique({
        where: { githubId: profile.id.toString() }
      });

      if (user) {
        // Update last login time
        user = await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            githubId: user.githubId,
            githubUsername: user.githubUsername,
            avatarUrl: user.avatarUrl
          }
        };
      }

      // Check if user exists by email
      user = await prisma.user.findUnique({
        where: { email: profile.emails[0].value }
      });

      if (user) {
        // Link GitHub account to existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: profile.id.toString(),
            githubUsername: profile.username,
            avatarUrl: profile.photos[0].value,
            lastLogin: new Date()
          }
        });
        
        return {
          success: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            githubId: user.githubId,
            githubUsername: user.githubUsername,
            avatarUrl: user.avatarUrl
          }
        };
      }

      // Create new user
      const username = profile.username || profile.displayName || `github_${profile.id}`;
      const email = profile.emails[0].value;
      const avatarUrl = profile.photos[0].value;

      user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          role: 'user',
          githubId: profile.id.toString(),
          githubUsername: profile.username,
          avatarUrl: avatarUrl,
          lastLogin: new Date()
        }
      });

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          githubId: user.githubId,
          githubUsername: user.githubUsername,
          avatarUrl: user.avatarUrl
        }
      };
    } catch (error) {
      console.error('Error in findOrCreateGitHubUser:', error);
      return {
        success: false,
        message: 'Failed to authenticate with GitHub',
        error: error.message
      };
    }
  });
};

/**
 * Register a new user
 */
const registerUser = async (username, email, password, role = 'user') => {
  return await query(async (prisma) => {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: email }
          ]
        }
      });

      if (existingUser) {
        return { success: false, message: 'Username or email already exists.' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          passwordHash: passwordHash,
          role: role
        }
      });

      return {
        success: true,
        message: 'User registered successfully.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error registering user:', error);
      return { success: false, message: 'Registration failed.', error: error.message };
    }
  });
};

/**
 * Login user
 */
const loginUser = async (username, password) => {
  return await query(async (prisma) => {
    try {
      // Find user by username or email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: username },
            { email: username }
          ]
        }
      });

      if (!user) {
        return { success: false, message: 'Invalid credentials.' };
      }

      // Check if user is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return { success: false, message: 'Account is temporarily locked.' };
      }

      // Verify password
      if (!user.passwordHash) {
        return { success: false, message: 'Invalid credentials.' };
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        // Increment login attempts
        const loginAttempts = user.loginAttempts + 1;
        const lockedUntil = loginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes

        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: loginAttempts,
            lockedUntil: lockedUntil
          }
        });

        return { success: false, message: 'Invalid credentials.' };
      }

      // Reset login attempts and update last login
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: 0,
          lockedUntil: null,
          lastLogin: new Date()
        }
      });

      return {
        success: true,
        message: 'Logged in successfully.',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error logging in user:', error);
      return { success: false, message: 'Login failed.', error: error.message };
    }
  });
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  return await query(async (prisma) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          githubId: true,
          githubUsername: true,
          avatarUrl: true,
          createdAt: true,
          lastLogin: true
        }
      });

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      return { success: true, user: user };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, message: 'Failed to get user profile.', error: error.message };
    }
  });
};

/**
 * Get all users (admin only)
 */
const getAllUsers = async () => {
  return await query(async (prisma) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          githubId: true,
          githubUsername: true,
          avatarUrl: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return { success: true, users: users };
    } catch (error) {
      console.error('Error getting all users:', error);
      return { success: false, message: 'Failed to get all users.', error: error.message };
    }
  });
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updateData) => {
  return await query(async (prisma) => {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          githubId: true,
          githubUsername: true,
          avatarUrl: true,
          updatedAt: true
        }
      });

      return { success: true, user: user };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, message: 'Failed to update user profile.', error: error.message };
    }
  });
};

/**
 * Delete user
 */
const deleteUser = async (userId) => {
  return await query(async (prisma) => {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });

      return { success: true, message: 'User deleted successfully.' };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, message: 'Failed to delete user.', error: error.message };
    }
  });
};

module.exports = {
  findOrCreateGitHubUser,
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUser
};
