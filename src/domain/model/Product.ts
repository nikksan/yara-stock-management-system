import Entity, { ConstructorParams as EntityConstructorParams, Id } from './Entity';
import Size from './Size';
import TypeValidator from './validation/TypeValidator';

export type ConstructorParams = EntityConstructorParams & {
  name: string,
  size: Size,
  isHazardous: boolean,
}

export default class Product extends Entity {
  private name: string;
  private size: Size;
  private isHazardous: boolean;

  constructor(params: ConstructorParams) {
    super(params);

    TypeValidator.validateSize(params.size);
    this.size = params.size;

    TypeValidator.validateName(params.name);
    this.name = params.name;

    this.isHazardous = params.isHazardous;
  }

  getName() {
    return this.name;
  }

  getSize() {
    return this.size;
  }

  getIsHazardous() {
    return this.isHazardous;
  }
}
