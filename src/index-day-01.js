// index.js
const { ApolloServer, gql } = require('apollo-server');

// Mock Database
const books = [
  { id: '1', title: '1984', author: 'George Orwell', year: 1949, pages: 328, genre: 'Dystopian', rating: 2},
  { id: '2', title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960, pages: 281, genre: 'Fiction', rating: 2},
  { id: '3', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, pages: 180, genre: 'Fiction', rating: 5},
  { id: '4', title: 'Dune', author: 'Frank Herbert', year: 1965, pages: 688, genre: 'Science Fiction', rating: 5},
  { id: '5', title: 'Foundation', author: 'Isaac Asimov', year: 1951, pages: 255, genre: 'Science Fiction', rating: 5}
];

// Schema Definition
const typeDefs = gql`
  type Book {
    id: ID!
    title: String!
    author: String!
    year: Int!
    pages: Int!
    genre: String!
    rating: Float
  }

  type Query {
    # Get all books
    books: [Book!]!

    # Get a single book by ID
    book(id: ID!): Book

    # Search books by title (case-insensitive, partial match)
    searchBooks(query: String!): [Book!]!

    # Filter books by genre
    booksByGenre(genre: String!): [Book!]!

    # Get books published after a certain year
    booksAfterYear(year: Int!): [Book!]!

    # Get total number of books
    totalBooks: Int!

    topRatedBooks(minRating: Float!): [Book!]!

    bookCountByGenre(genre: String!): Int!
  }
`;

// Resolvers - Business Logic
const resolvers = {
  Query: {
    books: () => {
      return books;
    },

    book: (parent, args) => {
      return books.find(book => book.id === args.id);
    },

    searchBooks: (parent, args) => {
      const query = args.query.toLowerCase();
      return books.filter(book =>
        book.title.toLowerCase().includes(query)
      );
    },

    booksByGenre: (parent, args) => {
      return books.filter(book =>
        book.genre.toLowerCase() === args.genre.toLowerCase()
      );
    },

    booksAfterYear: (parent, args) => {
      return books.filter(book => book.year > args.year);
    },

    totalBooks: () => {
      return books.length;
    },

    topRatedBooks: (parent, args) => {
      return books.filter(book => book.rating >= args.minRating);
    },

    bookCountByGenre: (parent, args) => {
      return books.filter(book =>
        book.genre.toLowerCase() === args.genre.toLowerCase()
      ).length;
    }
  }
};

// Create and Start Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Book Library API ready at ${url}`);
  console.log(`📚 Try these queries in Playground:`);
  console.log(`   - books`);
  console.log(`   - searchBooks(query: "great")`);
  console.log(`   - booksByGenre(genre: "Fiction")`);
});
