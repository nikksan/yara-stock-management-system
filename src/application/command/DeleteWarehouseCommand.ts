import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import { Id } from "@domain/model/Entity";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

export default class DeleteWarehouseCommand {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) {}

  async execute(id: Id): Promise<void> {
    const existingWarehouse = await this.warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new EntityNotFoundError('warehouse', id);
    }

    await this.warehouseRepository.delete(existingWarehouse);
  }
};
