import { gql } from 'apollo-server';

export const paginationTypeDefs = gql`
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type PostEdge {
    node: Post!
    cursor: String!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  extend type Query {
    paginatedPosts(
      first: Int
      after: String
      category: Category
      status: PostStatus
      orderBy: PostOrderBy
      search: String # ADD THIS
    ): PostConnection!

    searchPosts(query: String!, limit: Int): [Post!]! # ADD THIS
  }

  enum PostOrderBy {
    NEWEST
    OLDEST
    MOST_LIKED
    MOST_COMMENTED
  }
`;
