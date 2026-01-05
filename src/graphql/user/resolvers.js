import db from '../../../infra/database.js';

export const userResolvers = {
  Query: {
    user: async (parent, args, context) => {
      return context.userLoaders.userById.load(args.id);
    },

    users: async () => {
      const result = await db.query(
        'SELECT * FROM users ORDER BY created_at DESC',
      );
      return result.rows;
    },
  },

  User: {
    posts: (parent, args, context) => {
      return context.postLoaders.postsByAuthorId.load(parent.id);
    },

    comments: (parent, args, context) => {
      return context.commentLoaders.commentsByAuthorId.load(parent.id);
    },

    likedPosts: (parent, args, context) => {
      return context.likeLoaders.postsLikedByUser.load(parent.id);
    },
  },
};
