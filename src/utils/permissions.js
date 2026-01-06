import { AuthenticationError, ForbiddenError } from 'apollo-server';

/**
 * Require user to be authenticated
 */
export const requireAuth = (context) => {
  if (!context.currentUser) {
    throw new AuthenticationError('You must be logged in');
  }
  return context.currentUser;
};

/**
 * Require user to have specific role(s)
 */
export const requireRole = (context, allowedRoles) => {
  const user = requireAuth(context);

  if (!allowedRoles.includes(user.role)) {
    throw new ForbiddenError(
      'You do not have permission to perform this action',
    );
  }

  return user;
};

/**
 * Check if user owns a resource
 */
export const requireOwnership = (context, resourceAuthorId) => {
  const user = requireAuth(context);

  // Admins can access anything
  if (user.role === 'ADMIN') {
    return true;
  }

  // Check if user owns the resource
  if (user.id !== resourceAuthorId) {
    throw new ForbiddenError('You can only modify your own content');
  }

  return true;
};

/**
 * Check if user can access resource (owner or admin)
 */
export const canAccess = (context, resourceAuthorId) => {
  const user = requireAuth(context);
  return user.role === 'ADMIN' || user.id === resourceAuthorId;
};
