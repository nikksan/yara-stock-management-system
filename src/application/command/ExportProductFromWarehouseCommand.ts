import EntityNotFoundError from '@application/errors/EntityNotFoundError';
import { Id } from '@domain/model/Entity';
import ProductRepository from '@domain/repository/ProductRepository';
import WarehouseRepository from '@domain/repository/WarehouseRepository';
import { Logger } from '@infrastructure/logger/Logger';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

export type Input = {
  productId: Id,
  warehouseId: Id,
  quantity: number,
}

export default class ExportProductFromWarehouseCommand {
  private logger: Logger;

  constructor(
    private warehouseRepository: WarehouseRepository,
    private productRepository: ProductRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async execute(input: Input): Promise<void> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      throw new EntityNotFoundError('product', input.productId);
    }

    const warehouse = await this.warehouseRepository.findById(input.warehouseId);
    if (!warehouse) {
      throw new EntityNotFoundError('warehouse', input.warehouseId);
    }

    warehouse.export(product, input.quantity);
    await this.warehouseRepository.save(warehouse);

    this.logger.info(`Exported product #${product.id} (${input.quantity}) from #${warehouse.id}`);
  }
}
