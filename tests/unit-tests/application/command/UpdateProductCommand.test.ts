import UpdateProductCommand from "@application/command/UpdateProductCommand";
import InMemoryProductRepository from "../../../utils/in-memory-repos/InMemoryProductRepository";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import IdGenerator from "@domain/model/IdGenerator";
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import OperationForbiddenError from "@application/errors/OperationForbiddenError";
import Product from "@domain/model/Product";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { loadConfig } from "@config/index";

describe('UpdateProductCommand', () => {
  const productRepository = new InMemoryProductRepository();
  const warehouseRepository = new InMemoryWarehouseRepository();
  const entityFactory = new EntityFactory();
  const config = loadConfig();
  const loggerFactory = new LoggerFactory(config.log);

  const command = new UpdateProductCommand(
    warehouseRepository,
    productRepository,
    loggerFactory,
  );

  it('should throw EntityNotFoundError when a product does not exist', async () => {
    await expect(command.execute({
      id: IdGenerator.generate(),
    })).rejects.toThrow(EntityNotFoundError);
  });

  it('should throw OperationForbiddenError when trying to update product.size and the product is already stocked in a warehouse', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        importedAt: new Date(),
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 3,
      }]
    });
    await warehouseRepository.save(warehouse);

    const productSize = product.getSize();
    await expect(command.execute({
      id: product.id,
      size: {
        ...productSize,
        height: productSize.height + 1,
      }
    })).rejects.toThrow(OperationForbiddenError);
  });

  it('should throw OperationForbiddenError when trying to update product.isHazardous and the product is already stocked in a warehouse', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        importedAt: new Date(),
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 3,
      }]
    });
    await warehouseRepository.save(warehouse);

    await expect(command.execute({
      id: product.id,
      isHazardous: !product.getIsHazardous(),
    })).rejects.toThrow(OperationForbiddenError);
  });

  it('should update product.size', async () => {
    const product = entityFactory.createProduct({
      size: {
        height: 1,
        width: 1,
        length: 1,
      }
    });
    await productRepository.save(product);

    await command.execute({
      id: product.id,
      size: {
        height: 2,
        width: 1,
        length: 1,
      }
    });

    const updatedProduct = await productRepository.findById(product.id) as Product;
    expect(await updatedProduct.getSize().height).toEqual(2);
  });

  it('should update product.isHazardous', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);
    const newValue = !product.getIsHazardous();

    await command.execute({
      id: product.id,
      isHazardous: newValue,
    });

    const updatedProduct = await productRepository.findById(product.id) as Product;
    expect(await updatedProduct.getIsHazardous()).toEqual(newValue);
  });

  it('should update product.name', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);
    const newValue = product.getName() + '-v2';

    await command.execute({
      id: product.id,
      name: newValue,
    });

    const updatedProduct = await productRepository.findById(product.id) as Product;
    expect(await updatedProduct.getName()).toEqual(newValue);
  });

  it('should allow updating of product.name despite product being stocked', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        importedAt: new Date(),
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 3,
      }]
    });
    await warehouseRepository.save(warehouse);
    const newValue = product.getName() + '-v2';

    await command.execute({
      id: product.id,
      name: newValue,
    });

    const updatedProduct = await productRepository.findById(product.id) as Product;
    expect(await updatedProduct.getName()).toEqual(newValue);
  });
});
