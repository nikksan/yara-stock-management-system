import IdGenerator from './IdGenerator';

export type Id = string;

export type ConstructorParams = {
  id?: Id;
}

export default abstract class Entity {
  public readonly id: Id;

  constructor(params: ConstructorParams) {
    this.id = params.id || IdGenerator.generate();
  }
}
