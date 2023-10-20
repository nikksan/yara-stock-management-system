import HttpServer from '@infrastructure/server/HttpServer';
import container from '../../src/root';
import EntityFactory from '../utils/entity-factory/EntityFactory';
import WarehouseRepository from '@domain/repository/WarehouseRepository';
import assert from 'assert';

describe('List warehouses', () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  const apolloServer = httpServer.getApolloServer();
  const warehouseRepository = container.resolve<WarehouseRepository>('warehouseRepository');
  const entityFactory = new EntityFactory();

  afterAll(() => warehouseRepository.deleteAll());

  it('should list warehouses', async () => {
    const testWarehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(testWarehouse);

    const response = await apolloServer.executeOperation({
      query: `
        query ListWarehouses {
          listWarehouses {
            id
            name
            size {
              width
              height
              length
            }
            inventory {
              importedAt
              product {
                size {
                  height
                  length
                  width
                }
              }
            }
          }
        }
      `,
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.data?.listWarehouses).toEqual([{
      id: testWarehouse.id,
      name: testWarehouse.getName(),
      size: testWarehouse.getSize(),
      inventory: testWarehouse.getInventory(),
    }]);
  });
});
