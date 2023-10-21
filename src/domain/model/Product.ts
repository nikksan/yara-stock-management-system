import Entity, { ConstructorParams as EntityConstructorParams } from './Entity';
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

  getName(): string {
    return this.name;
  }

  getSize(): Size {
    return this.size;
  }

  getIsHazardous(): boolean {
    return this.isHazardous;
  }

  changeSize(size: Size): void {
    TypeValidator.validateSize(size);

    this.size = size;
  }

  changeName(name: string): void {
    TypeValidator.validateName(name);

    this.name = name;
  }

  changeIsHazardous(isHazardous: boolean): void {
    this.isHazardous = isHazardous;
  }
}
