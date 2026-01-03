import createLoaders  from './dataloaders.js';

export const context = () => {
  return {
    loaders: createLoaders(),
  }
};

