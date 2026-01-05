import { gql } from 'apollo-server';

export const likeTypeDefs = gql`
  extend type Mutation {
    likePost(postId: ID!, userId: ID!): Post!
    unlikePost(postId: ID!, userId: ID!): Post!
  }
`;
