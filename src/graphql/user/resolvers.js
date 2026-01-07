import db from '../../../infra/database.js';
import { requireRole } from '../../utils/permissions.js';

export const userResolvers = {
  Query: {
    user: async (parent, args, context) => {
      return context.userLoaders.userById.load(args.id);
    },

    users: async (parent, args, context) => {
      requireRole(context, ['ADMIN']);

      const result = await db.query(
        'SELECT * FROM users ORDER BY created_at DESC',
      );
      return result.rows;
    },
  },

  Mutation: {
    // Admin: Delete any user
    deleteUser: async (parent, args, context) => {
      requireRole(context, ['ADMIN']);

      const result = await db.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [args.id],
      );

      console.log('✅ Admin deleted user:', args.id);
      return result.rows.length > 0;
    },

    // Admin: Change user role
    changeUserRole: async (parent, args, context) => {
      requireRole(context, ['ADMIN']);

      const result = await db.query(
        'UPDATE users SET role = $1 WHERE id = $2 RETURNING *',
        [args.role, args.userId],
      );

      console.log('✅ Admin changed user role:', result.rows[0]);
      return result.rows[0];
    },
  },

  User: {
    email: (parent, args, context) => {
      if (!context.currentUser) {
        return null; // Not logged in
      }

      if (
        context.currentUser.id === parent.id ||
        context.currentUser.role === 'ADMIN'
      ) {
        return parent.email;
      }

      return null; // Hidden from other users
    },

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
