import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// 1️⃣ Mock DB BEFORE importing anything that uses it
jest.unstable_mockModule('../../../infra/database.js', () => ({
  default: {
    query: jest.fn(),
  },
}));

// Declare vars to import later
let createTestServer;
let executeQuery;
let createTestUser;
let typeDefs;
let resolvers;
let server;
let db;

beforeEach(async () => {
  jest.clearAllMocks();

  // 2️⃣ Import DB and Schema AFTER mocks apply
  db = (await import('../../../infra/database.js')).default;
  ({ typeDefs, resolvers } = await import('../../graphql/schema.js'));

  // 3️⃣ Import helpers AFTER schema
  ({ createTestServer, executeQuery, createTestUser } =
    await import('../../utils/testHelpers.js'));

  // 4️⃣ Default server without auth
  server = createTestServer({}, typeDefs, resolvers);
});

describe('GraphQL Queries', () => {
  describe('Public Queries', () => {
    test('should query posts without authentication', async () => {
      const POSTS_QUERY = `
        query {
          posts {
            id
            title
            status
          }
        }
      `;

      // Mock DB response
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Post 1', status: 'PUBLISHED', author_id: 2 },
          { id: 2, title: 'Post 2', status: 'PUBLISHED', author_id: 2 },
        ],
      });

      const result = await executeQuery(server, POSTS_QUERY);

      expect(result.errors).toBeUndefined();
      expect(result.data.posts.length).toBe(2);
    });

    test('should query single post by ID', async () => {
      const POST_QUERY = `
        query GetPost($id: ID!) {
          post(id: $id) {
            ... on Post {
              id
              title
            }
            ... on PostNotFoundError {
              statusCode
              message
            }
          }
        }
      `;

      const mockPost = {
        id: '1',
        title: 'Mock Post',
        status: 'PUBLISHED',
        author_id: 10,
      };

      const mockServer = createTestServer(
        {
          postLoaders: {
            postById: { load: jest.fn().mockResolvedValue(mockPost) },
          },
        },
        typeDefs,
        resolvers,
      );

      const result = await executeQuery(mockServer, POST_QUERY, { id: '1' });
      expect(result.errors).toBeUndefined();
      expect(result.data.post.id).toBe('1');
      expect(result.data.post.title).toBe('Mock Post');
    });
  });

  describe('Authenticated Queries', () => {
    test('should query me with valid token', async () => {
      const { user } = createTestUser();

      const serverWithAuth = createTestServer(
        { currentUser: user },
        typeDefs,
        resolvers,
      );

      const ME_QUERY = `
        query {
          me {
            id
            name
            email
            role
          }
        }
      `;

      const result = await executeQuery(serverWithAuth, ME_QUERY);

      expect(result.errors).toBeUndefined();
      expect(result.data.me).toEqual({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      });
    });

    test('should fail me query without authentication', async () => {
      const ME_QUERY = `
        query {
          me {
            id
            name
          }
        }
      `;

      const result = await executeQuery(server, ME_QUERY);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].extensions.code).toBe('UNAUTHENTICATED');
    });
  });

  describe('Admin Queries', () => {
    test('should allow admin to query all users', async () => {
      const { user } = createTestUser({ role: 'ADMIN' });

      const serverWithAdmin = createTestServer(
        { currentUser: user },
        typeDefs,
        resolvers,
      );

      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'A', email: 'a@test.com', role: 'READER' },
          { id: 2, name: 'B', email: 'b@test.com', role: 'AUTHOR' },
        ],
      });

      const USERS_QUERY = `
        query {
          users {
            id
            name
            email
          }
        }
      `;

      const result = await executeQuery(serverWithAdmin, USERS_QUERY);

      expect(result.errors).toBeUndefined();
      expect(result.data.users.length).toBe(2);
    });

    test('should forbid non-admin from querying all users', async () => {
      const { user } = createTestUser({ role: 'AUTHOR' });

      const serverWithUser = createTestServer(
        { currentUser: user },
        typeDefs,
        resolvers,
      );

      const USERS_QUERY = `
        query {
          users {
            id
            name
          }
        }
      `;

      const result = await executeQuery(serverWithUser, USERS_QUERY);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].extensions.code).toBe('FORBIDDEN');
    });
  });
});
