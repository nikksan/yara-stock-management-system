import ImportProductToWarehouseCommand from "@application/command/ImportProductToWarehouseCommand";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import InMemoryProductRepository from "../../../utils/in-memory-repos/InMemoryProductRepository";
import IdGenerator from "@domain/model/IdGenerator";
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import TypeValidationError from "@domain/model/validation/TypeValidationError";
import NotEnoughSpaceInWarehouseError from "@domain/errors/NotEnoughSpaceInWarehouseError";
import CantMixProductsError from "@domain/errors/CantMixProductsError";
import Warehouse from "@domain/model/Warehouse";
import EventEmitter from "@domain/event/EventEmitter";
import { EventType } from "@domain/event/Event";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { loadConfig } from "@config/index";

describe('ImportProductToWarehouseCommand', () => {
  const warehouseRepository = new InMemoryWarehouseRepository();
  const productRepository = new InMemoryProductRepository();
  const entityFactory = new EntityFactory();
  const config = loadConfig();
  const loggerFactory = new LoggerFactory(config.log);

  const command = new ImportProductToWarehouseCommand(
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
      await command.execute({
        productId: missingProductId,
        warehouseId: seededWarehouse.id,
        quantity: 3,
      });
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
      await command.execute({
        productId: seededProduct.id,
        warehouseId: missingWarehouseId,
        quantity: 3,
      });
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
      await command.execute({
        productId: seededProduct.id,
        warehouseId: seededWarehouse.id,
        quantity,
      });
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(TypeValidationError);
    expect((caughtErr as TypeValidationError).path).toEqual('quantity');
    expect((caughtErr as TypeValidationError).value).toEqual(quantity);
  });

  it('should throw TypeValidationError when the date is invalid', async () => {
    let caughtErr;
    try {
      await command.execute({
        productId: seededProduct.id,
        warehouseId: seededWarehouse.id,
        quantity: 1,
        date: new Date('no-such-thing')
      });
    } catch (err) {
      caughtErr = err;
    }

    expect(caughtErr).toBeInstanceOf(TypeValidationError);
    expect((caughtErr as TypeValidationError).path).toEqual('date');
  });

  it('should throw NotEnoughSpaceInWarehouseError when the warehouse does not have enough space for the product', async () => {
    const product2x2x2 = entityFactory.createProduct({
      size: {
        width: 2,
        height: 2,
        length: 2,
      }
    });
    await productRepository.save(product2x2x2);

    const fullWarehouse = entityFactory.createWarehouse({
      size: {
        width: 5,
        height: 5,
        length: 5,
      },
      inventory: [
        {
          product: {
            id: product2x2x2.id,
            isHazardous: product2x2x2.getIsHazardous(),
            size: product2x2x2.getSize()
          },
          importedAt: new Date(),
          quantity: 15,
        }
      ]
    });
    await warehouseRepository.save(fullWarehouse);

    await expect(command.execute({
      productId: product2x2x2.id,
      warehouseId: fullWarehouse.id,
      quantity: 1,
    })).rejects.toThrow(NotEnoughSpaceInWarehouseError);
  });

  it('should throw CantMixProductsError when trying to mix hazardous and non-hazardous products', async () => {
    const hazardousProduct = entityFactory.createProduct({
      isHazardous: true,
    });
    await productRepository.save(hazardousProduct);

    const nonHazardousProduct = entityFactory.createProduct({
      isHazardous: false,
    });
    await productRepository.save(nonHazardousProduct);

    const testWarehouse = entityFactory.createWarehouse({
      inventory: [
        {
          product: {
            id: nonHazardousProduct.id,
            isHazardous: nonHazardousProduct.getIsHazardous(),
            size: nonHazardousProduct.getSize()
          },
          importedAt: new Date(),
          quantity: 15,
        }
      ]
    });
    await warehouseRepository.save(testWarehouse);

    await expect(command.execute({
      productId: hazardousProduct.id,
      warehouseId: testWarehouse.id,
      quantity: 1,
    })).rejects.toThrow(CantMixProductsError);
  });

  it('should increase the product quantity in the inventory', async () => {
    const now = new Date();

    await command.execute({
      productId: seededProduct.id,
      warehouseId: seededWarehouse.id,
      quantity: 1,
      date: now,
    });

    const stockedWarehouse = await warehouseRepository.findById(seededWarehouse.id) as Warehouse;
    expect(stockedWarehouse.getInventory()).toEqual(expect.arrayContaining([{
      product: {
        id: seededProduct.id,
        size: seededProduct.getSize(),
        isHazardous: seededProduct.getIsHazardous(),
      },
      quantity: 1,
      importedAt: now,
    }]));
  });

  it('should emit domain event for the new import', async () => {
    const mockFn = jest.fn();
    EventEmitter.subscribe(mockFn);

    const now = new Date();
    await command.execute({
      productId: seededProduct.id,
      warehouseId: seededWarehouse.id,
      quantity: 1,
      date: now
    });

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
      type: EventType.ProductImported,
      data: {
        product: {
          id: seededProduct.id,
          name: seededProduct.getName(),
          size: seededProduct.getSize(),
          isHazardous: seededProduct.getIsHazardous(),
        },
        warehouse: {
          id: seededWarehouse.id,
          name: seededWarehouse.getName(),
        },
        quantity: 1,
        importedAt: now,
      }
    }));
  });
});
