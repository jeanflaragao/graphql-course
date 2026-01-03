import DataLoader from 'dataloader';
import db from '../infra/database.js';

// Batch load posts by author IDs
const batchPostsByAuthorId = async (authorIds) => {
  console.log('📦 BATCHING posts for authors:', authorIds);

  const result = await db.query(
    'SELECT * FROM posts WHERE author_id = ANY($1::int[])',
    [authorIds]
  );

  // Group posts by author_id
  const postsByAuthor = {};
  authorIds.forEach(id => {
    postsByAuthor[id] = [];
  });

  result.rows.forEach(post => {
    postsByAuthor[post.author_id].push(post);
  });

  // Return in same order as authorIds
  return authorIds.map(id => postsByAuthor[id]);
};

// Batch load comments by post IDs
const batchCommentsByPostId = async (postIds) => {
  console.log('📦 BATCHING comments for posts:', postIds);

  const result = await db.query(
    'SELECT * FROM comments WHERE post_id = ANY($1::int[])',
    [postIds]
  );

  const commentsByPost = {};
  postIds.forEach(id => {
    commentsByPost[id] = [];
  });

  result.rows.forEach(comment => {
    commentsByPost[comment.post_id].push(comment);
  });

  return postIds.map(id => commentsByPost[id]);
};

// Batch load users by IDs
const batchUsers = async (userIds) => {
  console.log('📦 BATCHING users:', userIds);

  const result = await db.query(
    'SELECT * FROM users WHERE id = ANY($1::int[])',
    [userIds]
  );

  const userMap = {};
  result.rows.forEach(user => {
    userMap[user.id] = user;
  });

  return userIds.map(id => userMap[id] || null);
};

// Batch load posts by IDs
const batchPosts = async (postIds) => {
  console.log('📦 BATCHING posts:', postIds);

  const result = await db.query(
    'SELECT * FROM posts WHERE id = ANY($1::int[])',
    [postIds]
  );

  const postMap = {};
  result.rows.forEach(post => {
    postMap[post.id] = post;
  });

  return postIds.map(id => postMap[id] || null);
};

const batchCommentCounts = async (postIds) => {
  console.log('📦 BATCHING comment counts for posts:', postIds);

  const result = await db.query(
    `SELECT post_id, COUNT(1) as count
     FROM comments
     WHERE post_id = ANY($1::int[])
     GROUP BY post_id`,
    [postIds]
  );

  const countMap = {};
  result.rows.forEach(row => {
    countMap[row.post_id] = parseInt(row.count);
  });

  return postIds.map(id => countMap[id] || 0);
};

// Create all loaders
const createLoaders = () => ({
  postsByAuthorId: new DataLoader(batchPostsByAuthorId),
  commentsByPostId: new DataLoader(batchCommentsByPostId),
  userById: new DataLoader(batchUsers),
  postById: new DataLoader(batchPosts),
  commentCountByPostId: new DataLoader(batchCommentCounts),
});

export default createLoaders;
