import Entity, { Id } from "@domain/model/Entity";

export interface Repository<E extends Entity> {
  save(entity: E): Promise<void>;
  delete(entity: E): Promise<boolean>;
  findAll(): Promise<Array<E>>;
  findById(id: Id): Promise<E | null>;
  deleteAll(): Promise<void>;
}

export default Repository;
