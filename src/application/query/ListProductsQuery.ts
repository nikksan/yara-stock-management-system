import Product from "@domain/model/Product";
import ProductRepository from "@domain/repository/ProductRepository";

export default class ListProductsQuery {
  constructor(
    private productRepository: ProductRepository,
  ) {}

  async run(): Promise<Array<Product>> {
    return [];
  }
}
