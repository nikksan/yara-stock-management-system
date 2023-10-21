import { loadConfig } from '@config/index';
// import { prepareDb } from "../../../../utils/dbSetup";
import SequelizeProductRepository from '@infrastructure/storage/sequelize/SequelizeProductRepository';
import { Sequelize } from 'sequelize';
import EntityFactory from '../../../../utils/entity-factory/EntityFactory';
import LoggerFactory from '@infrastructure/logger/LoggerFactory';

describe('SequelizeProductRepository', () => {
  const config = loadConfig();

  const loggerFactory = new LoggerFactory(config.log);
  const productRepository = new SequelizeProductRepository(
    new Sequelize(config.db),
    loggerFactory,
  );
  const entityFactory = new EntityFactory();

  afterEach(() => productRepository.deleteAll());

  it('should save an entity', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const savedProduct = await productRepository.findById(product.id);
    expect(savedProduct).toEqual(product);
  });

  it('should delete an entity', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    await productRepository.delete(product);

    expect(await productRepository.findById(product.id)).toBeNull();
  });

  it('should find an entity by name and size', async () => {
    const product1 = entityFactory.createProduct({
      name: 'some name',
      size: { width: 1, height: 1, length: 1 },
    });
    await productRepository.save(product1);

    const product2 = entityFactory.createProduct({
      name: 'another name',
      size: { width: 2, height: 2, length: 2 },
    });
    await productRepository.save(product2);

    const product3 = entityFactory.createProduct({
      name: 'some name',
      size: { width: 2, height: 2, length: 2 },
    });
    await productRepository.save(product3);

    expect(await productRepository.findByNameAndSize('some name', {
      width: 1,
      height: 1,
      length: 1,
    })).toEqual(product1);
  });

  it('should delete all entities', async () => {
    const product1 = entityFactory.createProduct();
    const product2 = entityFactory.createProduct();
    await productRepository.save(product1);
    await productRepository.save(product2);

    await productRepository.deleteAll();

    expect((await productRepository.findAll()).length).toBe(0);
  });

  it('should delete all entities', async () => {
    for (let i = 1; i <= 10; i++) {
      await productRepository.save(entityFactory.createProduct({
        name: `Product ${i}`,
      }));
    }

    const paginatedResult = await productRepository.findAndCountByCriteria({
      limit: 2,
      page: 2,
    });

    expect(paginatedResult.total).toEqual(10);
    expect(paginatedResult.items.length).toEqual(2);
    expect(paginatedResult.items.map((entity) => entity.getName())).toEqual([
      'Product 3',
      'Product 4',
    ]);
  });
});
