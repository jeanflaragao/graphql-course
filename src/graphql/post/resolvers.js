import db from '../../../infra/database.js';

export const postResolvers = {
  Query: {
    posts: async () => {
      const result = await db.query(
        'SELECT * FROM posts ORDER BY created_at DESC',
      );
      return result.rows;
    },

    post: async (parent, args, context) => {
      const post = await context.postLoaders.postById.load(args.id);
      if (typeof post === 'undefined' || post === null) {
        return {
          statusCode: 404,
          message: `Post with ID ${args.id} not found.`,
        };
      }
      return post;
    },

    postsByCategory: async (parent, args, context) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC',
        [args.category],
      );
      return result.rows;
    },
  },
  Post: {
    author: async (parent, args, context) => {
      return context.userLoaders.userById.load(parent.author_id);
    },
    comments: (parent, args, context) => {
      return context.commentLoaders.commentsByPostId.load(parent.id);
    },

    commentCount: (parent, args, context) => {
      return context.commentLoaders.commentCountByPostId.load(parent.id);
    },

    likes: (parent, args, context) => {
      return context.likeLoaders.likesCountByPostId.load(parent.id);
    },

    likedBy: (parent, args, context) => {
      return context.likeLoaders.usersWhoLikedPost.load(parent.id);
    },
  },
  PostResult: {
    __resolveType(obj) {
      if (typeof obj.statusCode !== 'undefined') return 'PostNotFoundError';
      if (typeof obj.id !== 'undefined') return 'Post';
      return null;
    },
  },
  Mutation: {
    createPost: async (parent, args) => {
      const { title, content, category, authorId, status } = args.input;
      const result = await db.query(
        `INSERT INTO posts (title, content, category, author_id, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
        [title, content, category, authorId, status || 'DRAFT'],
      );
      console.log('✅ Created post:', result.rows[0]);
      return result.rows[0];
    },

    deletePost: async (parent, args) => {
      const result = await db.query(
        'DELETE FROM posts WHERE id = $1 RETURNING id',
        [args.id],
      );
      return result.rows.length > 0;
    },
  },
};
