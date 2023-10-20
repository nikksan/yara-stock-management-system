import HttpServer from '@infrastructure/server/HttpServer';
import container from '../../src/root';
import EntityFactory from '../utils/entity-factory/EntityFactory';
import ProductRepository from '@domain/repository/ProductRepository';
import assert from 'assert';
import { merge } from 'lodash';

describe('Create warehouse', () => {
  const httpServer = container.resolve<HttpServer>('httpServer');
  const apolloServer = httpServer.getApolloServer();
  const productRepository = container.resolve<ProductRepository>('productRepository');
  const entityFactory = new EntityFactory();

  function createVariable(override: Record<string, unknown> = {}) {
    const defaults = {
      name: 'Test Product' + Date.now(),
      size: {
        width: 15,
        height: 2,
        length: 15,
      },
      isHazardous: true,
    }

    return merge(defaults, override);
  }

  afterAll(() => productRepository.deleteAll());

  it.each([
    '',
    '    ',
    new Array(65).fill('a').join(''),
  ])('should fail with TYPE_VALIDATION code when trying to create product with name = "%s"', async (name) => {
    const response = await apolloServer.executeOperation({
      query: `
        mutation CreateProduct($name: String!, $size: SizeInput!, $isHazardous: Boolean!) {
          createProduct(name: $name, size: $size, isHazardous: $isHazardous)
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
    ])(`should fail with TYPE_VALIDATION code when trying to create product with size.${dimension} = "%s"`, async (size) => {
      const response = await apolloServer.executeOperation({
        query: `
          mutation CreateProduct($name: String!, $size: SizeInput!, $isHazardous: Boolean!) {
            createProduct(name: $name, size: $size, isHazardous: $isHazardous)
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

  it(`should fail with UNIQUE_CONSTRAINT code when product with the same name and size already exists`, async () => {
    const product = entityFactory.createProduct();
    await productRepository.save(product);

    const response = await apolloServer.executeOperation({
      query: `
        mutation CreateProduct($name: String!, $size: SizeInput!, $isHazardous: Boolean!) {
          createProduct(name: $name, size: $size, isHazardous: $isHazardous)
        }
      `,
      variables: createVariable({
        name: product.getName(),
        size: product.getSize(),
      })
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors?.length).toEqual(1);
    expect(response.body.singleResult.errors?.[0]).toEqual(expect.objectContaining({
      code: 'UNIQUE_CONSTRAINT',
      details: expect.objectContaining({
        path: 'name+size',
      })
    }));
  });

  it(`should create a product if everything is ok`, async () => {
    const response = await apolloServer.executeOperation({
      query: `
        mutation CreateProduct($name: String!, $size: SizeInput!, $isHazardous: Boolean!) {
          createProduct(name: $name, size: $size, isHazardous: $isHazardous)
        }
      `,
      variables: createVariable()
    });

    assert(response.body.kind === 'single');
    expect(response.body.singleResult.errors).toBeUndefined();
    const productId = response.body.singleResult.data?.createProduct;
    assert(typeof productId === 'string');
    expect(await productRepository.findById(productId)).toBeTruthy();
  });
});
