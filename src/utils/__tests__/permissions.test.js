import { describe, test, expect } from '@jest/globals';
import { AuthenticationError, ForbiddenError } from 'apollo-server';
import {
  requireAuth,
  requireRole,
  requireOwnership,
  canAccess,
} from '../permissions.js';

describe('Permission Utilities', () => {
  describe('requireAuth', () => {
    test('should return user when authenticated', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'AUTHOR' },
      };

      const user = requireAuth(context);

      expect(user).toEqual(context.currentUser);
    });

    test('should throw error when not authenticated', () => {
      const context = { currentUser: null };

      expect(() => requireAuth(context)).toThrow(AuthenticationError);
      expect(() => requireAuth(context)).toThrow('You must be logged in');
    });
  });

  describe('requireRole', () => {
    test('should allow user with correct role', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'ADMIN' },
      };

      const user = requireRole(context, ['ADMIN']);

      expect(user).toEqual(context.currentUser);
    });

    test('should allow user with one of multiple allowed roles', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'AUTHOR' },
      };

      const user = requireRole(context, ['ADMIN', 'AUTHOR']);

      expect(user).toEqual(context.currentUser);
    });

    test('should throw error for incorrect role', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'READER' },
      };

      expect(() => requireRole(context, ['ADMIN'])).toThrow(ForbiddenError);
      expect(() => requireRole(context, ['ADMIN'])).toThrow(
        'You do not have permission',
      );
    });

    test('should throw error when not authenticated', () => {
      const context = { currentUser: null };

      expect(() => requireRole(context, ['ADMIN'])).toThrow(
        AuthenticationError,
      );
    });
  });

  describe('requireOwnership', () => {
    test('should allow owner to access resource', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'AUTHOR' },
      };

      const result = requireOwnership(context, 1); // resourceAuthorId = 1

      expect(result).toBe(true);
    });

    test('should allow admin to access any resource', () => {
      const context = {
        currentUser: { id: 2, email: 'admin@example.com', role: 'ADMIN' },
      };

      const result = requireOwnership(context, 1); // resourceAuthorId = 1

      expect(result).toBe(true);
    });

    test('should throw error for non-owner', () => {
      const context = {
        currentUser: { id: 2, email: 'other@example.com', role: 'AUTHOR' },
      };

      expect(() => requireOwnership(context, 1)).toThrow(ForbiddenError);
      expect(() => requireOwnership(context, 1)).toThrow(
        'You can only modify your own content',
      );
    });
  });

  describe('canAccess', () => {
    test('should return true for owner', () => {
      const context = {
        currentUser: { id: 1, email: 'test@example.com', role: 'AUTHOR' },
      };

      const result = canAccess(context, 1);

      expect(result).toBe(true);
    });

    test('should return true for admin', () => {
      const context = {
        currentUser: { id: 2, email: 'admin@example.com', role: 'ADMIN' },
      };

      const result = canAccess(context, 1);

      expect(result).toBe(true);
    });

    test('should return false for non-owner non-admin', () => {
      const context = {
        currentUser: { id: 2, email: 'other@example.com', role: 'AUTHOR' },
      };

      const result = canAccess(context, 1);

      expect(result).toBe(false);
    });
  });
});
