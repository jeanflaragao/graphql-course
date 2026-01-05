import { gql } from 'apollo-server';
import { userTypeDefs } from './user/typedefs.js';
import { userResolvers } from './user/resolvers.js';
import { postTypeDefs } from './post/typedefs.js';
import { postResolvers } from './post/resolvers.js';
import { commentTypeDefs } from './comment/typedefs.js';
import { commentResolvers } from './comment/resolvers.js';
import { likeTypeDefs } from './like/typedefs.js';
import { likeResolvers } from './like/resolvers.js';

const rootTypeDefs = gql`
  type Query {
    _empty: Boolean
  }

  type Mutation {
    _empty: Boolean
  }
`;

const rootResolvers = {
  Query: {
    _empty: () => true,
  },
};

export const typeDefs = [
  rootTypeDefs,
  userTypeDefs,
  postTypeDefs,
  commentTypeDefs,
  likeTypeDefs,
];
export const resolvers = [
  rootResolvers,
  userResolvers,
  postResolvers,
  commentResolvers,
  likeResolvers,
];
