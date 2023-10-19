import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import { Id } from "@domain/model/Entity";
import Product from "@domain/model/Product";
import Size from "@domain/model/Size";
import ProductRepository from "@domain/repository/ProductRepository";
import { Logger } from "@infrastructure/logger/Logger";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";

type Input = {
  name: string,
  size: Size,
  isHazardous: boolean,
}

export default class CreateProductCommand {
  private logger: Logger;

  constructor(
    private productRepository: ProductRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

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

    this.logger.info(`Created product #${product.id} - ${input.name} (${input.size.width}x${input.size.height}x${input.size.length})`);

    return product.id;
  }
};
