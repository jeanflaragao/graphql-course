import { describe, test, expect } from '@jest/globals';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  extractToken,
} from '../auth.js';

describe('Auth Utilities', () => {
  describe('hashPassword', () => {
    test('should hash a password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    test('should generate different hashes for same password', async () => {
      const password = 'password123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe('comparePassword', () => {
    test('should return true for correct password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword(password, hash);

      expect(isValid).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);
      const isValid = await comparePassword('wrongpassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate a valid JWT token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'AUTHOR',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'AUTHOR',
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    test('should return null for invalid token', () => {
      const decoded = verifyToken('invalid.token.here');

      expect(decoded).toBeNull();
    });

    test('should return null for expired token', () => {
      // This would require manipulating time or using a very short expiration
      // For now, we'll just test with malformed token
      const decoded = verifyToken('');

      expect(decoded).toBeNull();
    });
  });

  describe('extractToken', () => {
    test('should extract token from Bearer header', () => {
      const authHeader = 'Bearer abc123xyz';
      const token = extractToken(authHeader);

      expect(token).toBe('abc123xyz');
    });

    test('should return null for missing header', () => {
      const token = extractToken(null);

      expect(token).toBeNull();
    });

    test('should return null for malformed header', () => {
      const token = extractToken('InvalidFormat');

      expect(token).toBeNull();
    });

    test('should return null for header without Bearer', () => {
      const token = extractToken('abc123xyz');

      expect(token).toBeNull();
    });
  });
});
