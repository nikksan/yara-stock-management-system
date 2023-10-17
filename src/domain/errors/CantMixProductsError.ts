export default class CantMixProductsError extends Error {
  constructor() {
    super('Cant mix hazardous and non-hazardous products');
  }
}
