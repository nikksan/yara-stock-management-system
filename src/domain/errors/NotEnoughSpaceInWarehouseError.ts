import { Id } from '@domain/model/Entity';

export default class NotEnoughSpaceInWarehouseError extends Error {
  constructor(public warehouseId: Id) {
    super(`There is no enough space in warehouse #${warehouseId}`);
  }
}
