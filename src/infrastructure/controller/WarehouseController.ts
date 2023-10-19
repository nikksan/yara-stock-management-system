import CreateWarehouseCommand, { Input as CreateWarehouseInput } from "@application/command/CreateWarehouseCommand";
import DeleteWarehouseCommand from "@application/command/DeleteWarehouseCommand";
import ExportProductFromWarehouseCommand, { Input as ExportProductFromWarehouseInput } from "@application/command/ExportProductFromWarehouseCommand";
import ImportProductToWarehouseCommand, { Input as ImportProductToWarehouseInput } from "@application/command/ImportProductToWarehouseCommand";
import { Id } from "@domain/model/Entity";
import { assert } from "typia";

export default class WarehouseController {
  constructor(
    private createWarehouseCommand: CreateWarehouseCommand,
    private deleteWarehouseCommand: DeleteWarehouseCommand,
    private exportProductFromWarehouseCommand: ExportProductFromWarehouseCommand,
    private importProductToWarehouseCommand: ImportProductToWarehouseCommand,
  ) {}

  async create(input: unknown): Promise<Id> {
    const validatedInput = assert<CreateWarehouseInput>(input);
    return this.createWarehouseCommand.execute(validatedInput);
  }

  async delete(input: unknown): Promise<void> {
    const validatedInput = assert<{ warehouseId: Id }>(input);
    return this.deleteWarehouseCommand.execute(validatedInput.warehouseId);
  }

  async exportProduct(input: unknown): Promise<void> {
    const validatedInput = assert<ExportProductFromWarehouseInput>(input);
    return this.exportProductFromWarehouseCommand.execute(validatedInput);
  }

  async importProduct(input: unknown): Promise<void> {
    const validatedInput = assert<ImportProductToWarehouseInput>(input);
    return this.importProductToWarehouseCommand.execute(validatedInput);
  }
}
