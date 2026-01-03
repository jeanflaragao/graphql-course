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
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }
`;

