import CreateWarehouseCommand from "@application/command/CreateWarehouseCommand";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import TypeValidationError from "@domain/model/validation/TypeValidationError";
import Warehouse from "@domain/model/Warehouse";

describe('CreateWarehouseCommand', () => {
  const warehouseRepository = new InMemoryWarehouseRepository();
  const entityFactory = new EntityFactory();

  const command = new CreateWarehouseCommand(
    warehouseRepository,
  );

  afterEach(async () => {
    await warehouseRepository.deleteAll();
  });

  it('should throw UniqueConstraintError when a warehouse with the same name already exists', async () => {
    const existingWarehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(existingWarehouse);

    await expect(command.execute({
      name: existingWarehouse.getName(),
      size: existingWarehouse.getSize(),
    })).rejects.toThrow(UniqueConstraintError);
  });

  it.each(['', '   '])('should throw TypeValidationError when name is "%s"', async (name) => {
    let caughtErr;

    try {
      await command.execute({
        name,
        size: {
          height: 10,
          length: 10,
          width: 10,
        },
      });
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(TypeValidationError);
    expect((caughtErr as TypeValidationError).path).toEqual('name');
    expect((caughtErr as TypeValidationError).value).toEqual(name);
  });

  for (const dimension of ['width', 'height', 'length'] as const) {
    it.each([0, -5])(`should throw TypeValidationError when size.${dimension} is "%s"`, async (value) => {
      let caughtErr;

      try {
        await command.execute({
          name: 'Test Warehouse',
          size: {
            height: 10,
            length: 10,
            width: 10,
            [dimension]: value,
          },
        });
      } catch (err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeInstanceOf(TypeValidationError);
      expect((caughtErr as TypeValidationError).path).toEqual(`size.${dimension}`);
      expect((caughtErr as TypeValidationError).value).toEqual(value);
    });
  }

  it('should create a warehouse and store it in the repo', async () => {
    const warehouseId = await command.execute({
      name: 'Test Warehouse',
      size: {
        height: 10,
        length: 10,
        width: 10,
      },
    });

    const warehouse = await warehouseRepository.findById(warehouseId);
    expect(warehouse).toBeInstanceOf(Warehouse);
    expect((warehouse as Warehouse).getName()).toEqual('Test Warehouse');
    expect((warehouse as Warehouse).getSize()).toEqual({
      height: 10,
      length: 10,
      width: 10,
    });
  });
});
