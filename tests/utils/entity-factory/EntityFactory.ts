import { DeepPartial } from 'ts-essentials';
import Product, { ConstructorParams as ProductConstructorParams } from '@domain/model/Product';
import Warehouse, { ConstructorParams as WarehouseConstructorParams } from '@domain/model/Warehouse';
import { merge } from 'lodash';
import IdGenerator from '@domain/model/IdGenerator';

export default class EntityFactory {
  createProduct(override: DeepPartial<ProductConstructorParams> = {}): Product {
    const id = IdGenerator.generate();
    const defaults = {
      id,
      name: `Test product #${id}`,
      size: {
        width: 1,
        height: 1,
        length: 1,
      },
      isHazardous: false,
    };

    const params = merge(defaults, override);
    return new Product(params);
  }

  createWarehouse(override: DeepPartial<WarehouseConstructorParams> = {}): Warehouse {
    const id = IdGenerator.generate();
    const defaults = {
      id,
      name: `Test warehouse #${id}`,
      size: {
        width: 10,
        height: 10,
        length: 10,
      },
      inventory: [],
    };

    const params = merge(defaults, override);
    return new Warehouse(params);
  }
}
