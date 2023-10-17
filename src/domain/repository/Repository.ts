import Entity, { Id } from "@domain/model/Entity";

export type Paginated<E extends Entity> = {
  items: Array<E>,
  total: number,
}

export type PaginationOpts = {
  page: number,
  limit: number,
}

export interface Repository<E extends Entity> {
  save(entity: E): Promise<void>;
  delete(entity: E): Promise<boolean>;
  findAll(): Promise<Array<E>>;
  findAndCountByCriteria(opts: PaginationOpts): Promise<Paginated<E>>;
  findById(id: Id): Promise<E | null>;
  deleteAll(): Promise<void>;
}

export default Repository;
