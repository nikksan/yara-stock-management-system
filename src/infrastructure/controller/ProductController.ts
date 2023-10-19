import CreateProductCommand, { Input as CreateProductInput } from "@application/command/CreateProductCommand";
import DeleteProductCommand from "@application/command/DeleteProductCommand";
import UpdateProductCommand, { Input as UpdateProductInput } from "@application/command/UpdateProductCommand";
import { Id } from "@domain/model/Entity";
import { assert } from "typia";

export default class ProductController {
  constructor(
    private createProductCommand: CreateProductCommand,
    private updateProductCommand: UpdateProductCommand,
    private deleteProductCommand: DeleteProductCommand,
  ) {}

  async create(input: unknown): Promise<Id> {
    const validatedInput = assert<CreateProductInput>(input);
    return this.createProductCommand.execute(validatedInput);
  }

  async update(input: unknown): Promise<void> {
    const validatedInput = assert<UpdateProductInput>(input);
    return this.updateProductCommand.execute(validatedInput);
  }

  async delete(input: unknown): Promise<void> {
    const validatedInput = assert<{ productId: Id }>(input);
    return this.deleteProductCommand.execute(validatedInput.productId);
  }
}
