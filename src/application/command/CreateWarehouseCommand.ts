import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import { Id } from "@domain/model/Entity";
import Warehouse from "@domain/model/Warehouse";
import Size from "@domain/model/Size";
import WarehouseRepository from "@domain/repository/WarehouseRepository";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { Logger } from "@infrastructure/logger/Logger";

type Input = {
  name: string,
  size: Size,
}

export default class CreateWarehouseCommand {
  private logger: Logger;

  constructor(
    private warehouseRepository: WarehouseRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

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

    this.logger.info(`Created warehouse #${warehouse.id} - ${input.name} (${input.size.width}x${input.size.height}x${input.size.length})`);

    return warehouse.id;
  }
};
