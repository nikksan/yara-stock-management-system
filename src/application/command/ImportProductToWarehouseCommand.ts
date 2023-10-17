import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import { Id } from "@domain/model/Entity";
import ProductRepository from "@domain/repository/ProductRepository";
import WarehouseRepository from "@domain/repository/WarehouseRepository"

export default class ImportProductToWarehouseCommand {
  constructor(
    private warehouseRepository: WarehouseRepository,
    private productRepository: ProductRepository,
  ) {}

  async execute(
    productId: Id,
    warehouseId: Id,
    quantity: number,
    date: Date,
  ): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new EntityNotFoundError('product', productId);
    }

    const warehouse = await this.warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new EntityNotFoundError('warehouse', warehouseId);
    }

    warehouse.import(product, quantity, date);
    await this.warehouseRepository.save(warehouse);
  }
}
