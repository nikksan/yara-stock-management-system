import Product from "@domain/model/Product";
import Repository from "./Repository";
import Size from "@domain/model/Size";

interface ProductRepository extends Repository<Product> {
  findByNameAndSize(name: string, size: Size): Promise<Product | null>;
}

export default ProductRepository;
