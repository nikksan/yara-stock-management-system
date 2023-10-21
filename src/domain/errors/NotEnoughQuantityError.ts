import { Id } from '@domain/model/Entity';

export default class NotEnoughQuantityError extends Error {
  constructor(
    public productId: Id,
    public warehouseId: Id,
    public requestedQuantity: number,
    public availableQuantity: number,
  ) {
    super(`There is no enough quantity of product #${productId} in warehouse ${warehouseId}. Tries to request ${requestedQuantity}, while there are only ${availableQuantity}`);
  }
}
