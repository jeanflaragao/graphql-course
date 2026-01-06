import { UserInputError } from 'apollo-server';
import db from '../../../infra/database.js';
import {
  hashPassword,
  comparePassword,
  generateToken,
} from '../../utils/auth.js';
import { requireAuth } from '../../utils/permissions.js';

export const authResolvers = {
  Query: {
    me: (parent, args, context) => {
      // Return current user from context
      requireAuth(context);
      return context.currentUser;
    },
  },

  Mutation: {
    register: async (parent, { input }) => {
      const { name, email, password, role } = input;

      // Validate input
      if (password.length < 8) {
        throw new UserInputError('Password must be at least 8 characters');
      }

      if (!email.includes('@')) {
        throw new UserInputError('Invalid email format');
      }

      // Check if email already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email],
      );

      if (existingUser.rows.length > 0) {
        throw new UserInputError('Email already in use');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const result = await db.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, created_at`,
        [name, email, passwordHash, role || 'READER'],
      );

      const user = result.rows[0];

      // Generate token
      const token = generateToken(user);

      console.log('✅ User registered:', user.email);

      return {
        token,
        user,
      };
    },

    login: async (parent, { input }) => {
      const { email, password } = input;

      // Find user by email
      const result = await db.query('SELECT * FROM users WHERE email = $1', [
        email,
      ]);

      if (result.rows.length === 0) {
        throw new UserInputError('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const isValid = await comparePassword(password, user.password_hash);

      if (!isValid) {
        throw new UserInputError('Invalid email or password');
      }

      // Generate token
      const token = generateToken(user);

      console.log('✅ User logged in:', user.email);

      return {
        token,
        user,
      };
    },
  },
};
