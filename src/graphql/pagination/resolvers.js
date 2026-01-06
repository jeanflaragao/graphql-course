import db from '../../../infra/database.js';
import { encodeCursor, buildPaginationQuery } from './helpers.js';

export const paginationResolvers = {
  Query: {
    paginatedPosts: async (parent, args) => {
      const { first = 10, category, status, search } = args;

      // Build base query with filters
      let baseQuery = 'SELECT * FROM posts WHERE 1=1';
      const filterParams = [];
      let filterParamCount = 1;

      if (category) {
        baseQuery += ` AND category = $${filterParamCount}`;
        filterParams.push(category);
        filterParamCount++;
      }

      if (status) {
        baseQuery += ` AND status = $${filterParamCount}`;
        filterParams.push(status);
        filterParamCount++;
      }

      // ADD SEARCH FILTER
      if (search) {
        baseQuery += ` AND search_vector @@ plainto_tsquery('english', $${filterParamCount})`;
        filterParams.push(search);
        filterParamCount++;
      }

      // Build pagination query
      const { query, params } = buildPaginationQuery(
        baseQuery,
        args,
        filterParamCount,
      );

      // Combine filter and pagination params
      const allParams = [...filterParams, ...params];

      // Execute query
      const result = await db.query(query, allParams);
      const posts = result.rows;

      // Check if there's a next page
      const hasNextPage = posts.length > first;
      if (hasNextPage) {
        posts.pop(); // Remove the extra item
      }

      // Get total count for this filter
      const countQuery = baseQuery.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await db.query(countQuery, filterParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Build edges with cursors
      const edges = posts.map((post) => ({
        node: post,
        cursor: encodeCursor(post.id),
      }));

      // Build page info
      const pageInfo = {
        hasNextPage,
        hasPreviousPage: !!args.after, // Simple check
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      };

      return {
        edges,
        pageInfo,
        totalCount,
      };
    },

    // ADD SIMPLE SEARCH QUERY
    searchPosts: async (parent, args) => {
      const { query: searchQuery, limit = 20 } = args;

      const result = await db.query(
        `SELECT *, ts_rank(search_vector, query) AS rank
         FROM posts, plainto_tsquery('english', $1) query
         WHERE search_vector @@ query
         ORDER BY rank DESC
         LIMIT $2`,
        [searchQuery, limit],
      );

      return result.rows;
    },
  },
};
