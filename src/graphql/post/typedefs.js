import { gql } from 'apollo-server';

export const postTypeDefs = gql`
  enum Category {
    TECHNOLOGY
    LIFESTYLE
    BUSINESS
    SCIENCE
  }

  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    category: Category!
    status: PostStatus!
    views: Int!
    author: User!
    # comments: [Comment!]!
    # likes: [Like!]
    # commentCount: Int!
    createdAt: String!
  }

  extend type Query {
    posts: [Post!]!
    post(id: ID!): Post
    postsByCategory(category: Category!): [Post!]!
  }
`;
