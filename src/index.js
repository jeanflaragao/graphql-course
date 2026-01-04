import { ApolloServer, gql } from 'apollo-server';
import db from '../infra/database.js';
import { resolvers, typeDefs } from './graphql/schema.js';
import { context } from './graphql/context.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`🚀 Server with PostgreSQL ready at ${url}`);
});
