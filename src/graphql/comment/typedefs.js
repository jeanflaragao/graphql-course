import { gql } from 'apollo-server';

export const commentTypeDefs = gql`
  type Comment {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: String!
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
    authorId: ID!
  }

  extend type Query {
    comments(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;
