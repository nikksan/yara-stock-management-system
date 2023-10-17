import Warehouse from "@domain/model/Warehouse";
import Repository from "./Repository";
import { Id } from "@domain/model/Entity";

interface WarehouseRepository extends Repository<Warehouse> {
  findByName(name: string): Promise<Warehouse | null>;
  findAllByProductId(id: Id): Promise<Array<Warehouse>>;
}

export default WarehouseRepository;
