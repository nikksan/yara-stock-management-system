import { loadConfig } from "@config/index";
import { Sequelize } from "sequelize";
import EntityFactory from "../../../../utils/entity-factory/EntityFactory";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import SequelizeWarehouseRepository from "@infrastructure/storage/sequelize/SequelizeWarehouseRepository";

describe('SequelizeWarehouseRepository', () => {
  const config = loadConfig();

  const loggerFactory = new LoggerFactory(config.log);
  const warehouseRepository = new SequelizeWarehouseRepository(
    new Sequelize(config.db),
    loggerFactory,
  );
  const entityFactory = new EntityFactory();

  afterEach(() => warehouseRepository.deleteAll());

  it('should save an entity', async () => {
    const warehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: '1',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
      ]
    });

    await warehouseRepository.save(warehouse);

    const savedWarehouse = await warehouseRepository.findById(warehouse.id);
    expect(savedWarehouse).toEqual(warehouse);
  });

  it('should find an entity by id', async () => {
    const warehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse);

    const savedWarehouse = await warehouseRepository.findByName(warehouse.getName());
    expect(savedWarehouse).toEqual(warehouse);
  });

  it('should find an entity by product id', async () => {
    const warehouse1 = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: '1',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
        {
          product: {
            id: '2',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
      ]
    });
    const warehouse2 = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: '1',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
        {
          product: {
            id: '4',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
      ]
    });
    const warehouse3 = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: '2',
            size: { width: 1, height: 1, length: 1 },
            isHazardous: true,
          },
          quantity: 1,
          importedAt: new Date(),
        },
      ]
    });
    await warehouseRepository.save(warehouse1);
    await warehouseRepository.save(warehouse2);
    await warehouseRepository.save(warehouse3);

    const foundWarehouses = await warehouseRepository.findAllByProductId('2');
    expect(foundWarehouses.length).toEqual(2);
    expect(foundWarehouses.map(w => w.id)).toEqual([warehouse1.id, warehouse3.id]);
  });

  it('should delete an entity', async () => {
    const warehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse);

    await warehouseRepository.delete(warehouse);

    expect(await warehouseRepository.findById(warehouse.id)).toBeNull();
  });

  it('should delete all entities', async () => {
    const warehouse1 = entityFactory.createWarehouse();
    const warehouse2 = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse1);
    await warehouseRepository.save(warehouse2);

    await warehouseRepository.deleteAll();

    expect((await warehouseRepository.findAll()).length).toBe(0);
  });

  it('should delete all entities', async () => {
    for (let i = 1; i <= 10; i++) {
      await warehouseRepository.save(entityFactory.createWarehouse({
        name: `Warehouse ${i}`,
      }));
    }

    const paginatedResult = await warehouseRepository.findAndCountByCriteria({
      limit: 2,
      page: 2,
    });

    expect(paginatedResult.total).toEqual(10);
    expect(paginatedResult.items.length).toEqual(2);
    expect(paginatedResult.items.map(entity => entity.getName())).toEqual([
      'Warehouse 3',
      'Warehouse 4',
    ]);
  });
});
