import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  enum Role {
    ADMIN
    AUTHOR
    READER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String!
    # posts: [Post!]!  // Uncomment if Post type is defined and you want to link users to their posts
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

