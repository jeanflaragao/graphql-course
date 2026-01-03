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
      const post = await context.loaders.postById.load(args.id);
      if (typeof post === 'undefined' || post === null) {
        return {
          statusCode: 404,
          message: `Post with ID ${args.id} not found.`,
        };
      }
      return post;
    },

    postsByCategory: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC',
        [args.category],
      );
      return result.rows;
    },
  },
  PostResult: {
    __resolveType(obj) {
      if (typeof obj.statusCode !== 'undefined') return 'PostNotFoundError';
      if (typeof obj.id !== 'undefined') return 'Post';
      return null;
    },
  },
};
