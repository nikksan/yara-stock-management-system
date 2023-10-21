import { Id } from '@domain/model/Entity';
import WarehouseRepository from '@domain/repository/WarehouseRepository';
import { SpaceStats } from '@domain/model/Warehouse';
import EntityNotFoundError from '@application/errors/EntityNotFoundError';

export default class GetWarehouseStatsQuery {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) { }

  async run(id: Id): Promise<SpaceStats> {
    const existingWarehouse = await this.warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new EntityNotFoundError('product', id);
    }

    return existingWarehouse.calculateSpaceStats();
  }
}
