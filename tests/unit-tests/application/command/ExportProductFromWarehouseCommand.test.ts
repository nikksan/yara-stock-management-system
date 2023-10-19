import ExportProductFromWarehouseCommand from "@application/command/ExportProductFromWarehouseCommand";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import InMemoryProductRepository from "../../../utils/in-memory-repos/InMemoryProductRepository";
import IdGenerator from "@domain/model/IdGenerator";
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import TypeValidationError from "@domain/model/validation/TypeValidationError";
import Warehouse from "@domain/model/Warehouse";
import EventEmitter from "@domain/event/EventEmitter";
import { EventType } from "@domain/event/Event";
import ProductNotStockedError from "@domain/errors/ProductNotStockedError";
import NotEnoughQuantityError from "@domain/errors/NotEnoughQuantityError";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { loadConfig } from "@config/index";

describe('ExportProductFromWarehouseCommand', () => {
  const warehouseRepository = new InMemoryWarehouseRepository();
  const productRepository = new InMemoryProductRepository();
  const entityFactory = new EntityFactory();
  const config = loadConfig();
  const loggerFactory = new LoggerFactory(config.log);

  const command = new ExportProductFromWarehouseCommand(
    warehouseRepository,
    productRepository,
    loggerFactory,
  );

  const seededProduct = entityFactory.createProduct();
  const seededWarehouse = entityFactory.createWarehouse();

  beforeEach(async () => {
    await productRepository.save(seededProduct);
    await warehouseRepository.save(seededWarehouse);
  });

  afterEach(async () => {
    await productRepository.deleteAll();
    await warehouseRepository.deleteAll();
  });

  it('should throw EntityNotFoundError when the product does not exist', async () => {
    const missingProductId = IdGenerator.generate();

    let caughtErr;
    try {
      await command.execute(missingProductId, seededWarehouse.id, 3);
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(EntityNotFoundError);
    expect((caughtErr as EntityNotFoundError).entityType).toEqual('product');
    expect((caughtErr as EntityNotFoundError).id).toEqual(missingProductId);
  });

  it('should throw EntityNotFoundError when the warehouse does not exist', async () => {
    const missingWarehouseId = IdGenerator.generate();

    let caughtErr;
    try {
      await command.execute(seededProduct.id, missingWarehouseId, 3);
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(EntityNotFoundError);
    expect((caughtErr as EntityNotFoundError).entityType).toEqual('warehouse');
    expect((caughtErr as EntityNotFoundError).id).toEqual(missingWarehouseId);
  });

  it.each([-1, 0])('should throw TypeValidationError when the quantity is negative or zero (%s)', async (quantity) => {
    let caughtErr;
    try {
      await command.execute(seededProduct.id, seededWarehouse.id, quantity);
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(TypeValidationError);
    expect((caughtErr as TypeValidationError).path).toEqual('quantity');
    expect((caughtErr as TypeValidationError).value).toEqual(quantity);
  });

  it('should throw ProductNotStockedError when the requested product is not event present in the warehouse inventory', async () => {
    const emptyWarehouse = entityFactory.createWarehouse({
      inventory: [],
    });
    await warehouseRepository.save(emptyWarehouse);

    await expect(command.execute(seededProduct.id, emptyWarehouse.id, 1)).rejects.toThrow(ProductNotStockedError);
  });

  it('should throw ProductNotStockedError when the requested product is not event present in the warehouse inventory', async () => {
    const emptyWarehouse = entityFactory.createWarehouse({
      inventory: [],
    });
    await warehouseRepository.save(emptyWarehouse);

    await expect(command.execute(seededProduct.id, emptyWarehouse.id, 1)).rejects.toThrow(ProductNotStockedError);
  });

  it('should throw NotEnoughQuantityError when the requested quantity exceeds the supply', async () => {
    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: new Date()
        }
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await expect(command.execute(testProduct.id, testWarehouse.id, 10)).rejects.toThrow(NotEnoughQuantityError);
  });

  it('should throw NotEnoughQuantityError when the requested quantity exceeds the current supply (future supply is OK)', async () => {
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: new Date()
        },
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 7,
          importedAt: tomorrow,
        }
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await expect(command.execute(testProduct.id, testWarehouse.id, 10)).rejects.toThrow(NotEnoughQuantityError);
  });

  it('should decease the quantity of the item (product remains in stock)', async () => {
    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const now = new Date();
    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: now,
        },
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await command.execute(testProduct.id, testWarehouse.id, 3);

    const warehouseAfterTheExport = await warehouseRepository.findById(testWarehouse.id) as Warehouse;
    expect(warehouseAfterTheExport.getInventory()).toEqual([
      {
        product: {
          id: testProduct.id,
          isHazardous: testProduct.getIsHazardous(),
          size: testProduct.getSize(),
        },
        quantity: 2,
        importedAt: now,
      },
    ]);
  });

  it('should decease the quantity of the item (product is no longer in stock)', async () => {
    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const now = new Date();
    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: now,
        },
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await command.execute(testProduct.id, testWarehouse.id, 5);

    const warehouseAfterTheExport = await warehouseRepository.findById(testWarehouse.id) as Warehouse;
    expect(warehouseAfterTheExport.getInventory()).toEqual([]);
  });

  it('should decease the quantity of the product (clearing older imports first)', async () => {
    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const now = new Date();
    const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: now,
        },
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: yesterday,
        },
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await command.execute(testProduct.id, testWarehouse.id, 6);

    const warehouseAfterTheExport = await warehouseRepository.findById(testWarehouse.id) as Warehouse;
    expect(warehouseAfterTheExport.getInventory()).toEqual([
      {
        product: {
          id: testProduct.id,
          isHazardous: testProduct.getIsHazardous(),
          size: testProduct.getSize(),
        },
        quantity: 4,
        importedAt: now,
      },
    ]);
  });

  it('should emit domain event for the new import', async () => {
    const mockFn = jest.fn();
    EventEmitter.subscribe(mockFn);

    const testProduct = entityFactory.createProduct();
    await productRepository.save(testProduct);

    const now = new Date();
    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: testProduct.id,
            isHazardous: testProduct.getIsHazardous(),
            size: testProduct.getSize(),
          },
          quantity: 5,
          importedAt: now,
        },
      ],
    });
    await warehouseRepository.save(testWarehouse);

    await command.execute(testProduct.id, testWarehouse.id, 3);

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
      type: EventType.ProductExported,
      data: {
        product: {
          id: testProduct.id,
          name: testProduct.getName(),
          size: testProduct.getSize(),
          isHazardous: testProduct.getIsHazardous(),
        },
        warehouse: {
          id: testWarehouse.id,
          name: testWarehouse.getName(),
        },
        quantity: 3,
      }
    }));
  });
});
