/**
 * Encode cursor (ID to base64)
 */
export const encodeCursor = (id) => {
  return Buffer.from(id.toString()).toString('base64');
};

/**
 * Decode cursor (base64 to ID)
 */
export const decodeCursor = (cursor) => {
  return Number(Buffer.from(cursor, 'base64').toString('utf-8'));
};

/**
 * Build pagination SQL
 * @param {string} baseQuery - Base SQL query
 * @param {Object} args - Pagination arguments
 * @param {number} startParamIndex - Starting parameter index (for $1, $2, etc.)
 * @returns {Object} - { query, params }
 */
export const buildPaginationQuery = (baseQuery, args, startParamIndex = 1) => {
  const { first = 10, after, orderBy = 'NEWEST' } = args;

  let query = baseQuery;
  const params = [];
  let paramCount = startParamIndex;

  // Add cursor condition if provided
  if (after) {
    const afterId = decodeCursor(after);

    // Direction depends on orderBy
    if (orderBy === 'OLDEST') {
      query += ` AND id > $${paramCount}`;
    } else {
      query += ` AND id < $${paramCount}`;
    }
    params.push(afterId);
    paramCount++;
  }

  // Add ordering
  switch (orderBy) {
    case 'OLDEST':
      query += ' ORDER BY id ASC';
      break;
    case 'MOST_LIKED':
      query +=
        ' ORDER BY (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) DESC';
      break;
    case 'MOST_COMMENTED':
      query +=
        ' ORDER BY (SELECT COUNT(*) FROM comments WHERE post_id = posts.id) DESC';
      break;
    case 'NEWEST':
    default:
      query += ' ORDER BY id DESC';
      break;
  }

  // Fetch one extra to check if there's a next page
  query += ` LIMIT $${paramCount}`;
  params.push(first + 1);

  return { query, params };
};
