import db from '../../../infra/database.js';
import { requireAuth, requireOwnership } from '../../utils/permissions.js';

export const postResolvers = {
  Query: {
    posts: async () => {
      const result = await db.query(
        'SELECT * FROM posts WHERE status = $1 ORDER BY created_at DESC',
        ['PUBLISHED'],
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

    postsByCategory: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM posts WHERE category = $1 AND status = $2 ORDER BY created_at DESC',
        [args.category, 'PUBLISHED'],
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
    createPost: async (parent, args, context) => {
      const user = requireAuth(context);

      const { title, content, category, status } = args.input;
      const result = await db.query(
        `INSERT INTO posts (title, content, category, author_id, status)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
        [title, content, category, user.id, status || 'DRAFT'],
      );
      console.log('✅ Created post:', result.rows[0].title, 'by', user.name);
      return result.rows[0];
    },

    updatePost: async (parent, args, context) => {
      // Require authentication
      requireAuth(context);

      const { id, input } = args;

      // Get the post to check ownership
      const postResult = await db.query('SELECT * FROM posts WHERE id = $1', [
        id,
      ]);

      if (postResult.rows.length === 0) {
        throw new Error('Post not found');
      }

      const post = postResult.rows[0];

      // Check ownership (throws error if not owner/admin)
      requireOwnership(context, post.author_id);

      // Build update query dynamically
      const updates = [];
      const params = [];
      let paramCount = 1;

      if (input.title) {
        updates.push(`title = $${paramCount}`);
        params.push(input.title);
        paramCount++;
      }

      if (input.content) {
        updates.push(`content = $${paramCount}`);
        params.push(input.content);
        paramCount++;
      }

      if (input.category) {
        updates.push(`category = $${paramCount}`);
        params.push(input.category);
        paramCount++;
      }

      if (input.status) {
        updates.push(`status = $${paramCount}`);
        params.push(input.status);
        paramCount++;
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const result = await db.query(
        `UPDATE posts SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING *`,
        params,
      );

      console.log('✅ Updated post:', result.rows[0].title);
      return result.rows[0];
    },

    deletePost: async (parent, args) => {
      requireAuth(context);

      const postResult = await db.query('SELECT * FROM posts WHERE id = $1', [
        args.id,
      ]);

      if (postResult.rows.length === 0) {
        return false;
      }

      const post = postResult.rows[0];

      // Check ownership
      requireOwnership(context, post.author_id);

      const result = await db.query(
        'DELETE FROM posts WHERE id = $1 RETURNING id',
        [args.id],
      );
      console.log('✅ Deleted post:', args.id);
      return result.rows.length > 0;
    },
  },
};
