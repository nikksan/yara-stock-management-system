import { Id } from "@domain/model/Entity";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

type WarehouseStats = {
  id: Id,
  totalSpace: number,
  currentStockedSpace: number,
  futureStokedSpace: number,
  freeSpace: number,
}

export default class GetWarehouseStatsQuery {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) { }

  async run(): Promise<Array<WarehouseStats>> {
    return [];
  }
}
