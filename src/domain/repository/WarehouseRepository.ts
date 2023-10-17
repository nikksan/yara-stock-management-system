import Warehouse from "@domain/model/Warehouse";
import Repository from "./Repository";

interface WarehouseRepository extends Repository<Warehouse> {}

export default WarehouseRepository;
