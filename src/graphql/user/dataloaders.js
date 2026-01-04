import DataLoader from 'dataloader';
import db from '../../../infra/database.js';

const makeUserDataLoader = async (userIds) => {
  console.log('📦 BATCHING users:', userIds);

  const result = await db.query(
    'SELECT * FROM users WHERE id = ANY($1::int[])',
    [userIds],
  );

  const userMap = {};
  result.rows.forEach((user) => {
    userMap[user.id] = user;
  });

  return userIds.map((id) => userMap[id] || null);
};

export const userLoaders = () => {
  return {
    userById: new DataLoader(makeUserDataLoader),
  };
};
