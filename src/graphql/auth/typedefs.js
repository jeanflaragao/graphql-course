import { gql } from 'apollo-server';

export const authTypeDefs = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: Role = READER
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    # Get current logged-in user
    me: User
  }

  extend type Mutation {
    # Register a new user
    register(input: RegisterInput!): AuthPayload!

    # Login existing user
    login(input: LoginInput!): AuthPayload!
  }
`;
