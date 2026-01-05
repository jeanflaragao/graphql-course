import DataLoader from 'dataloader';
import db from '../../../infra/database.js';

const batchLikesCount = async (postIds) => {
  console.log('📦 BATCHING likes for posts:', postIds);

  const result = await db.query(
    'SELECT post_id, COUNT(1) as count FROM likes WHERE post_id = ANY($1::int[]) GROUP BY post_id',
    [postIds],
  );

  const countMap = {};
  result.rows.forEach((row) => {
    countMap[row.post_id] = parseInt(row.count);
  });

  return postIds.map((id) => countMap[id] || 0);
};

const batchUsersWhoLikedPost = async (postIds) => {
  console.log('📦 BATCHING users who liked posts:', postIds);

  const result = await db.query(
    `SELECT pl.post_id, u.id, u.name, u.email, u.role, u.created_at
     FROM likes pl
     JOIN users u ON pl.author_id = u.id
     WHERE pl.post_id = ANY($1::int[])`,
    [postIds],
  );

  const usersByPost = {};
  postIds.forEach((id) => {
    usersByPost[id] = [];
  });

  result.rows.forEach((row) => {
    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: row.created_at,
    };
    usersByPost[row.post_id].push(user);
  });

  return postIds.map((id) => usersByPost[id] || []);
};

const batchPostsLikedByUser = async (userIds) => {
  console.log('📦 BATCHING posts liked by users:', userIds);

  const result = await db.query(
    `
    SELECT
      pl.author_id AS liker_id,
      p.id,
      p.title,
      p.content,
      p.category,
      p.status,
      p.views,
      p.author_id AS post_author_id,
      p.created_at,
      p.updated_at
    FROM likes pl
    JOIN posts p ON pl.post_id = p.id
    WHERE pl.author_id = ANY($1::int[])
    `,
    [userIds],
  );

  const postsByUser = {};
  userIds.forEach((id) => {
    postsByUser[id] = [];
  });

  result.rows.forEach((row) => {
    const post = {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      status: row.status,
      views: row.views,
      author_id: row.post_author_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    postsByUser[row.liker_id].push(post);
  });

  return userIds.map((id) => postsByUser[id]);
};

export const likeLoaders = () => ({
  likesCountByPostId: new DataLoader(batchLikesCount),
  usersWhoLikedPost: new DataLoader(batchUsersWhoLikedPost),
  postsLikedByUser: new DataLoader(batchPostsLikedByUser),
});
