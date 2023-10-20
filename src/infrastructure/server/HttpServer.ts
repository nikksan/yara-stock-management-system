import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Config } from "@config/Config";
import WarehouseController from "@infrastructure/controller/WarehouseController";
import { Logger } from "@infrastructure/logger/Logger";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { typeDefs as scalarTypeDefs, DateTimeResolver } from 'graphql-scalars';
import typeDefs from './typeDefs';
import ProductController from '@infrastructure/controller/ProductController';
import EventController from '@infrastructure/controller/EventController';
import { Id } from '@domain/model/Entity';
import { PaginationOpts } from '@domain/repository/Repository';
import { Input as GetHistoricImportsAndExportsInput } from "@application/query/GetHistoricImportsAndExportsQuery";
import { Input as CreateWarehouseInput } from "@application/command/CreateWarehouseCommand";
import { Input as ExportProductFromWarehouseInput } from "@application/command/ExportProductFromWarehouseCommand";
import { Input as ImportProductToWarehouseInput } from "@application/command/ImportProductToWarehouseCommand";
import { Input as CreateProductInput } from "@application/command/CreateProductCommand";
import { Input as UpdateProductInput } from "@application/command/UpdateProductCommand";

export default class HttpServer {
  private logger: Logger;

  constructor(
    private warehouseController: WarehouseController,
    private productController: ProductController,
    private eventController: EventController,
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
        listWarehouses: async () => {
          return this.warehouseController.list();
        },
        getWarehouseStats: async (_: unknown, input: { warehouseId: Id }) => {
          return this.warehouseController.getStatus(input.warehouseId);
        },

        listProducts: async(_: unknown, input: PaginationOpts) => {
          return this.productController.list(input);
        },

        getHistoricImportsAndExports: async(_: unknown, input: GetHistoricImportsAndExportsInput) => {
          return this.eventController.getHistoricImportsAndExports(input);
        }
      },
      Mutation: {
        createWarehouse: async (_: unknown, input: CreateWarehouseInput) => {
          return this.warehouseController.create(input);
        },
        deleteWarehouse: async (_: unknown, input: { warehouseId: Id }) => {
          return this.warehouseController.delete(input.warehouseId);
        },
        exportProductFromWarehouse: async (_: unknown, input: ExportProductFromWarehouseInput) => {
          return this.warehouseController.exportProduct(input);
        },
        importProductToWarehouse: async (_: unknown, input: ImportProductToWarehouseInput) => {
          return this.warehouseController.importProduct(input);
        },

        createProduct: async (_: unknown, input: CreateProductInput) => {
          return this.productController.create(input);
        },
        updateProduct: async (_: unknown, input: UpdateProductInput) => {
          return this.productController.update(input);
        },
        deleteProduct: async (_: unknown, input: { productId: Id }) => {
          return this.productController.delete(input.productId);
        },
      }
    };

    return resolvers;
  }

  private formatError(_: unknown, e: unknown) {
    const error = e as Error;

    return { message: error.message };
  }
}
