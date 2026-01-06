import { commentLoaders } from './comment/dataloaders.js';
import { likeLoaders } from './like/dataloaders.js';
import { postLoaders } from './post/dataloaders.js';
import { userLoaders } from './user/dataloaders.js';
import { extractToken, verifyToken } from '../utils/auth.js';
import db from '../../infra/database.js';

export const context = async ({ req }) => {
  const authHeader = req.headers.authorization;
  const token = extractToken(authHeader);

  let currentUser = null;

  if (token) {
    const decoded = verifyToken(token);

    if (decoded) {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [
        decoded.userId,
      ]);
      currentUser = result.rows[0];

      if (result.rows.length > 0) {
        currentUser = result.rows[0];
        console.log('🔐 Authenticated user:', currentUser.email);
      }
    }
  }

  return {
    currentUser,
    userLoaders: userLoaders(),
    postLoaders: postLoaders(),
    commentLoaders: commentLoaders(),
    likeLoaders: likeLoaders(),
  };
};
