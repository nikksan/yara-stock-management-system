import Product from "@domain/model/Product";
import Size from "@domain/model/Size";
import Warehouse, { Inventory } from "@domain/model/Warehouse";

export type WarehouseDTO = {
  id: string,
  name: string,
  size: Size,
  inventory: Inventory,
}

export type ProductDTO = {
  id: string,
  name: string,
  size: Size,
  isHazardous: boolean,
}

export default class DTOGenerator {
  static generateFromWarehouse(warehouse: Warehouse): WarehouseDTO {
    return {
      id: warehouse.id,
      name: warehouse.getName(),
      size: warehouse.getSize(),
      inventory: warehouse.getInventory(),
    }
  }

  static generateFromProduct(product: Product): ProductDTO {
    return {
      id: product.id,
      name: product.getName(),
      size: product.getSize(),
      isHazardous: product.getIsHazardous(),
    }
  }
}
