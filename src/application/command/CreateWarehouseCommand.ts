import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import { Id } from "@domain/model/Entity";
import Warehouse from "@domain/model/Warehouse";
import Size from "@domain/model/Size";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

type Input = {
  name: string,
  size: Size,
}

export default class CreateWarehouseCommand {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) {}

  async execute(input: Input): Promise<Id> {
    const existingWarehouseWithTheSameName = await this.warehouseRepository.findByName(input.name);
    if (existingWarehouseWithTheSameName) {
      throw new UniqueConstraintError('name');
    }

    const warehouse = new Warehouse({
      name: input.name,
      size: input.size,
      inventory: [],
    });
    await this.warehouseRepository.save(warehouse);

    return warehouse.id;
  }
};
