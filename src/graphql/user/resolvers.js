import db from '../../../infra/database.js';

export const userResolvers = {
  Query: {
    user: async (parent, args, context) => {
      return context.loaders.userById.load(args.id);
    },

    users: async () => {
      const result = await db.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    },
  }
};

