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
import { unwrapResolverError } from '@apollo/server/errors';
import EntityNotFoundError from '@application/errors/EntityNotFoundError';
import OperationForbiddenError from '@application/errors/OperationForbiddenError';
import CantMixProductsError from '@domain/errors/CantMixProductsError';
import NotEnoughQuantityError from '@domain/errors/NotEnoughQuantityError';
import NotEnoughSpaceInWarehouseError from '@domain/errors/NotEnoughSpaceInWarehouseError';
import ProductNotStockedError from '@domain/errors/ProductNotStockedError';
import TypeValidationError from '@domain/model/validation/TypeValidationError';
import ErrorCode from './ErrorCode';
import UniqueConstraintError from '@application/errors/UniqueConstraintError';
import { GraphQLError } from 'graphql';

export default class HttpServer {
  private logger: Logger;
  private apolloServer: ApolloServer;

  constructor(
    private warehouseController: WarehouseController,
    private productController: ProductController,
    private eventController: EventController,
    private config: Config['server'],
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
    this.apolloServer = new ApolloServer({
      typeDefs: [
        ...scalarTypeDefs,
        typeDefs,
      ],
      resolvers: this.createResolvers(),
      formatError: this.formatError,
    });
  }

  async start(): Promise<void> {
    const { url } = await startStandaloneServer(this.apolloServer, {
      listen: { port: this.config.port },
    });

    this.logger.info(`Apollo server listening on url: ${url}`);
  }

  getApolloServer() {
    return this.apolloServer;
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

        listProducts: async (_: unknown, input: PaginationOpts) => {
          return this.productController.list(input);
        },

        getHistoricImportsAndExports: async (_: unknown, input: GetHistoricImportsAndExportsInput) => {
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
    const originalError = unwrapResolverError(e) as Error;

    switch (true) {
      case unwrapResolverError(e) instanceof TypeValidationError:
        return {
          code: ErrorCode.TypeValidation,
          message: originalError.message,
          details: {
            path: (originalError as TypeValidationError).path,
            value: (originalError as TypeValidationError).value,
            expectedType: (originalError as TypeValidationError).expectedType,
          }
        };

      case originalError instanceof EntityNotFoundError:
        return {
          code: ErrorCode.EntityNotFound,
          message: originalError.message,
          details: {
            entityType: (originalError as EntityNotFoundError).entityType,
            id: (originalError as EntityNotFoundError).id,
          }
        };

      case originalError instanceof OperationForbiddenError:
        return {
          code: ErrorCode.OperationForbidden,
          message: originalError.message,
        };

      case originalError instanceof UniqueConstraintError:
        return {
          code: ErrorCode.UniqueConstraint,
          message: originalError.message,
          details: {
            path: (originalError as UniqueConstraintError).path,
          }
        };

      case originalError instanceof CantMixProductsError:
        return {
          code: ErrorCode.CantMixProducts,
          message: originalError.message,
        };

      case originalError instanceof NotEnoughQuantityError:
        return {
          code: ErrorCode.NotEnoughQuantity,
          message: originalError.message,
          details: {
            availableQuantity: (originalError as NotEnoughQuantityError).availableQuantity,
          }
        };

      case originalError instanceof NotEnoughSpaceInWarehouseError:
        return {
          code: ErrorCode.NotEnoughSpaceInWarehouse,
          message: originalError.message,
        };

      case originalError instanceof ProductNotStockedError:
        return {
          code: ErrorCode.ProductNotStocked,
          message: originalError.message,
        };

      case (
        originalError instanceof GraphQLError &&
        originalError.message.startsWith('Variable')
      ):
        return {
          code: ErrorCode.TypeValidation,
          message: originalError.message,
        };

      default:
        return {
          code: ErrorCode.General,
          message: originalError.message,
        };
    }

  }
}
