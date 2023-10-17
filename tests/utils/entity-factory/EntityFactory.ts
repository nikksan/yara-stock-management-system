import { DeepPartial } from "ts-essentials";
import Product, { ConstructorParams as ProductConstructorParams } from '@domain/model/Product';
import Warehouse, { ConstructorParams as WarehouseConstructorParams } from '@domain/model/Warehouse';
import { assign } from "lodash";
import IdGenerator from "@domain/model/IdGenerator";

export default class EntityFactory {
  createProduct(override: DeepPartial<ProductConstructorParams> = {}): Product {
    const defaults = {
      id: IdGenerator.generate(),
      name: `Test product #${Date.now()}`,
      size: {
        width: 1,
        height: 1,
        length: 1,
      },
      isHazardous: false,
    };

    const params = assign(defaults, override);
    return new Product(params);
  }

  createWarehouse(override: DeepPartial<WarehouseConstructorParams> = {}): Warehouse {
    const defaults = {
      id: IdGenerator.generate(),
      name: `Test warehouse #${Date.now()}`,
      size: {
        width: 10,
        height: 10,
        length: 10,
      },
      inventory: [],
    };

    const params = assign(defaults, override);
    return new Warehouse(params);
  }
}
