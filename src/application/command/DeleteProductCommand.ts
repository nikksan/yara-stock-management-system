import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import OperationForbiddenError from "@application/errors/OperationForbiddenError";
import { Id } from "@domain/model/Entity";
import ProductRepository from "@domain/repository/ProductRepository";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

export default class DeleteProductCommand {
  constructor(
    private warehouseRepository: WarehouseRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(id: Id): Promise<void> {
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new EntityNotFoundError('product', id);
    }

    const warehousesStockedWithTheProduct = await this.warehouseRepository.findAllByProductId(id);
    if (warehousesStockedWithTheProduct.length) {
      throw new OperationForbiddenError(`product #${id} is stocked in warehouses - ${warehousesStockedWithTheProduct.map(warehouse => warehouse.id)}`);
    }

    await this.productRepository.delete(existingProduct);
  }
};
