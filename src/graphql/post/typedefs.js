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
    authorId: ID!
    status: PostStatus = DRAFT
  }

  extend type Query {
    post(id: ID!): PostResult!
    posts: [Post!]!
    postsByCategory(category: Category!): [Post!]!
    #comments(postId: ID!): [Comment!]!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): Post!
    deletePost(id: ID!): Boolean!
  }

  type PostNotFoundError {
    statusCode: Int!
    message: String!
  }

  union PostResult = Post | PostNotFoundError
`;
