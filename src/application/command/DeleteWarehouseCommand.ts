import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import { Id } from "@domain/model/Entity";
import WarehouseRepository from "@domain/repository/WarehouseRepository";
import { Logger } from "@infrastructure/logger/Logger";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";

export default class DeleteWarehouseCommand {
  private logger: Logger;

  constructor(
    private warehouseRepository: WarehouseRepository,
    loggerFactory: LoggerFactory,
  ) {
    this.logger = loggerFactory.create(this.constructor.name);
  }

  async execute(id: Id): Promise<void> {
    const existingWarehouse = await this.warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new EntityNotFoundError('warehouse', id);
    }

    await this.warehouseRepository.delete(existingWarehouse);

    this.logger.info(`Deleted warehouse #${existingWarehouse.id}`);
  }
};
