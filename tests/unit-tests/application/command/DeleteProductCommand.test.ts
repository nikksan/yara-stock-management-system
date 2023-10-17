import DeleteProductCommand from "@application/command/DeleteProductCommand";
import InMemoryProductRepository from "../../../utils/in-memory-repos/InMemoryProductRepository";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import InMemoryWarehouseRepository from "../../../utils/in-memory-repos/InMemoryWarehouseRepository";
import IdGenerator from "@domain/model/IdGenerator";
import EntityNotFoundError from "@application/errors/EntityNotFoundError";
import OperationForbiddenError from "@application/errors/OperationForbiddenError";

describe('DeleteProductCommand', () => {
  const productRepository = new InMemoryProductRepository();
  const warehouseRepository = new InMemoryWarehouseRepository();
  const entityFactory = new EntityFactory();

  const command = new DeleteProductCommand(
    warehouseRepository,
    productRepository,
  );

  it('should throw EntityNotFoundError when a product does not exist', async () => {
    await expect(command.execute(IdGenerator.generate())).rejects.toThrow(EntityNotFoundError);
  });

  it('should throw OperationForbiddenError when trying to delete a product which is already stocked in a warehouse', async () => {
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

    await expect(command.execute(product.id)).rejects.toThrow(OperationForbiddenError);
  });

  it('should delete a product from the repo', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    await command.execute(product.id);

    expect(await productRepository.findById(product.id)).toBeNull();
  });
});
