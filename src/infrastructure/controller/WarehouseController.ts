import CreateWarehouseCommand, { Input as CreateWarehouseInput } from '@application/command/CreateWarehouseCommand';
import DeleteWarehouseCommand from '@application/command/DeleteWarehouseCommand';
import ExportProductFromWarehouseCommand, { Input as ExportProductFromWarehouseInput } from '@application/command/ExportProductFromWarehouseCommand';
import ImportProductToWarehouseCommand, { Input as ImportProductToWarehouseInput } from '@application/command/ImportProductToWarehouseCommand';
import GetWarehouseStatsQuery from '@application/query/GetWarehouseStatsQuery';
import ListWarehousesQuery from '@application/query/ListWarehousesQuery';
import { WarehouseDTO } from '@application/service/DTOGenerator';
import { Id } from '@domain/model/Entity';
import { SpaceStats } from '@domain/model/Warehouse';

export default class WarehouseController {
  constructor(
    private createWarehouseCommand: CreateWarehouseCommand,
    private deleteWarehouseCommand: DeleteWarehouseCommand,
    private exportProductFromWarehouseCommand: ExportProductFromWarehouseCommand,
    private importProductToWarehouseCommand: ImportProductToWarehouseCommand,

    private listWarehousesQuery: ListWarehousesQuery,
    private getWarehouseStatsQuery: GetWarehouseStatsQuery,
  ) {}

  async create(input: CreateWarehouseInput): Promise<Id> {
    return this.createWarehouseCommand.execute(input);
  }

  async delete(id: Id): Promise<void> {
    return this.deleteWarehouseCommand.execute(id);
  }

  async exportProduct(input: ExportProductFromWarehouseInput): Promise<void> {
    return this.exportProductFromWarehouseCommand.execute(input);
  }

  async importProduct(input: ImportProductToWarehouseInput): Promise<void> {
    return this.importProductToWarehouseCommand.execute(input);
  }

  async list(): Promise<Array<WarehouseDTO>> {
    return this.listWarehousesQuery.run();
  }

  async getStatus(warehouseId: Id): Promise<SpaceStats> {
    return this.getWarehouseStatsQuery.run(warehouseId);
  }
}
