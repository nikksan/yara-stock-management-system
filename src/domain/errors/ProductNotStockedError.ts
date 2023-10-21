import { Id } from '@domain/model/Entity';

export default class ProductNotStockedError extends Error {
  constructor(public productId: Id) {
    super(`Product #${productId} is not stocked`);
  }
}
