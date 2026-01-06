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
    comments: [Comment!]!
    commentCount: Int!
    likes: Int!
    likedBy: [User!]!
    createdAt: String!
  }

  input CreatePostInput {
    title: String!
    content: String!
    category: Category!
    status: PostStatus = DRAFT
  }

  input UpdatePostInput {
    title: String
    content: String
    category: Category
    status: PostStatus
  }

  extend type Query {
    post(id: ID!): PostResult!
    posts: [Post!]!
    postsByCategory(category: Category!): [Post!]!
    #comments(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }

  type PostNotFoundError {
    statusCode: Int!
    message: String!
  }

  union PostResult = Post | PostNotFoundError
`;
