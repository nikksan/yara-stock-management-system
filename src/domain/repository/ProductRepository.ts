import Product from "@domain/model/Product";
import Repository from "./Repository";

interface ProductRepository extends Repository<Product> {}

export default ProductRepository;
