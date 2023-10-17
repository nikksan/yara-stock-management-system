import Warehouse from "@domain/model/Warehouse";
import Repository from "./Repository";

interface WarehouseRepository extends Repository<Warehouse> {
  findByName(name: string): Promise<Warehouse | null>;
}

export default WarehouseRepository;
