import CreateProductCommand from "@application/command/CreateProductCommand";
import InMemoryProductRepository from "../../../utils/in-memory-repos/InMemoryProductRepository";
import EntityFactory from "../../../utils/entity-factory/EntityFactory";
import UniqueConstraintError from "@application/errors/UniqueConstraintError";
import TypeValidationError from "@domain/model/validation/TypeValidationError";
import Product from "@domain/model/Product";
import LoggerFactory from "@infrastructure/logger/LoggerFactory";
import { loadConfig } from "@config/index";

describe('CreateProductCommand', () => {
  const productRepository = new InMemoryProductRepository();
  const entityFactory = new EntityFactory();
  const config = loadConfig();
  const loggerFactory = new LoggerFactory(config.log);

  const command = new CreateProductCommand(
    productRepository,
    loggerFactory,
  );

  afterEach(async () => {
    await productRepository.deleteAll();
  });

  it('should throw UniqueConstraintError when a product with the same name and size already exists', async () => {
    const existingProduct = entityFactory.createProduct();
    await productRepository.save(existingProduct);

    await expect(command.execute({
      name: existingProduct.getName(),
      size: existingProduct.getSize(),
      isHazardous: true,
    })).rejects.toThrow(UniqueConstraintError);
  });

  it.each(['', '   '])('should throw TypeValidationError when name is "%s"', async (name) => {
    let caughtErr;

    try {
      await command.execute({
        name,
        size: {
          height: 1,
          length: 1,
          width: 1,
        },
        isHazardous: true,
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
          name: 'Test Product',
          size: {
            height: 1,
            length: 1,
            width: 1,
            [dimension]: value,
          },
          isHazardous: true,
        });
      } catch (err) {
        caughtErr = err;
      }

      expect(caughtErr).toBeInstanceOf(TypeValidationError);
      expect((caughtErr as TypeValidationError).path).toEqual(`size.${dimension}`);
      expect((caughtErr as TypeValidationError).value).toEqual(value);
    });
  }

  it('should create a product and store it in the repo', async () => {
    const productId = await command.execute({
      name: 'Test Product',
      size: {
        height: 1,
        length: 1,
        width: 1,
      },
      isHazardous: true,
    });

    const product = await productRepository.findById(productId);
    expect(product).toBeInstanceOf(Product);
    expect((product as Product).getName()).toEqual('Test Product');
    expect((product as Product).getSize()).toEqual({
      height: 1,
      length: 1,
      width: 1,
    });
    expect((product as Product).getIsHazardous()).toEqual(true);
  });
});
