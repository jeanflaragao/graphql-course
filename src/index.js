import { ApolloServer, gql } from 'apollo-server';
import db from '../infra/database.js';

const typeDefs = gql`
  enum Role {
    ADMIN
    AUTHOR
    READER
  }

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

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    createdAt: String!
    posts: [Post!]!
    comments: [Comment!]!
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
    createdAt: String!
  }

  type Comment {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: String!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: Role = READER
  }

  input CreatePostInput {
    title: String!
    content: String!
    category: Category!
    authorId: ID!
    status: PostStatus = DRAFT
  }

  input CreateCommentInput {
    content: String!
    postId: ID!
    authorId: ID!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    posts: [Post!]!
    post(id: ID!): Post
    postsByCategory(category: Category!): [Post!]!
    comments(postId: ID!): [Comment!]!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    createPost(input: CreatePostInput!): Post!
    createComment(input: CreateCommentInput!): Comment!
    deletePost(id: ID!): Boolean!
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    },

    user: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [args.id]
      );
      return result.rows[0];
    },

    posts: async () => {
      const result = await db.query(
        'SELECT * FROM posts ORDER BY created_at DESC'
      );
      return result.rows;
    },

    post: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE id = $1',
        [args.id]
      );
      return result.rows[0];
    },

    postsByCategory: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC',
        [args.category]
      );
      return result.rows;
    },

    comments: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC',
        [args.postId]
      );
      return result.rows;
    }
  },

  Mutation: {
    createUser: async (parent, args) => {
      const { name, email, role } = args.input;
      const result = await db.query(
        'INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *',
        [name, email, role || 'READER']
      );
      console.log('✅ Created user:', result.rows[0]);
      return result.rows[0];
    },

    createPost: async (parent, args) => {
      const { title, content, category, authorId, status } = args.input;
      const result = await db.query(
        `INSERT INTO posts (title, content, category, author_id, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, content, category, authorId, status || 'DRAFT']
      );
      console.log('✅ Created post:', result.rows[0]);
      return result.rows[0];
    },

    createComment: async (parent, args) => {
      const { content, postId, authorId } = args.input;
      const result = await db.query(
        `INSERT INTO comments (content, post_id, author_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [content, postId, authorId]
      );
      console.log('✅ Created comment:', result.rows[0]);
      return result.rows[0];
    },

    deletePost: async (parent, args) => {
      const result = await db.query(
        'DELETE FROM posts WHERE id = $1 RETURNING id',
        [args.id]
      );
      return result.rows.length > 0;
    }
  },

  User: {
    posts: async (parent) => {
      console.log(`🔄 Fetching posts for user ${parent.id}`);
      const result = await db.query(
        'SELECT * FROM posts WHERE author_id = $1',
        [parent.id]
      );
      return result.rows;
    },

    comments: async (parent) => {
      console.log(`🔄 Fetching comments for user ${parent.id}`);
      const result = await db.query(
        'SELECT * FROM comments WHERE author_id = $1',
        [parent.id]
      );
      return result.rows;
    }
  },

  Post: {
    author: async (parent) => {
      console.log(`🔄 Fetching author for post ${parent.id}`);
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    },

    comments: async (parent) => {
      console.log(`🔄 Fetching comments for post ${parent.id}`);
      const result = await db.query(
        'SELECT * FROM comments WHERE post_id = $1',
        [parent.id]
      );
      return result.rows;
    },

    commentCount: async (parent) => {
      const result = await db.query(
        'SELECT COUNT(*) FROM comments WHERE post_id = $1',
        [parent.id]
      );
      return parseInt(result.rows[0].count);
    }
  },

  Comment: {
    post: async (parent) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE id = $1',
        [parent.post_id]
      );
      return result.rows[0];
    },

    author: async (parent) => {
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [parent.author_id]
      );
      return result.rows[0];
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server with PostgreSQL ready at ${url}`);
});
