import db from '../../../infra/database.js';

export const commentResolvers = {
  Query: {
    comments: async (parent, args) => {
      const result = await db.query(
        'SELECT * FROM comments WHERE post_id = $1',
        [args.postId],
      );
      return result.rows;
    },
  },

  Mutation: {
    createComment: async (parent, args) => {
      const { content, postId, authorId } = args.input;
      const result = await db.query(
        `INSERT INTO comments (content, post_id, author_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [content, postId, authorId],
      );
      console.log('✅ Created comment:', result.rows[0]);
      return result.rows[0];
    },

    deleteComment: async (parent, args) => {
      const result = await db.query(
        'DELETE FROM comments WHERE id = $1 RETURNING id',
        [args.id],
      );
      return result.rows.length > 0;
    },
  },

  Comment: {
    post: (parent, args, context) => {
      return context.postLoaders.postById.load(parent.post_id);
    },

    author: (parent, args, context) => {
      return context.userLoaders.userById.load(parent.author_id);
    },
  },
};
