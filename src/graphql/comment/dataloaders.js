import DataLoader from 'dataloader';
import db from '../../../infra/database.js';

const batchCommentsByPostId = async (postIds) => {
  console.log('📦 BATCHING comments for posts:', postIds);

  const result = await db.query(
    'SELECT * FROM comments WHERE post_id = ANY($1::int[])',
    [postIds],
  );

  const commentsByPost = {};
  postIds.forEach((id) => {
    commentsByPost[id] = [];
  });

  result.rows.forEach((comment) => {
    commentsByPost[comment.post_id].push(comment);
  });

  return postIds.map((id) => commentsByPost[id]);
};

const batchCommentCounts = async (postIds) => {
  console.log('📦 BATCHING comment counts for posts:', postIds);

  const result = await db.query(
    `SELECT post_id, COUNT(1) as count
     FROM comments
     WHERE post_id = ANY($1::int[])
     GROUP BY post_id`,
    [postIds],
  );

  const countMap = {};
  result.rows.forEach((row) => {
    countMap[row.post_id] = parseInt(row.count);
  });

  return postIds.map((id) => countMap[id] || 0);
};

// Create all loaders
const commentLoaders = () => ({
  commentsByPostId: new DataLoader(batchCommentsByPostId),
  commentCountByPostId: new DataLoader(batchCommentCounts),
});

export default commentLoaders;
