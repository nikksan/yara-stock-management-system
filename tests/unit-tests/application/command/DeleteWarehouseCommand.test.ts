import DeleteWarehouseCommand from "@application/command/DeleteWarehouseCommand";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import IdGenerator from "@domain/model/IdGenerator";
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { loadConfig } from "@config/index";

describe('DeleteWarehouseCommand', () => {
  const warehouseRepository = new InMemoryWarehouseRepository();
  const entityFactory = new EntityFactory();
  const config = loadConfig();
  const loggerFactory = new LoggerFactory(config.log);

  const command = new DeleteWarehouseCommand(
    warehouseRepository,
    loggerFactory,
  );

  it('should throw EntityNotFoundError when a warehouse does not exist', async () => {
    await expect(command.execute(IdGenerator.generate())).rejects.toThrow(EntityNotFoundError);
  });

  it('should delete a warehouse from the repo', async () => {
    const warehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse);

    await command.execute(warehouse.id);

    expect(await warehouseRepository.findById(warehouse.id)).toBeNull();
  });
});
