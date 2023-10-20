import HttpServer from '@infrastructure/server/HttpServer';
import container from '../../src/root';
import EntityFactory from '../utils/entity-factory/EntityFactory';
import WarehouseRepository from '@domain/repository/WarehouseRepository';
import assert from 'assert';
import { merge } from 'lodash';

describe('Create warehouse', () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  const apolloServer = httpServer.getApolloServer();
  const warehouseRepository = container.resolve<WarehouseRepository>('warehouseRepository');
  const entityFactory = new EntityFactory();

  function createVariable(override: Record<string, unknown> = {}) {
    const defaults = {
      name: 'Test Warehouse' + Date.now(),
      size: {
        width: 15,
        height: 2,
        length: 15,
      }
    }

    return merge(defaults, override);
  }

  afterAll(() => warehouseRepository.deleteAll());

  it.each([
    '',
    '    ',
    new Array(65).fill('a').join(''),
  ])('should fail with TYPE_VALIDATION code when trying to create warehouse with name = "%s"', async (name) => {
    const response = await apolloServer.executeOperation({
      query: `
        mutation Mutation($name: String!, $size: SizeInput!) {
          createWarehouse(name: $name, size: $size)
        }
      `,
      variables: createVariable({ name })
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'TYPE_VALIDATION',
      details: expect.objectContaining({
        path: 'name',
        value: name,
      })
    }));
  });

  for (const dimension of ['width', 'height', 'length']) {
    it.each([
      -1, 0
    ])(`should fail with TYPE_VALIDATION code when trying to create warehouse with size.${dimension} = "%s"`, async (size) => {
      const response = await apolloServer.executeOperation({
        query: `
          mutation Mutation($name: String!, $size: SizeInput!) {
            createWarehouse(name: $name, size: $size)
          }
        `,
        variables: createVariable({ size: { [dimension]: size } })
      });

      assert(response.body.kind === 'single');
      expect(response.body.singleResult.errors?.length).toEqual(1);
      expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
        code: 'TYPE_VALIDATION',
        details: expect.objectContaining({
          path: 'size.' + dimension,
          value: size,
        })
      }));
    });
  }

  it('should fail with UNIQUE_CONSTRAINT code when warehouse with the same name already exists', async () => {
    await warehouseRepository.save(entityFactory.createWarehouse({
      name: 'Test Warehouse'
    }));

    const response = await apolloServer.executeOperation({
      query: `
        mutation Mutation($name: String!, $size: SizeInput!) {
          createWarehouse(name: $name, size: $size)
        }
      `,
      variables: createVariable({ name: 'Test Warehouse' })
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'UNIQUE_CONSTRAINT',
      details: expect.objectContaining({
        path: 'name',
      })
    }));
  });

  it('should create a warehouse if everything is ok', async () => {
    const response = await apolloServer.executeOperation({
      query: `
        mutation Mutation($name: String!, $size: SizeInput!) {
          createWarehouse(name: $name, size: $size)
        }
      `,
      variables: createVariable()
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    const warehouseId = response.body.singleResult.data?.createWarehouse;
    assert(typeof warehouseId === 'string');
    expect(await warehouseRepository.findById(warehouseId)).toBeTruthy();
  });
});
