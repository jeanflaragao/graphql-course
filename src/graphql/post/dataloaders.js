import DataLoader from 'dataloader';
import db from '../../../infra/database.js';

const batchPostsByAuthorId = async (authorIds) => {
  console.log('📦 BATCHING posts for authors:', authorIds);

  const result = await db.query(
    'SELECT * FROM posts WHERE author_id = ANY($1::int[])',
    [authorIds],
  );

  // Group posts by author_id
  const postsByAuthor = {};
  authorIds.forEach((id) => {
    postsByAuthor[id] = [];
  });

  result.rows.forEach((post) => {
    postsByAuthor[post.author_id].push(post);
  });

  // Return in same order as authorIds
  return authorIds.map((id) => postsByAuthor[id]);
};

// Batch load posts by IDs
const batchPosts = async (postIds) => {
  console.log('📦 BATCHING posts:', postIds);

  const result = await db.query(
    'SELECT * FROM posts WHERE id = ANY($1::int[])',
    [postIds],
  );

  const postMap = {};
  result.rows.forEach((post) => {
    postMap[post.id] = post;
  });

  return postIds.map((id) => postMap[id] || null);
};

export const postLoaders = () => ({
  postsByAuthorId: new DataLoader(batchPostsByAuthorId),
  postById: new DataLoader(batchPosts),
});
