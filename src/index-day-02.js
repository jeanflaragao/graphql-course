// index.js
const { ApolloServer, gql } = require('apollo-server');

const users = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'ADMIN' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'AUTHOR' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'READER' }
];

const posts = [
  {
    id: '1',
    title: 'Getting Started with GraphQL',
    content: 'GraphQL is amazing...',
    authorId: '1',
    category: 'TECHNOLOGY',
    status: 'PUBLISHED',
    views: 1250
  },
  {
    id: '2',
    title: 'Healthy Living Tips',
    content: 'Let\'s explore...',
    authorId: '1',
    category: 'LIFESTYLE',
    status: 'PUBLISHED',
    views: 890
  },
  {
    id: '3',
    title: 'Business Strategies',
    content: 'Comparing the two...',
    authorId: '2',
    category: 'BUSINESS',
    status: 'PUBLISHED',
    views: 2100
  },
  {
    id: '4',
    title: 'My Draft Post',
    content: 'Work in progress...',
    authorId: '2',
    category: 'TECHNOLOGY',
    status: 'DRAFT',
    views: 0
  }
];

const comments = [
  { id: '1', content: 'Great post!', postId: '1', authorId: '2' },
  { id: '2', content: 'Very helpful, thanks!', postId: '1', authorId: '3' },
  { id: '3', content: 'I disagree with this...', postId: '3', authorId: '1' },
  { id: '4', content: 'Can you elaborate?', postId: '2', authorId: '3' }
];

const tags = [
  { id: '1', name: 'javascript' },
  { id: '2', name: 'graphql' },
  { id: '3', name: 'backend' },
  { id: '4', name: 'tutorial' }
];

// Many-to-many relationship: posts <-> tags
const postTags = [
  { postId: '1', tagId: '2' },  // Post 1 has tag "graphql"
  { postId: '1', tagId: '4' },  // Post 1 has tag "tutorial"
  { postId: '2', tagId: '2' },
  { postId: '3', tagId: '3' }
];

// Track likes
const postLikes = [
  { postId: '1', userId: '2' },
  { postId: '1', userId: '3' },
  { postId: '3', userId: '1' }
];

const typeDefs = gql`
  # Enum for user roles
  enum Role {
    ADMIN
    AUTHOR
    READER
  }

  # Enum for post categories
  enum Category {
    TECHNOLOGY
    LIFESTYLE
    BUSINESS
    SCIENCE
  }

  # Enum for post status
  enum PostStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    posts: [Post!]!
    comments: [Comment!]!
    likedPosts: [Post!]!   # Posts this user liked
  }

  type Comment {
    id: ID!
    content: String!
    post: Post!
    author: User!
    createdAt: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    category: Category!
    status: PostStatus!
    views: Int!
    author: User!
    comments: [Comment!]!
    commentCount: Int!
    tags: [Tag!]!          # Many-to-many!
    likes: Int!            # Computed count
    likedBy: [User!]!      # Users who liked this post
  }

  type Tag {
    id: ID!
    name: String!
    posts: [Post!]!
  }

  # INPUT TYPES - Used for mutations
  input CreateCommentInput {
    content: String!
    postId: ID!
    authorId: ID!
  }

  input CreateUserInput {
    name: String!
    email: String!
    role: Role = READER    # Default value!
  }

  input UpdateUserInput {
    name: String           # Optional - only update if provided
    email: String
    role: Role
  }

  input CreatePostInput {
    title: String!
    content: String!
    category: Category!
    authorId: ID!
    status: PostStatus = DRAFT    # Default to draft
  }

  input UpdatePostInput {
    title: String
    content: String
    category: Category
    status: PostStatus
  }

  type Query {
    users: [User!]!
    user(id: ID!): User

    posts: [Post!]!
    post(id: ID!): Post

    # Filter by enum values
    postsByCategory(category: Category!): [Post!]!
    postsByStatus(status: PostStatus!): [Post!]!
    usersByRole(role: Role!): [User!]!
    comments(postId: ID!): [Comment!]!
    comment(id: ID!): Comment

    # Tag queries
    tags: [Tag!]!
    tag(id: ID!): Tag
    postsByTag(tagName: String!): [Post!]!

    # Search
    searchPosts(query: String!): [Post!]!
  }

  type Mutation {
    # User mutations
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Post mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    publishPost(id: ID!): Post!
    createComment(input: CreateCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!

    # Tag mutations
    addTagToPost(postId: ID!, tagName: String!): Post!
    removeTagFromPost(postId: ID!, tagName: String!): Post!

    # Like mutations
    likePost(postId: ID!, userId: ID!): Post!
    unlikePost(postId: ID!, userId: ID!): Post!
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, args) => users.find(u => u.id === args.id),
    posts: () => posts,
    post: (parent, args) => posts.find(p => p.id === args.id),

    // Filter by enums
    postsByCategory: (parent, args) => {
      return posts.filter(p => p.category === args.category);
    },

    postsByStatus: (parent, args) => {
      return posts.filter(p => p.status === args.status);
    },

    usersByRole: (parent, args) => {
      return users.filter(u => u.role === args.role);
    },

    comments: (parent, args) => {
      return comments.filter(c => c.postId === args.postId);
    },

    comment: (parent, args) => {
      return comments.find(c => c.id === args.id);
    }

    tags: () => tags,
    tag: (parent, args) => tags.find(t => t.id === args.id),

    postsByTag: (parent, args) => {
      // Find tag
      const tag = tags.find(t => t.name.toLowerCase() === args.tagName.toLowerCase());
      if (!tag) return [];

      // Find posts with this tag
      const postIds = postTags
        .filter(pt => pt.tagId === tag.id)
        .map(pt => pt.postId);

      return posts.filter(p => postIds.includes(p.id));
    },

    searchPosts: (parent, args) => {
      const query = args.query.toLowerCase();
      return posts.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query)
      );
    }
  },

  Mutation: {
    createUser: (parent, args) => {
      const newUser = {
        id: String(users.length + 1),
        name: args.input.name,
        email: args.input.email,
        role: args.input.role || 'READER'  // Use default if not provided
      };

      users.push(newUser);
      console.log('✅ Created user:', newUser);
      return newUser;
    },

    updateUser: (parent, args) => {
      const user = users.find(u => u.id === args.id);

      if (!user) {
        throw new Error('User not found');
      }

      // Update only provided fields
      if (args.input.name) user.name = args.input.name;
      if (args.input.email) user.email = args.input.email;
      if (args.input.role) user.role = args.input.role;

      console.log('✅ Updated user:', user);
      return user;
    },

    deleteUser: (parent, args) => {
      const index = users.findIndex(u => u.id === args.id);

      if (index === -1) {
        return false;
      }

      users.splice(index, 1);
      console.log('✅ Deleted user with id:', args.id);
      return true;
    },

    createPost: (parent, args) => {
      const newPost = {
        id: String(posts.length + 1),
        title: args.input.title,
        content: args.input.content,
        category: args.input.category,
        authorId: args.input.authorId,
        status: args.input.status || 'DRAFT',
        views: 0
      };

      posts.push(newPost);
      console.log('✅ Created post:', newPost);
      return newPost;
    },

    updatePost: (parent, args) => {
      const post = posts.find(p => p.id === args.id);

      if (!post) {
        throw new Error('Post not found');
      }

      // Update only provided fields
      if (args.input.title) post.title = args.input.title;
      if (args.input.content) post.content = args.input.content;
      if (args.input.category) post.category = args.input.category;
      if (args.input.status) post.status = args.input.status;

      console.log('✅ Updated post:', post);
      return post;
    },

    deletePost: (parent, args) => {
      const index = posts.findIndex(p => p.id === args.id);

      if (index === -1) {
        return false;
      }

      posts.splice(index, 1);
      console.log('✅ Deleted post with id:', args.id);
      return true;
    },

    publishPost: (parent, args) => {
      const post = posts.find(p => p.id === args.id);

      if (!post) {
        throw new Error('Post not found');
      }

      post.status = 'PUBLISHED';
      console.log('✅ Published post:', post);
      return post;
    },

    createComment: (parent, args) => {
      const newComment = {
        id: String(comments.length + 1),
        content: args.input.content,
        postId: args.input.postId,
        authorId: args.input.authorId,
        createdAt: new Date().toISOString()
      };

      comments.push(newComment);
      console.log('✅ Created comment:', newComment);
      return newComment;
    },

    deleteComment: (parent, args) => {
      const index = comments.findIndex(c => c.id === args.id);
      if (index === -1) return false;

      comments.splice(index, 1);
      return true;
    },

    addTagToPost: (parent, args) => {
      // Find or create tag
      let tag = tags.find(t => t.name.toLowerCase() === args.tagName.toLowerCase());
      if (!tag) {
        tag = { id: String(tags.length + 1), name: args.tagName };
        tags.push(tag);
      }

      // Add relationship if doesn't exist
      const exists = postTags.some(pt =>
        pt.postId === args.postId && pt.tagId === tag.id
      );

      if (!exists) {
        postTags.push({ postId: args.postId, tagId: tag.id });
      }

      return posts.find(p => p.id === args.postId);
    },

    removeTagFromPost: (parent, args) => {
      const tag = tags.find(t => t.name.toLowerCase() === args.tagName.toLowerCase());
      if (!tag) return posts.find(p => p.id === args.postId);

      const index = postTags.findIndex(pt =>
        pt.postId === args.postId && pt.tagId === tag.id
      );

      if (index !== -1) {
        postTags.splice(index, 1);
      }

      return posts.find(p => p.id === args.postId);
    },

    likePost: (parent, args) => {
      // Check if already liked
      const exists = postLikes.some(pl =>
        pl.postId === args.postId && pl.userId === args.userId
      );

      if (!exists) {
        postLikes.push({ postId: args.postId, userId: args.userId });
      }

      return posts.find(p => p.id === args.postId);
    },

    unlikePost: (parent, args) => {
      const index = postLikes.findIndex(pl =>
        pl.postId === args.postId && pl.userId === args.userId
      );

      if (index !== -1) {
        postLikes.splice(index, 1);
      }

      return posts.find(p => p.id === args.postId);
    }
  },

  User: {
    posts: (parent) => posts.filter(post => post.authorId === parent.id),
    comments: (parent) => comments.filter(comment => comment.authorId === parent.id)
  },

  Post: {
    author: (parent) => users.find(user => user.id === parent.authorId),
    comments: (parent) => comments.filter(comment => comment.postId === parent.id),

    // Computed field - doesn't exist in data!
    commentCount: (parent) => {
      return comments.filter(comment => comment.postId === parent.id).length;
    }
  },

  Comment: {
    post: (parent) => posts.find(post => post.id === parent.postId),
    author: (parent) => users.find(user => user.id === parent.authorId)
  }
};
// Create and Start Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Blog API ready at ${url}`);
});
