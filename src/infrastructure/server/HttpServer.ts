import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Config } from "@config/Config";
import WarehouseController from "@infrastructure/controller/WarehouseController";
import { Logger } from "@infrastructure/logger/Logger";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { typeDefs as scalarTypeDefs, DateTimeResolver } from 'graphql-scalars';
import typeDefs from './typeDefs';
import ProductController from '@infrastructure/controller/ProductController';

export default class HttpServer {
  private logger: Logger;

  constructor(
    private warehouseController: WarehouseController,
    private productController: ProductController,
    private config: Config['server'],
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async start(): Promise<void> {
    const server = new ApolloServer({
      typeDefs: [
        ...scalarTypeDefs,
        typeDefs,
      ],
      resolvers: this.createResolvers(),
      formatError: this.formatError,
    });

    const { url } = await startStandaloneServer(server, {
      listen: { port: this.config.port },
    });

    this.logger.info(`Apollo server listening on url: ${url}`);
  }

  private createResolvers() {
    const resolvers = {
      DateTime: DateTimeResolver,
      Query: {
        getWarehouses: async () => {
          return [{ id: 1, name: 'kur', size: { width: 1, height: 1, length: 1 } }];
        },
      },
      Mutation: {
        createWarehouse: async (_: unknown, input: unknown) => {
          return this.warehouseController.create(input);
        },
        deleteWarehouse: async (_: unknown, input: unknown) => {
          return this.warehouseController.delete(input);
        },
        exportProductFromWarehouse: async (_: unknown, input: unknown) => {
          return this.warehouseController.exportProduct(input);
        },
        importProductToWarehouse: async (_: unknown, input: unknown) => {
          return this.warehouseController.importProduct(input);
        },

        createProduct: async (_: unknown, input: unknown) => {
          return this.productController.create(input);
        },
        updateProduct: async (_: unknown, input: unknown) => {
          return this.productController.update(input);
        },
        deleteProduct: async (_: unknown, input: unknown) => {
          return this.productController.delete(input);
        },
      }
    };

    return resolvers;
  }

  private formatError(_: unknown, error: unknown) {
    console.log(error);

    return { message: (error as Error).message };
  }
}
