import DTOGenerator, { WarehouseDTO } from "@application/service/DTOGenerator";
import WarehouseRepository from "@domain/repository/WarehouseRepository";

export default class ListWarehousesQuery {
  constructor(
    private warehouseRepository: WarehouseRepository,
  ) {}

  async run(): Promise<Array<WarehouseDTO>> {
    const warehouses = await this.warehouseRepository.findAll();
    return warehouses.map(warehouse => DTOGenerator.generateFromWarehouse(warehouse));
  }
}
