import { gql } from 'apollo-server';
import { userTypeDefs } from './user/typedefs.js';
import { userResolvers } from './user/resolvers.js';
import { postTypeDefs } from './post/typedefs.js';
import { postResolvers } from './post/resolvers.js';

const rootTypeDefs = gql`
  type Query {
    _empty: Boolean
  }
`;

const rootResolvers = {
  Query: {
    _empty: () => true
  }
};

export const typeDefs = [rootTypeDefs, userTypeDefs, postTypeDefs];
export const resolvers = [rootResolvers, userResolvers, postResolvers];
