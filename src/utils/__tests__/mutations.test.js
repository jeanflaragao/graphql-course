import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// 1️⃣ Mock database BEFORE importing schema
jest.unstable_mockModule('../../../infra/database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// 2️⃣ Load mocked DB instance
const { default: db } = await import('../../../infra/database.js');

// 3️⃣ Lazy imports (schema only after mocks applied)
let typeDefs;
let resolvers;
let createTestServer;
let executeQuery;

describe('GraphQL Mutations', () => {
  let server;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Import schema and helper AFTER mocks
    ({ typeDefs, resolvers } = await import('../../graphql/schema.js'));
    ({ createTestServer, executeQuery } =
      await import('../../utils/testHelpers.js'));

    server = createTestServer({}, typeDefs, resolvers);
  });

  describe('Authentication Mutations', () => {
    test('should register new user', async () => {
      const REGISTER_MUTATION = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              name
              email
              role
            }
          }
        }
      `;

      // Mock DB queries in order
      db.query
        .mockResolvedValueOnce({ rows: [] }) // Email check
        .mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              name: 'New User',
              email: 'new@example.com',
              role: 'READER',
            },
          ],
        });

      const result = await executeQuery(server, REGISTER_MUTATION, {
        input: {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.register.token).toBeDefined();
      expect(result.data.register.user.email).toBeNull();
    });

    test('should reject registration with existing email', async () => {
      const REGISTER_MUTATION = `
        mutation Register($input: RegisterInput!) {
          register(input: $input) {
            token
            user {
              email
            }
          }
        }
      `;

      // Mock existing email
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const result = await executeQuery(server, REGISTER_MUTATION, {
        input: {
          name: 'Test',
          email: 'existing@example.com',
          password: 'password123',
        },
      });

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('already in use');
    });
  });
});
