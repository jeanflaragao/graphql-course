import db from '../../../infra/database.js';

export const postResolvers = {
  Query: {
    posts: async () => {
      const result = await db.query(
        'SELECT * FROM posts ORDER BY created_at DESC'
      );
      return result.rows;
    },

    post: async (parent, args, context) => {
      return context.loaders.postById.load(args.id);
    },

    postsByCategory: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE category = $1 ORDER BY created_at DESC',
        [args.category]
      );
      return result.rows;
    },
  },
};

