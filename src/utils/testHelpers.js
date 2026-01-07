import { ApolloServer } from 'apollo-server';
import { jest } from '@jest/globals';
import { generateToken } from './auth.js';

/**
 * Create a test Apollo Server
 */
export const createTestServer = (contextValue = {}, typeDefs, resolvers) => {
  return new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      currentUser: null,
      userLoaders: {
        userById: { load: jest.fn() },
      },
      postLoaders: {
        postById: { load: jest.fn().mockResolvedValue(null) },
        postsByAuthorId: { load: jest.fn() },
      },
      commentLoaders: {
        commentsByPostId: { load: jest.fn() },
        commentCountByPostId: { load: jest.fn() },
      },
      likeLoaders: {
        likesCountByPostId: { load: jest.fn() },
        usersWhoLikedPost: { load: jest.fn() },
        postsLikedByUser: { load: jest.fn() },
      },
      ...contextValue,
    }),
  });
};

/**
 * Execute GraphQL query
 */
export const executeQuery = async (server, query, variables = {}) => {
  return await server.executeOperation({
    query,
    variables,
  });
};

/**
 * Create test user token
 */
export const createTestUser = (userData = {}) => {
  const user = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'AUTHOR',
    ...userData,
  };

  const token = generateToken(user);
  return { user, token };
};
