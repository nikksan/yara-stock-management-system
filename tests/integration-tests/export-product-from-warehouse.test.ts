import HttpServer from '@infrastructure/server/HttpServer';
import container from '../../src/root';
import EntityFactory from '../utils/entity-factory/EntityFactory';
import WarehouseRepository from '@domain/repository/WarehouseRepository';
import assert from 'assert';
import ProductRepository from '@domain/repository/ProductRepository';
import IdGenerator from '@domain/model/IdGenerator';
import Warehouse from '@domain/model/Warehouse';
import AuditLog from '@domain/audit-log/AuditLog';
import { EventType } from '@domain/event/Event';

describe('Export product from warehouse', () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  const apolloServer = httpServer.getApolloServer();
  const warehouseRepository = container.resolve<WarehouseRepository>('warehouseRepository');
  const productRepository = container.resolve<ProductRepository>('productRepository');
  const auditLog = container.resolve<AuditLog>('auditLog');
  const entityFactory = new EntityFactory();

  afterAll(async () => {
    await warehouseRepository.deleteAll();
    await productRepository.deleteAll();
  });

  afterEach(() => auditLog.deleteAll());

  it('should fail with ENTITY_NOT_FOUND code when product is missing', async () => {
    const warehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
        }
      `,
      variables: {
        productId: IdGenerator.generate(),
        warehouseId: warehouse.id,
        quantity: 1,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'ENTITY_NOT_FOUND',
      details: expect.objectContaining({
        entityType: 'product',
      }),
    }));
  });

  it('should fail with ENTITY_NOT_FOUND code when warehouse is missing', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
        }
      `,
      variables: {
        productId: product.id,
        warehouseId: IdGenerator.generate(),
        quantity: 1,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'ENTITY_NOT_FOUND',
      details: expect.objectContaining({
        entityType: 'warehouse',
      }),
    }));
  });

  it.each([0, -1, 'test'])('should fail with TYPE_VALIDATION code when quantity is %s', async (quantity) => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse();
    await warehouseRepository.save(warehouse);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
        }
      `,
      variables: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'TYPE_VALIDATION',
    }));
  });

  it('should fail with PRODUCT_NOT_STOCKED code when product is not even present in the warehouse', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [],
    });
    await warehouseRepository.save(warehouse);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
        }
      `,
      variables: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 10,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'PRODUCT_NOT_STOCKED',
    }));
  });

  it('should fail with NOT_ENOUGH_QUANTITY code when product is not stocked in enough quantity in the warehouse', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 5,
        importedAt: new Date(),
      }],
    });
    await warehouseRepository.save(warehouse);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
        }
      `,
      variables: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 10,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'NOT_ENOUGH_QUANTITY',
    }));
  });

  it('should export the product from the warehouse when its all ok', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 5,
        importedAt: new Date(),
      }],
    });
    await warehouseRepository.save(warehouse);

    const response = await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
      }
      `,
      variables: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 5,
      },
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toBeUndefined();
    const updatedWarehouse = await warehouseRepository.findById(warehouse.id) as Warehouse;
    expect(updatedWarehouse.getInventory()).toEqual([]);
  });

  it('should store an event in the audit log', async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const warehouse = entityFactory.createWarehouse({
      inventory: [{
        product: {
          id: product.id,
          isHazardous: product.getIsHazardous(),
          size: product.getSize(),
        },
        quantity: 5,
        importedAt: new Date(),
      }],
    });
    await warehouseRepository.save(warehouse);

    await apolloServer.executeOperation({
      query: `
        mutation ExportProductFromWarehouse(
          $productId: ID!
          $warehouseId: ID!
          $quantity: Int!
        ) {
          exportProductFromWarehouse(
            productId: $productId
            warehouseId: $warehouseId
            quantity: $quantity
          )
      }
      `,
      variables: {
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 5,
      },
    });

    const events = await auditLog.search({
      types: [EventType.ProductExported],
    });

    expect(events.length).toEqual(1);
    expect(events[0].data.product.id).toEqual(product.id);
    expect(events[0].data.warehouse.id).toEqual(warehouse.id);
    expect(events[0].data.quantity).toEqual(5);
  });
});
