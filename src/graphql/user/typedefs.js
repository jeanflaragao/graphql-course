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
    email: String
    role: Role!
    createdAt: String!
    posts: [Post!]!
    comments: [Comment!]!
    likedPosts: [Post!]!
  }

  extend type Query {
    users: [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    # Admin only
    deleteUser(id: ID!): Boolean!
    changeUserRole(userId: ID!, role: Role!): User!
  }

  input CreateUserInput {
    name: String!
    email: String!
    password: String!
    role: Role = READER
  }
`;
