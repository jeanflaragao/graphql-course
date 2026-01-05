import db from '../../../infra/database.js';

export const likeResolvers = {
  Mutation: {
    likePost: async (parent, args) => {
      const { postId, userId } = args;

      try {
        // Try to insert the like
        await db.query(
          `INSERT INTO likes (author_id, post_id)
           VALUES ($1, $2)
           ON CONFLICT (author_id, post_id) DO NOTHING`,
          [userId, postId],
        );

        console.log(`✅ User ${userId} liked post ${postId}`);
      } catch (error) {
        console.error('Error liking post:', error);
        throw new Error('Failed to like post');
      }

      // Return the post
      const result = await db.query('SELECT * FROM posts WHERE id = $1', [
        postId,
      ]);
      return result.rows[0];
    },

    unlikePost: async (parent, args) => {
      const { postId, userId } = args;
      const result = await db.query(
        `DELETE FROM likes WHERE author_id = $1 AND post_id = $2 RETURNING *`,
        [userId, postId],
      );
      if (result.rows.length === 0) {
        console.log(`⚠️ No like found for user ${userId} on post ${postId}`);
      } else {
        console.log(`✅ User ${userId} unliked post ${postId}`);
      }
      // Return the post
      const postResult = await db.query('SELECT * FROM posts WHERE id = $1', [
        postId,
      ]);
      return postResult.rows[0];
    },
  },
};
