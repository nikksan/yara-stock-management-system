import CreateProductCommand, { Input as CreateProductInput } from "@application/command/CreateProductCommand";
import DeleteProductCommand from "@application/command/DeleteProductCommand";
import UpdateProductCommand, { Input as UpdateProductInput } from "@application/command/UpdateProductCommand";
import ListProductsQuery from "@application/query/ListProductsQuery";
import { ProductDTO } from "@application/service/DTOGenerator";
import { Id } from "@domain/model/Entity";
import { Paginated, PaginationOpts } from "@domain/repository/Repository";

export default class ProductController {
  constructor(
    private createProductCommand: CreateProductCommand,
    private updateProductCommand: UpdateProductCommand,
    private deleteProductCommand: DeleteProductCommand,
    private listProductsQuery: ListProductsQuery,
  ) {}

  async create(input: CreateProductInput): Promise<Id> {
    return this.createProductCommand.execute(input);
  }

  async update(input: UpdateProductInput): Promise<void> {
    return this.updateProductCommand.execute(input);
  }

  async delete(id: Id): Promise<void> {
    return this.deleteProductCommand.execute(id);
  }

  async list(input: PaginationOpts): Promise<Paginated<ProductDTO>> {
    return this.listProductsQuery.run(input);
  }
}
