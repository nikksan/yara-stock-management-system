import Product from "@domain/model/Product";
import ProductRepository from "@domain/repository/ProductRepository";
import { Paginated, PaginationOpts } from "@domain/repository/Repository";

export default class ListProductsQuery {
  constructor(
    private productRepository: ProductRepository,
  ) {}

  async run(opts: PaginationOpts): Promise<Paginated<Product>> {
    return this.productRepository.findAndCountByCriteria(opts);
  }
}
