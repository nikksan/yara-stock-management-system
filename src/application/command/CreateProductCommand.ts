import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import { Id } from "@domain/model/Entity";
import Product from "@domain/model/Product";
import Size from "@domain/model/Size";
import ProductRepository from "@domain/repository/ProductRepository";

type Input = {
  name: string,
  size: Size,
  isHazardous: boolean,
}

export default class CreateProductCommand {
  constructor(
    private productRepository: ProductRepository,
  ) {}

  async execute(input: Input): Promise<Id> {
    const existingProductWithTheSameNameAndSize = await this.productRepository.findByNameAndSize(input.name, input.size);
    if (existingProductWithTheSameNameAndSize) {
      throw new UniqueConstraintError('name+size');
    }

    const product = new Product({
      name: input.name,
      size: input.size,
      isHazardous: input.isHazardous,
    });
    await this.productRepository.save(product);

    return product.id;
  }
};
