import DTOGenerator, { ProductDTO } from "@application/service/DTOGenerator";
import ProductRepository from "@domain/repository/ProductRepository";
import { Paginated, PaginationOpts } from "@domain/repository/Repository";

export default class ListProductsQuery {
  constructor(
    private productRepository: ProductRepository,
  ) {}

  async run(opts: PaginationOpts): Promise<Paginated<ProductDTO>> {
    const { items: products , total } = await this.productRepository.findAndCountByCriteria(opts);

    return {
      items: products.map(product => DTOGenerator.generateFromProduct(product)),
      total,
    };
  }
}
