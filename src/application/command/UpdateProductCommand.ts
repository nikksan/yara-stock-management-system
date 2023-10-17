import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import OperationForbiddenError from "@application/errors/OperationForbiddenError";
import { Id } from "@domain/model/Entity";
import Size from "@domain/model/Size";
import ProductRepository from "@domain/repository/ProductRepository";
import WarehouseRepository from "@domain/repository/WarehouseRepository";
import { isEqual } from "lodash";

type Input = {
  id: Id,
  name?: string,
  size?: Size,
  isHazardous?: boolean,
}

export default class UpdateProductCommand {
  constructor(
    private warehouseRepository: WarehouseRepository,
    private productRepository: ProductRepository,
  ) { }

  async execute(input: Input): Promise<void> {
    const existingProduct = await this.productRepository.findById(input.id);
    if (!existingProduct) {
      throw new EntityNotFoundError('product', input.id);
    }

    if (input.size !== undefined) {
      if (!isEqual(input.size, existingProduct.getSize())) {
        await this.makeSureProductIsNotStockedAnywhere(input.id);
      }

      existingProduct.changeSize(input.size);
    }

    if (input.isHazardous !== undefined) {
      if (input.isHazardous !== existingProduct.getIsHazardous()) {
        await this.makeSureProductIsNotStockedAnywhere(input.id);
      }

      existingProduct.changeIsHazardous(input.isHazardous);
    }

    if (input.name !== undefined) {
      existingProduct.changeName(input.name);
    }

    await this.productRepository.save(existingProduct);
  }

  private async makeSureProductIsNotStockedAnywhere(id: Id) {
    const warehousesStockedWithTheProduct = await this.warehouseRepository.findAllByProductId(id);
    if (warehousesStockedWithTheProduct.length) {
      throw new OperationForbiddenError(`product #${id} is stocked in warehouses - ${warehousesStockedWithTheProduct.map(warehouse => warehouse.id)}`);
    }
  }
};
