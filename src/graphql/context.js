import commentLoaders from './comment/dataloaders.js';
import { postLoaders } from './post/dataloaders.js';
import { userLoaders } from './user/dataloaders.js';

export const context = () => {
  return {
    userLoaders: userLoaders(),
    postLoaders: postLoaders(),
    commentLoaders: commentLoaders(),
  };
};
