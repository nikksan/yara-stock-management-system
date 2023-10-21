import ListProductsQuery from '@application/query/ListProductsQuery';
import EntityFactory from '../../../utils/entity-factory/EntityFactory';
import InMemoryProductRepository from '../../../utils/in-memory-repos/InMemoryProductRepository';

describe('ListProductsQuery', () => {
  const productRepository = new InMemoryProductRepository();
  const entityFactory = new EntityFactory();

  const query = new ListProductsQuery(
    productRepository,
  );

  afterEach(async () => {
    await productRepository.deleteAll();
  });

  it('should return correct total', async () => {
    for (let i = 0; i < 10; i++) {
      await productRepository.save(entityFactory.createProduct());
    }

    const { total } = await query.run({ page: 1, limit: 20 });

    expect(total).toEqual(10);
  });

  it('should return correct items', async () => {
    for (let i = 1; i <= 10; i++) {
      await productRepository.save(entityFactory.createProduct({
        name: 'p' + i,
      }));
    }

    const { items } = await query.run({ page: 2, limit: 3 });

    expect(items.length).toEqual(3);
    expect(items[0].name).toEqual('p4');
    expect(items[1].name).toEqual('p5');
    expect(items[2].name).toEqual('p6');
  });
});
