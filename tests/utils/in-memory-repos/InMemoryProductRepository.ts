import Product from "@domain/model/Product";
import InMemoryRepository from "./InMemoryRepository";
import ProductRepository from "@domain/repository/ProductRepository";
import Size from "@domain/model/Size";
import { cloneDeep, isEqual } from 'lodash';

export default class InMemoryProductRepository extends InMemoryRepository<Product> implements ProductRepository {
  async findByNameAndSize(name: string, size: Size): Promise<Product | null> {
    for (const [,product] of this.entities) {
      if (product.getName() === name && isEqual(product.getSize(), size)) {
        return cloneDeep(product);
      }
    }

    return null;
  }
}
