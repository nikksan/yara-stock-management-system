import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    getBooks: [Book]
  }

  type Mutation {
    doShit(message: String): String
  }
`;

const resolvers = {
  Query: {
    getBooks: async () => {
      console.log('returning books');
      return [];
    },
  },
  Mutation: {
    doShit: async (_: unknown, params: unknown) => {
      console.log({ params });
      return 'kur';
    },
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

(async () => {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`Server ready at: ${url}`);
})();

