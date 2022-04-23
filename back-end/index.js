const { ApolloServer, gql } = require("apollo-server");
const { getDB, pool } = require("./mysql");

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Todo {
    id: Int
    description: String
    isFinished: Boolean
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    todos: [Todo],
    fetch(id: Int!): [Todo],
    create(description: String!,isFinished: Int!): Todo,
    delete(id: Int!): Todo,
    edit(id: Int!,description:String!, isFinished: Int!): Todo
  }
`;

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin",
  },
  {
    title: "City of Glass",
    author: "Paul Auster",
  },
];

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    todos: async () => {
      return new Promise((resolve, reject) => {
        pool.query("SELECT * FROM todo", (err, todos) => {
          if (err) {
            reject(err);
          } else {
            resolve(todos);
          }
        });
      });
    },

    fetch: async (parent, args, context, info) => {
      return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM todo where id = '${args.id}'`, (err, todo) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(todo);
          }
        });
      });
    },
    create: async (parent, args, context, info) => {
      return new Promise((resolve, reject) => {
        pool.query(`INSERT INTO todo (description,isFinished) VALUES ("${args.description}","${args.isFinished}");`, (err, todo) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(todo);
          }
        });
      });
    },
    delete: async (parent, args, context, info) => {
      return new Promise((resolve, reject) => {
        pool.query(`DELETE FROM todo WHERE id = '${args.id}';`, (err, todo) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(todo);
          }
        });
      });
    },
    edit: async (parent, args, context, info) => {
      return new Promise((resolve, reject) => {
        pool.query(`UPDATE todo SET description = '${args.description}', isFinished = '${args.isFinished}' WHERE id = '${args.id}';`, (err, todo) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            resolve(todo);
          }
        });
      });
    }

  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
