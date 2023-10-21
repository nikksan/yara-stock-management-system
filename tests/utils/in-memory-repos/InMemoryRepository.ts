import Entity from '@domain/model/Entity';
import Repository, { Paginated, PaginationOpts } from '@domain/repository/Repository';
import { cloneDeep } from 'lodash';

export default class InMemoryRepository<EntityType extends Entity> implements Repository<EntityType> {
  protected entities: Map<string, EntityType>;

  constructor() {
    this.entities = new Map<string, EntityType>();
  }

  async delete(entity: EntityType): Promise<boolean> {
    const id = entity.id;

    if (this.entities.has(id)) {
      this.entities.delete(id);
      return true;
    }

    return false;
  }

  async findAll(): Promise<Array<EntityType>> {
    return Array.from(this.entities.values());
  }

  async findById(id: string): Promise<EntityType | null> {
    const existingEntity = this.entities.get(id);
    return existingEntity ? cloneDeep(existingEntity) : null;
  }

  async save(entity: EntityType): Promise<void> {
    if (entity.id && this.entities.has(entity.id)) {
      this.updateEntity(entity);
      return;
    }

    this.createEntity(entity);
  }

  async deleteAll(): Promise<void> {
    this.entities.clear();
  }

  async findAndCountByCriteria(opts: PaginationOpts): Promise<Paginated<EntityType>> {
    const start = (opts.page - 1) * opts.limit;
    const end = start + opts.limit;

    const items = Array.from(this.entities.values())
      .slice(start, end)
      .map((el) => cloneDeep(el));

    return {
      items,
      total: this.entities.size,
    };
  }

  protected createEntity(entity: EntityType): void {
    const createdEntity = cloneDeep(entity);
    this.entities.set(createdEntity.id, createdEntity);
  }

  protected updateEntity(entity: EntityType): void {
    const updatedEntity = cloneDeep(entity);
    this.entities.set(updatedEntity.id, updatedEntity);
  }
}
