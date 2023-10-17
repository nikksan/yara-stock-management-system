import Warehouse from "@domain/model/Warehouse";
import InMemoryRepository from "./InMemoryRepository";
import WarehouseRepository from "@domain/repository/WarehouseRepository";
import { cloneDeep } from "lodash";

export default class InMemoryWarehouseRepository extends InMemoryRepository<Warehouse> implements WarehouseRepository {
  async findByName(name: string): Promise<Warehouse | null> {
    for (const [,warehouse] of this.entities) {
      if (warehouse.getName() === name) {
        return cloneDeep(warehouse);
      }
    }

    return null;
  }
}
