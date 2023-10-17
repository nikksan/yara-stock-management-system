import Warehouse from "@domain/model/Warehouse";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

export default class ListWarehousesQuery {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) {}

  async run(): Promise<Array<Warehouse>> {
    return [];
  }
}
